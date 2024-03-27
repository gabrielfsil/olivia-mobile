import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { connectionAndMonitoringService } from "./tasks/ConnectionAndMonitoringService";

const BACKGROUND_CONNECTION_MONITORING =
  "BackgroundServiceConnectionAndMonitoring";

TaskManager.defineTask(BACKGROUND_CONNECTION_MONITORING, async () => {
  try {
    await connectionAndMonitoringService();

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// const BACKGROUND_UPDATE_MODEL = "BackgroundServiceUpdateModel";

// TaskManager.defineTask(BACKGROUND_UPDATE_MODEL, async () => {
//   try {
//     await updateModelFileService();

//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   } catch (err) {
//     return BackgroundFetch.BackgroundFetchResult.Failed;
//   }
// });

// const BACKGROUND_PREDICT_HEART_BEAT = "BackgroundServicePredictHeartBeat";

// TaskManager.defineTask(BACKGROUND_PREDICT_HEART_BEAT, async () => {
//   try {
//     await predictHeartBeatService();

//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   } catch (err) {
//     return BackgroundFetch.BackgroundFetchResult.Failed;
//   }
// });

export async function registerBackgroundFetchAsync() {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_CONNECTION_MONITORING, {
    minimumInterval: 5,
    stopOnTerminate: false,
    startOnBoot: true,
  });

  // await BackgroundFetch.registerTaskAsync(BACKGROUND_UPDATE_MODEL, {
  //   minimumInterval: 60 * 60 * 24 * 7,
  //   stopOnTerminate: false,
  //   startOnBoot: true,
  // });

  // await BackgroundFetch.registerTaskAsync(BACKGROUND_PREDICT_HEART_BEAT, {
  //   minimumInterval: 10,
  //   stopOnTerminate: false,
  //   startOnBoot: true,
  // });
}

export async function checkStatusAsync() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_CONNECTION_MONITORING
    );

    await TaskManager.getRegisteredTasksAsync();

    if (!isRegistered) {
      await registerBackgroundFetchAsync();
    }
  } catch (err) {
    console.log(err);
  }
}
