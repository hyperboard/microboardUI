import { FolderDto } from "./folder.dto";

export class NestedFolderDto extends FolderDto {
    itemType: "folder" | "board";
    order?: number;

    constructor(payload: NestedFolderDto) {
        super(payload);
        this.itemType = payload.itemType;
        this.order = payload.order;
    }
}
