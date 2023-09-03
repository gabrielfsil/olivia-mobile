import { GeoPosition } from "realm";


class Position extends Realm.Object<Position> {
  _id!: Realm.BSON.ObjectId;
  coordinates!: GeoPosition;
  created_at!: Date;
  user_id!: Realm.BSON.ObjectId;

  static schema: Realm.ObjectSchema = {
    name: "Positions",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      coordinates: "double[]",
      created_at: { type: "date", indexed: true },
      user_id: "objectId",
    },
  };
}

export { Position}