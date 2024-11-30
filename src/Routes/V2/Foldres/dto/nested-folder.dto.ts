import { FolderDto } from "./folder.dto";

export class NestedFolderDto extends FolderDto {
  itemType: 'folder' | 'board';

  constructor(payload: NestedFolderDto) {
    super(payload);
    this.itemType = payload.itemType;
  }
}