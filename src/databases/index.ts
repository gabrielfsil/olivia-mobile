import Realm from "realm";

import { HeartBeat } from "./schemas/HeartBeat";
import { User } from "./schemas/User";

export const realmConfig: Realm.Configuration = {
  path: "olivia-app",
  schema: [HeartBeat, User],
  schemaVersion: 1,
};
