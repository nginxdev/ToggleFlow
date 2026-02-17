export interface IUser {
  userId: number;
  username: string;
  password: string;
  email: string;
}

export type IUserWithoutPassword = Omit<IUser, 'password'>;
