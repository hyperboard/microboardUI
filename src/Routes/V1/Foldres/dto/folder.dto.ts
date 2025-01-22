import type { FolderType } from "drizzle/entities/folders";
import type { BoardDto } from "Routes/V1/Boards/dto";
import type { NestedFolderDto } from "./nested-folder.dto";

export class FolderDto {
    id: number;
    items: (NestedFolderDto | BoardDto)[];
    type: FolderType;
    title: string;

    constructor(folder: FolderDto) {
        this.id = folder.id;
        this.items = folder.items;
        this.type = folder.type;
        this.title = folder.title;
    }
}
