export interface IUser {
  userId: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  language?: string;
  password: string;
  email: string;
}

export type IUserWithoutPassword = Omit<IUser, 'password'>;
