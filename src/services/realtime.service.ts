import { Injectable } from "@nestjs/common";
import { pubSub } from "./pubsub.service";

@Injectable()
export class RealtimeService {

 async publishLatestData(data: any) {

  const { latest, latest30, latest30name, allwells, date, wellPage } = data;


  await pubSub.publish("LATEST_DATA_UPDATED", {
    latestDataUpdated: {
      latest,
      latest30,
      latest30name,
      allwells,
      date,
      wellPage
    }
  });

}
}
