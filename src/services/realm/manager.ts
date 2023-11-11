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
  private access_token: string | null;
  private refresh_token: string | null;

  constructor() {
    this.realmInstance = new Realm(realmConfig);
    this.access_token = null;
    this.refresh_token = null;
  }

  updateToken({ access_token, refresh_token }: IUpdateToken) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
  }

  async getRealmInstance() {
    if (!this.realmInstance) {
      if (this.access_token) {
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
            user: {
              accessToken: () => this.access_token,
            },
          },
          ...realmConfig,
        } as Realm.Configuration);
      } else {
        this.realmInstance = await Realm.open(realmConfig);
      }
    }
    return this.realmInstance;
  }

  async refreshToken() {
    try {
        
      if (this.refresh_token) {
        const response = await axios({
          url: `https://sa-east-1.aws.realm.mongodb.com/api/client/v2.0/auth/session`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.refresh_token}`,
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
}

const realmManager = new RealmManager();
export default realmManager;
