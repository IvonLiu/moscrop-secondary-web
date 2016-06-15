import { User } from './user';

export class Post {
  id: number;
  title: string;
  content: string;
  author: number;
  category: number;
  created_at: string;  // milliseconds

  // Only for use when displaying stuff
  categoryName: string;
  authorInfo: User;
}
