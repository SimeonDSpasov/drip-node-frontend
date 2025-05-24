
export enum UserRole {
  End_User,
  Admin,
  Master_Admin,
}

export interface User {
  id: string;
  role: UserRole;
  email: string;
  password: string;
  createdAt: Date;
}
  