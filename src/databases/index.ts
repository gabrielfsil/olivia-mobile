import Realm from "realm";

import { HeartBeat } from "./schemas/HeartBeat";
import { User } from "./schemas/User";
import { Position } from "./schemas/Position";

export const realmConfig: Realm.Configuration = {
  path: "olivia-app",
  schema: [HeartBeat, User, Position],
  schemaVersion: 2,
};
