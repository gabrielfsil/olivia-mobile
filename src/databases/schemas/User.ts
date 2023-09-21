import Realm from "realm";

class User extends Realm.Object<User> {
  _id!: Realm.BSON.ObjectId;
  name!: string;
  email!: string;
  password!: string;
  created_at!: Date;
  permissions!: number;
  born_date!: Date;

  static schema: Realm.ObjectSchema = {
    name: "Users",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      name: "string",
      email: "string",
      password: "string",
      created_at: "date",
      permissions: "int",
      born_date: "date",
    },
  };
}

export { User };
