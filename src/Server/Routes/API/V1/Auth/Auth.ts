import { Database } from "Server/Database";
import winston from "winston";
import { decode, sign, verify } from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { HttpException } from "../../../../shared/expceptions/http-exception";
import { HttpStatus } from "../../../../shared/enums/http-status.enum";

type RegisterPayload = {
  email: string;
  password: string;
}

type LoginPayload = {
  email: string;
  password: string;
}

type RefreshPayload = {
  refreshToken: string;
}

export class Auth {
  constructor(private database: Database, private logger: winston.Logger) { }

  async login(payload: LoginPayload): Promise<{
    accessToken: string;
    refreshToken: string
  } | null> {
    // TODO: Config service?
    // if (!process.env.JWT_SECRET) {
    //   throw new Error("process.env.JWT_SECRET not found");
    // }

    const user = await this.database.query<{
      id: number;
      email: string;
      password: string;
    }>(
        `
        select users.id as id, users.email as email, user_password.password as password
        from users
        left join user_password on users.id = user_password.user_id
        where email = $1
        `,
        [payload.email]
    );

    if (!user.rows[0]) {
      throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
    }

    const isValidPassword = await bcrypt.compare(payload.password, user.rows[0].password);

    if (!isValidPassword) {
      throw new HttpException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const accessToken = sign({
      email: user.rows[0].email,
      id: user.rows[0].id
    }, process.env.JWT_SECRET!, {expiresIn: '1h'});

    const refreshToken = sign({
      email: user.rows[0].email,
      id: user.rows[0].id
    }, process.env.JWT_SECRET!, {expiresIn: '7d'});

    return {
      accessToken,
      refreshToken
    }
  }

  async register(payload: RegisterPayload): Promise<{ email: string; id: number } | null> {
    const user = await this.database.query<{ email: string }>(
        "select email from users where email = $1",
        [payload.email]
    );

    const existedUser = user.rows[0];

    if (existedUser) {
      throw new Error("CONFLICT_ERROR");
    }

    try {
      await this.database.query(
        "select add_user($1)",
        [payload.email]
      );
    } catch(e) {
      this.logger.error(`add_user error: ${e}`);
      throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when creating new user");
    }

    const createdUser = await this.database.query<{
      id: number; email: string
    }>(`
      select id, email from users where email = $1
    `,
    [payload.email]);

    if (!createdUser) {
      throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when creating new user");
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password', salt);

    try {
      await this.database.query(
        "select add_password($1, $2)",
        [createdUser.rows[0].id, password]
      );
    } catch(e) {
      this.logger.error(`add_user_password error: ${e}`);
      throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when setting new user password");
    }

    return createdUser.rows[0];
  }

  async refresh(payload: RefreshPayload): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const verifiedUser = verify(payload.refreshToken, process.env.JWT_SECRET!);
    if (!verifiedUser) {
      throw new HttpException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid or expired");
    }

    const decodedUser: EncodedUser = decode(payload.refreshToken) as EncodedUser;
    const accessToken = sign({
      email: decodedUser.email,
      id: decodedUser.id
    }, process.env.JWT_SECRET!, {expiresIn: '1h'});

    const refreshToken = sign({
      email: decodedUser.email,
      id: decodedUser.id
    }, process.env.JWT_SECRET!, {expiresIn: '7d'});

    return {
      accessToken,
      refreshToken
    }
  }
}
