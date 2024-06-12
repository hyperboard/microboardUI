/**
 * Interface for media data access layer.
 */
export interface MediaDAL {
    saveImage(id: string, imageBuffer: Buffer): Promise<void>;
    getImage(id: string): Promise<Buffer>;
}
