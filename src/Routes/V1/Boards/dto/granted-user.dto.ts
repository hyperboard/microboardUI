import type { UserAccessType } from "../types";

export class GrantedUserDto {
  id: number;
  name: string | null;
  email: string | null;
  accessType: UserAccessType;
  avatar: string | null;
  isOwner: boolean;

  constructor(payload: GrantedUserDto) {
    this.accessType = payload.accessType;
    this.email = payload.email;
    this.id = payload.id;
    this.name = payload.name;
    this.avatar = payload.avatar;
    this.isOwner = payload.isOwner;
  }
}