import { createRealmContext } from "@realm/react";
import { realmConfig } from "../databases";


export const { RealmProvider, useRealm } = createRealmContext(realmConfig);


