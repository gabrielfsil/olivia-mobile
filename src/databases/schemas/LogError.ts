import Realm from "realm";

class LogError extends Realm.Object<LogError> {
  _id!: Realm.BSON.ObjectId;
  type!: string;
  created_at!: Date;
  user_id!: Realm.BSON.ObjectId;

  static schema: Realm.ObjectSchema = {
    name: "LogErrors",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      type: "string",
      created_at: { type: "date", indexed: true },
      user_id: "objectId",
    },
  };
}

export { LogError };
