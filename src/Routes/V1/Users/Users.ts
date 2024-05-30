import winston from "winston";
import { HttpException } from "shared/exceptions/http-exception";
import { HttpStatus } from "shared/enums/http-status.enum";
import { Pool } from "pg";
import { AccessToken } from "Interface";

export class Users {
    constructor(private database: Pool, private logger: winston.Logger) {}

    async getMe(
        reqUser: AccessToken
    ): Promise<{ id: number; email: string } | null> {
        const userReq = await reqUser;
        const user = await this.database.query<{ id: number; email: string }>(
            `
                SELECT id, email
                FROM users
                LEFT JOIN user_name ON users.id = user_name.user_id
                WHERE id = $1;
            `,
            [+userReq.sub]
        );

        if (!user.rows[0]) {
            this.logger.error(`User not found: ${reqUser.sub}`);
            throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
        }

        return user.rows[0];
    }
}
