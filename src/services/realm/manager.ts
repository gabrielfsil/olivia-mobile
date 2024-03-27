import Realm from "realm";
import { realmConfig } from "../../databases";
import { HeartBeat } from "../../databases/schemas/HeartBeat";
import { Position } from "../../databases/schemas/Position";
import axios from "axios";
import { LogError } from "../../databases/schemas/LogError";
import { Execution } from "../../databases/schemas/Execution";
import userManager from "../user/manager";

interface IUpdateToken {
  access_token: string | null;
  refresh_token: string | null;
}

class RealmManager {
  private realmInstance: Realm;
  private user: Realm.User | null;
  private access_token: string | null;
  private refresh_token: string | null;

  constructor() {
    this.realmInstance = new Realm(realmConfig);
    this.user = null;
    this.access_token = null;
    this.refresh_token = null;
  }

  updateUser(user: Realm.User | null) {
    this.user = user;
  }

  updateTokens({ access_token, refresh_token }: IUpdateToken) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
  }

  getLastExecution() {
    const userInstance = userManager.getUser();
    if (userInstance) {
      return this.realmInstance
        .objects(Execution)
        .filtered("user_id == $0", [userInstance._id])
        .sorted("created_at", true)
        .slice(0, 1)[0];
    }
    return undefined;
  }

  getHeartBeats(startCreatedAt: Date) {
    const userInstance = userManager.getUser();
    if (userInstance) {
      const userId = new Realm.BSON.ObjectId(userInstance._id);
      return this.realmInstance
        .objects(HeartBeat)
        .filtered("user_id == $0", [userId])
        .filtered("created_at >= $0", [startCreatedAt])
        .sorted("created_at", true);
    }

    return [];
  }

  getPositions() {
    const userInstance = userManager.getUser();
    if (userInstance) {
      const userId = new Realm.BSON.ObjectId(userInstance._id);
      return this.realmInstance
        .objects(Position)
        .filtered("user_id == $0", [userId])
        .sorted("created_at", true)
        .slice(0, 20);
    }

    return [];
  }

  async saveExecution(last: number) {
    const realmInstance = await this.getRealmInstance();
    const userInstance = userManager.getUser();

    if (realmInstance && userInstance) {
      realmInstance.write(async () => {
        realmInstance.create("Executions", {
          _id: new Realm.BSON.ObjectId(),
          user_id: new Realm.BSON.ObjectId(userInstance._id),
          value: last + 1,
          created_at: new Date(),
        });
      });
    }
  }

  async getRealmInstance() {
    if (this.access_token && this.user) {
      const app = new Realm.App({ id: "olivia-yeuiz" });

      this.realmInstance = await Realm.open({
        sync: {
          flexible: true,
          initialSubscriptions: {
            update(subs, realm) {
              subs.add(realm.objects(HeartBeat));
              subs.add(realm.objects(Position));
              subs.add(realm.objects(LogError));
              subs.add(realm.objects(Execution));
            },
          },
          user: app.currentUser,
        },
        ...realmConfig,
      } as Realm.Configuration);
      return this.realmInstance;
    }
  }

  getUser() {
    return this.user;
  }

  async refreshToken() {
    try {
      if (this.user) {
        const response = await axios({
          url: `https://sa-east-1.aws.realm.mongodb.com/api/client/v2.0/auth/session`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.user.refreshToken}`,
          },
          method: "POST",
        });

        const { access_token } = response.data;

        this.access_token = access_token;

        console.log("REFRESH TOKEN");
      }
    } catch (err) {
      console.log("ERRO REFRESH TOKEN ", err);
    }
  }

  async syncData() {
    try {
      const realm = await this.getRealmInstance();

      await realm?.syncSession?.uploadAllLocalChanges();
    } catch (err) {
      console.log("Erro na sincronização: ", err);
    }
  }
}

const realmManager = new RealmManager();
export default realmManager;
