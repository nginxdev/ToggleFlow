export interface IUser {
  userId: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  language?: string;
  password: string;
  email: string;
  lastProjectId?: string | null;
}

export type IUserWithoutPassword = Omit<IUser, 'password'>;
