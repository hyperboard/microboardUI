import avatar from 'animal-avatar-generator';
import * as Drizzle from 'drizzle';
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import type internal from 'stream';
import { Readable } from 'stream';
import winston from "winston";
import type { MediaDAL } from '../Media/MediaDAL';
import { BUCKET_NAME, minioClient } from '../Media/MinioClient';

export class Users {
    constructor(private media: MediaDAL, private logger: winston.Logger) { }

    async getUser(
        userId: number
    ): Promise<{ id: number; email: string, name: string, avatar: string } | null> {
        const user = await Drizzle.getUser(userId);

        if (!user) {
            this.logger.error(`User not found: ${userId}`);
            throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
        }

        return { id: user.userId, email: user.userEmail!, name: user.userName!, avatar: user.avatar! };
    }

    async editUser(userId: number, name: string) {
        await Drizzle.changeUsername(userId, name);
    }

    async uploadAvatar(userId: number, avatar?: internal.Readable, type?: string, ext: string = 'svg') {
        const id = `${userId}-avatar.${ext}`;
        const src = `${process.env.STORAGE_URL}/${id}`

        if (!avatar) {
            const generatedAvatar = this.generateAvatar();
            await minioClient?.putObject(BUCKET_NAME, id, generatedAvatar, undefined, { 'content-type': 'image/svg+xml' })
        } else {
            await minioClient?.putObject(BUCKET_NAME, id, avatar, undefined, { 'content-type': type })
        }
        await Drizzle.addAvatar(userId, src)
        return { avatar: id }
    }

    private generateAvatar() {
        const svg = avatar(this.generateSeed(), { size: 200, blackout: false });
        const readable = new Readable({
            read() {
                this.push(svg);
                this.push(null); // Signifies the end of the stream
            }
        });
        return readable;
    }

    private generateSeed(length: number = 32): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
