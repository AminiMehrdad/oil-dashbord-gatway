import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { LatestDataMessage, RealtimeService } from './realtime.service';

type AmqpMessage = {
  properties: {
    correlationId?: string;
  };
  content: Buffer;
};

type AmqpChannel = {
  assertExchange(
    exchange: string,
    type: string,
    options: { durable: boolean },
  ): Promise<unknown>;
  assertQueue(
    queue: string,
    options: { exclusive?: boolean; durable?: boolean },
  ): Promise<{ queue: string }>;
  bindQueue(queue: string, exchange: string, pattern: string): Promise<unknown>;
  consume(
    queue: string,
    onMessage: (message: AmqpMessage | null) => void | Promise<void>,
    options: { noAck: boolean },
  ): Promise<unknown>;
  publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options: {
      correlationId: string;
      replyTo: string;
      contentType: string;
      persistent: boolean;
    },
  ): boolean;
  ack(message: AmqpMessage): void;
  close(): Promise<void>;
};

type AmqpConnection = {
  createChannel(): Promise<AmqpChannel>;
  on(event: 'error', listener: (error: Error) => void): void;
  on(event: 'close', listener: () => void): void;
  close(): Promise<void>;
};

type AmqpClient = {
  connect(url: string): Promise<AmqpConnection>;
};

const amqpClient = amqp as unknown as AmqpClient;

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly exchange = 'app.exchange';
  private readonly gatewayQueue = 'gateway_queue';
  private connection: AmqpConnection;
  private channel: AmqpChannel;
  private replyQueue: string;
  private readonly pending = new Map<
    string,
    {
      resolve: (v: string) => void;
      reject: (e: Error) => void;
      timer: NodeJS.Timeout;
    }
  >();

  constructor(
    private readonly config: ConfigService,
    private readonly realtime: RealtimeService,
  ) {}

  async onModuleInit() {
    const url =
      this.config.get<string>('RABBITMQ_URL') ||
      'amqp://admin:admin123@localhost:5672';

    this.connection = await amqpClient.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchange, 'topic', {
      durable: true,
    });

    // exclusive reply queue — موقت و اختصاصی این instance
    const q = await this.channel.assertQueue('', { exclusive: true });
    this.replyQueue = q.queue;

    this.logger.log(`Reply queue: ${this.replyQueue}`);

    await this.channel.consume(
      this.replyQueue,
      (msg) => {
        if (!msg) return;
        const id = msg.properties.correlationId;
        if (!id) return;
        const entry = this.pending.get(id);
        if (!entry) return;

        clearTimeout(entry.timer);
        this.pending.delete(id);
        entry.resolve(msg.content.toString());
      },
      { noAck: true },
    );
    await this.consumeGatewayMessages();

    // handle connection errors
    this.connection.on('error', (err) =>
      this.logger.error('RabbitMQ connection error', err),
    );
    this.connection.on('close', () =>
      this.logger.warn('RabbitMQ connection closed'),
    );
  }

  async request(
    routingKey: string,
    payload: unknown,
    timeoutMs = 10_000,
  ): Promise<string> {
    const correlationId = uuidv4();
    this.logger.log(
      `[REQUEST START] routingKey=${routingKey}, correlationId=${correlationId}`,
    );

    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(correlationId);
        this.logger.error(
          `[TIMEOUT] routingKey=${routingKey}, correlationId=${correlationId}`,
        );
        reject(
          new Error(
            `RabbitMQ timeout for routingKey="${routingKey}" after ${timeoutMs}ms`,
          ),
        );
      }, timeoutMs);

      this.pending.set(correlationId, {
        resolve: (v: string) => {
          this.logger.log(
            `[RESOLVED] routingKey=${routingKey}, correlationId=${correlationId}`,
          );
          (resolve as (v: string) => void)(v);
        },
        reject,
        timer,
      });

      const ok = this.channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        {
          correlationId,
          replyTo: this.replyQueue,
          contentType: 'application/json',
          persistent: true,
        },
      );

      this.logger.log(
        `[PUBLISHED] routingKey=${routingKey}, correlationId=${correlationId}, ok=${ok}`,
      );
    });
  }

  async requestJson<T>(
    routingKey: string,
    payload: unknown,
    timeoutMs = 10_000,
  ): Promise<T> {
    const response = await this.request(routingKey, payload, timeoutMs);
    const sanitized = response.replace(/\bNaN\b/g, 'null');
    return JSON.parse(sanitized) as T;
  }

  private async consumeGatewayMessages() {
    await this.channel.assertQueue(this.gatewayQueue, { durable: true });

    await this.channel.bindQueue(this.gatewayQueue, this.exchange, 'gateway.*');

    this.logger.log(`[GatewayConsumer] Listening on gateway.*`);

    await this.channel.consume(
      this.gatewayQueue,
      async (msg) => {
        if (!msg) return;

        try {
          const content = msg.content.toString();

          const message = content.replace(/\bNaN\b/g, 'null');

          const parsed = JSON.parse(message) as LatestDataMessage;

          await this.realtime.publishLatestData(parsed);
        } catch (err) {
          this.logger.error('Error handling gateway message', err);
        } finally {
          this.channel.ack(msg);
        }
      },
      { noAck: false },
    );
  }

  async onModuleDestroy() {
    for (const [, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.reject(new Error('Service shutting down'));
    }
    await this.channel?.close();
    await this.connection?.close();
  }
}
