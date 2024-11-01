import { User } from "./User";

export interface UserDetails extends User {
    address: string;
    age: number;
    password: string;
  }