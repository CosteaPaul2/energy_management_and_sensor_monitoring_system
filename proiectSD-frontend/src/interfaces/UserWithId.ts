import { User } from "./User";

export interface UserWithId extends User {
    id: string,
  }