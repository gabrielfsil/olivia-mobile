import { useAuth } from "../../hooks/auth";
import { useRealm } from "../../hooks/realm";

interface IRequest {
  heart_rate: number;
  created_at: Date;
}

const writeHeartBeat = ({ created_at, heart_rate }: IRequest) => {
  const realm = useRealm();
  const { user } = useAuth();

  realm.write(() => {
    realm.create("HeartBeats", {
      _id: new Realm.BSON.ObjectId(),
      user_id: user?._id,
      heart_rate: heart_rate,
      created_at: created_at,
    });
  });
};

export { writeHeartBeat };
