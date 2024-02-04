import Realm from "realm";

import { HeartBeat } from "./schemas/HeartBeat";
import { Position } from "./schemas/Position";
import { LogError } from "./schemas/LogError";

export const realmConfig: Realm.Configuration = {
  path: "olivia-app",
  schema: [HeartBeat, Position, LogError],
  schemaVersion: 8,
};
