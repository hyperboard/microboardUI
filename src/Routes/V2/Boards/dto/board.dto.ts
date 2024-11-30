export class BoardDto {
  title: string;
  authorKey: string | null;
  isPublic: boolean;
  directAccessType: string;
  id: string;

  constructor(payload: BoardDto) {
    this.id = payload.id;
    this.title = payload.title;
    this.authorKey = payload.authorKey;
    this.isPublic = payload.isPublic;
    this.directAccessType = payload.directAccessType;
  }
}