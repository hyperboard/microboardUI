import type { FolderType } from "drizzle/entities/folders";
import { HttpStatus } from "shared/enums/http-status.enum";
import { catchAsync } from "shared/lib/catchAsync";
import type { FoldersService } from "./folders.service";
import { HttpException } from "shared/exceptions/http-exception";
import { FolderDto } from "./dto/folder.dto";
import type { FolderItems } from "./types";

export function getFoldersController(foldersService: FoldersService) {
    const create = catchAsync(async (req, res) => {
        const userId = +req.token.sub;

        const rootFolder = await foldersService.getRoot(userId);

        if (!rootFolder) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Root folder is not initialized");
        }

        const parentFolder = +req.body.parentFolder || rootFolder.id;

        const newFolder = await foldersService.create({ ...req.body, ownerId: userId, parentFolder });
        return res.status(HttpStatus.CREATED).json(newFolder);
    });

    const get = catchAsync(async (req, res) => {
        const folderId = +req.params.folderId;
        const folder = await foldersService.get(folderId);

        return res.status(HttpStatus.OK).json(
            new FolderDto({
                id: folder.id,
                title: folder.title,
                type: folder.type,
                items: folder.items,
            })
        );
    });

    const addContent = catchAsync(async (req, res) => {
        const folderId = +req.params.folderId;
        const nestedFolderId = +req.body.nestedFolderId;
        const nestedBoardId = req.body.nestedBoardId;

        if (nestedBoardId) {
            await foldersService.addNestedBoard(folderId, nestedBoardId);
        }

        if (nestedFolderId) {
            await foldersService.addNestedFolder(folderId, nestedFolderId);
        }

        return res.status(HttpStatus.NO_CONTENT).send();
    });

    const remove = catchAsync(async (req, res) => {
        const folderId = +req.params.folderId;
        const nestedBoardUUID = req.body.nestedBoardId;
        const nestedFolderId = +req.body.nestedFolderId;

        if (!nestedBoardUUID && !nestedFolderId) {
            await foldersService.removeFolder(folderId);
            return res.status(HttpStatus.NO_CONTENT).send();
        }

        if (nestedBoardUUID) {
            await foldersService.removeNestedBoard(folderId, nestedBoardUUID);
        }

        if (nestedFolderId) {
            await foldersService.removeNestedFolder(folderId, nestedFolderId);
        }

        return res.status(HttpStatus.NO_CONTENT).send();
    });

    const getRoot = catchAsync(async (req, res) => {
        const userId = +req.token.sub;
        const folderType = req.query.type as FolderType;

        const folder = await foldersService.getRoot(userId, folderType);

        return res.status(HttpStatus.OK).json(folder);
    });

    const edit = catchAsync(async (req, res) => {
        const folderId = +req.params.folderId;

        await foldersService.editFolder(folderId, req.body);

        return res.status(HttpStatus.NO_CONTENT).send();
    });

    const init = catchAsync(async (req, res) => {
        const userId = +req.token.sub;

        await foldersService.init(userId);

        res.status(HttpStatus.NO_CONTENT).send();
    });

    const reorder = catchAsync(async (req, res) => {
        const folderId = +req.params.folderId;
        const items = req.body.items as FolderItems;

        await foldersService.reorder(folderId, items);

        return res.status(HttpStatus.NO_CONTENT).send();
    });

    return {
        create,
        get,
        addContent,
        remove,
        getRoot,
        edit,
        init,
        reorder,
    };
}
