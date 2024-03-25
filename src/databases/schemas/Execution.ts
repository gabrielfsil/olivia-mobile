import Realm from "realm";

class Execution extends Realm.Object<Execution> {
  _id!: Realm.BSON.ObjectId;
  value!: number;
  created_at!: Date;
  user_id!: Realm.BSON.ObjectId;

  static schema: Realm.ObjectSchema = {
    name: "Executions",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      value: "int",
      created_at: { type: "date", indexed: true },
      user_id: "objectId",
    },
  };
}

export { Execution };
