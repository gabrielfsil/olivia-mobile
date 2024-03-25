import Realm from "realm";

import { HeartBeat } from "./schemas/HeartBeat";
import { Position } from "./schemas/Position";
import { LogError } from "./schemas/LogError";
import { Execution } from "./schemas/Execution";

export const realmConfig: Realm.Configuration = {
  path: "olivia-app",
  schema: [HeartBeat, Position, LogError,Execution],
  schemaVersion: 9,
};
