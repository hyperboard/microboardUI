import * as Drizzle from 'drizzle';
import winston from "winston";
import { HttpException } from "shared/exceptions/http-exception";
import { HttpStatus } from "shared/enums/http-status.enum";
import { AccessToken } from "Interface";

export class Users {
    constructor(private logger: winston.Logger) {}

    async getMe(
        reqUser: AccessToken
    ): Promise<{ id: number; email: string } | null> {
        const userReq = await reqUser;
        const user = await Drizzle.getUser(+userReq.sub);

        if (!user) {
            this.logger.error(`User not found: ${reqUser.sub}`);
            throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
        }

        return { id: user.userId, email: user.userEmail! };
    }
}
