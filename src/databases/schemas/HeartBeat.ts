import Realm, { GeoPosition } from "realm";

interface HeartBeat{
    heart_rate: number;
    coordinates: GeoPosition;
    created_at: Date;
    user_id: Realm.BSON.ObjectId;
}
class HeartBeat extends Realm.Object<HeartBeat> {
  _id!: Realm.BSON.ObjectId;
  heart_rate!: number;
  coordinates!: GeoPosition;
  created_at!: Date;
  user_id!: Realm.BSON.ObjectId;

  static schema: Realm.ObjectSchema = {
    name: "heart_beats",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      heart_rate: "int",
      coordinates: "double[]",
      created_at: { type: "date", indexed: true },
      user_id: "objectId",
    },
  };
}

export { HeartBeat };
