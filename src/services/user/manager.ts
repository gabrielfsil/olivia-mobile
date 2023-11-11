interface User {
  _id: string;
  name: string;
  email: string;
  permission: number;
  accessToken: string;
  refreshToken: string;
}

class UserManager {
  private user: User | null;

  constructor() {
    this.user = null;
  }

  getUser() {
    return this.user;
  }

  updateUser(user: User | null) {
    this.user = user;
  }
}

const userManager = new UserManager();

export default userManager;
