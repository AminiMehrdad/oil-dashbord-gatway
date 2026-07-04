import { Injectable } from '@nestjs/common';
import { pubSub } from './pubsub.service';

export type LatestDataMessage = {
  latest?: unknown;
  latest30?: unknown;
  latest30name?: unknown;
  allwells?: unknown;
  date?: unknown;
  wellPage?: unknown;
};

@Injectable()
export class RealtimeService {
  async publishLatestData(data: LatestDataMessage) {
    const { latest, latest30, latest30name, allwells, date, wellPage } = data;

    await pubSub.publish('LATEST_DATA_UPDATED', {
      latestDataUpdated: {
        latest,
        latest30,
        latest30name,
        allwells,
        date,
        wellPage,
      },
    });
  }
}
