import * as stream from "stream";
/**
 * Interface for media data access layer.
 */
export interface BarrelMediaDAL {
    saveImageStream(id: string, imageStream: stream.Readable): Promise<void>;
    getImageStream(id: string): Promise<Blob>;
    doesImageExist(id: string): Promise<boolean>;
}
