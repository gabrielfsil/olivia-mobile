import Realm from "realm";
import { realmConfig } from "../../databases";
import { HeartBeat } from "../../databases/schemas/HeartBeat";
import { Position } from "../../databases/schemas/Position";
import axios from "axios";

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
            },
            rerunOnOpen: true,
          },
          user: app.currentUser
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
      console.log("Iniciando sincronização...");
      await realm?.syncSession?.uploadAllLocalChanges();
      console.log("Concluído");
    } catch (err) {
      console.log("Erro na sincronização: ", err);
    }
  }
}

const realmManager = new RealmManager();
export default realmManager;
