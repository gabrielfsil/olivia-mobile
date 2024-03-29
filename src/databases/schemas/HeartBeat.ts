import Realm from "realm";

class HeartBeat extends Realm.Object<HeartBeat> {
  _id!: Realm.BSON.ObjectId;
  heart_rate!: number;
  created_at!: Date;
  user_id!: Realm.BSON.ObjectId;

  static schema: Realm.ObjectSchema = {
    name: "HeartBeats",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      heart_rate: "int",
      created_at: { type: "date", indexed: true },
      user_id: "objectId",
    },
  };
}

export { HeartBeat };
