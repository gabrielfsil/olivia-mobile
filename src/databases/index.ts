import Realm from "realm";

import { HeartBeat } from "./schemas/HeartBeat";
import { Position } from "./schemas/Position";

export const realmConfig: Realm.Configuration = {
  path: "olivia-app",
  schema: [HeartBeat, Position],
  schemaVersion: 7,
};
