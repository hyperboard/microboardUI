import * as stream from "stream";
/**
 * Interface for media data access layer.
 */
export interface MediaDAL {
    saveImageStream(id: string, imageStream: stream.Readable): Promise<void>;
    getImageStream(id: string): Promise<stream.Readable>;
    doesImageExist(id: string): Promise<boolean>;
}
