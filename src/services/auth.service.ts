import { Injectable } from "@nestjs/common";
import { CreateUserInput } from "src/models/auth/create-user.input";
import { AuthPayload } from "src/models/auth/auth-payload.model";
import { LoginInput } from "src/models/auth/login.input";
import { User } from "src/models/auth/user.model";
import { RabbitMQService } from "./rabbitmq.service";
import { CreatedUser } from "src/models/auth/create-user.output";
import { LogOutUser } from "src/models/auth/logout-user.output";

@Injectable()
export class AuthService {
  constructor(private readonly rmq: RabbitMQService) { }

  async createUser(createUserInput: CreateUserInput): Promise<CreatedUser> {
    return this.rmq.requestJson<CreatedUser>("auth.createUser", createUserInput, 10_000);
  }

  async login(loginInput: LoginInput): Promise<AuthPayload> {
    const payload =  { username: loginInput.emailOrPhone, password: loginInput.password }
    return this.rmq.requestJson<AuthPayload>("auth.login", payload, 10_000);
  }

  async logout(refreshToken: string): Promise<LogOutUser> {
    return this.rmq.requestJson<LogOutUser>("auth.logout", { refresh: refreshToken }, 10_000);
  }
}
