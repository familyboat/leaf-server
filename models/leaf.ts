import { User } from "./user.ts";

export interface Leaf {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: Omit<User, 'password'>
}