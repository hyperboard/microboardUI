export interface Commentator {
  username: string;
  id: number;
  avatar?: string;
}

export interface CommentMessage {
  date: Date;
  text: string;
  id: string;
  commentator: Commentator;
  readers: number[];
}
