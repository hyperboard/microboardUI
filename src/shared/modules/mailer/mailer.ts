import * as nodemailer from "nodemailer";
import { Config } from "../../config/config";
import winston from "winston";
import hbs from "nodemailer-express-handlebars";
import type { Lang } from "Middlewares/language.middleware";

type VerifyEmailTemplate = {
    template: "verify-email";
    context: {
        passcode: string;
        userId: string;
        email: string;
    };
};

type RestorePasswordTemplate = {
    template: "restore-password";
    context: {
        token: string;
    };
};

type Template = VerifyEmailTemplate | RestorePasswordTemplate;

function getMailerConfig() {
    return {
        host: process.env.MAILER_HOST,
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS,
        port: process.env.MAILER_PORT,
    };
}

export class Mailer {
    private transporter;

    constructor(
        private readonly config: Config,
        private readonly logger: winston.Logger,
        private readonly baseUrl: string
    ) {
        const { host, user, pass, port } = getMailerConfig();
        this.baseUrl = process.env.BASE_URL || "http://localhost:8000";
        this.transporter = nodemailer.createTransport(
            {
                host,
                port, // 465
                ignoreTLS: true,
                secure: true,
                auth: {
                    user,
                    pass,
                },
            } as nodemailer.TransportOptions,
            {
                from: user,
            } as nodemailer.SendMailOptions
        );
        this.transporter.use(
            "compile",
            hbs({
                viewEngine: {
                    partialsDir: "templates",
                    defaultLayout: false,
                },
                viewPath: "",
                extName: ".hbs",
            })
        );
    }

    sendMail(to: string, subject: string, template: Template, lang: Lang = "en"): Promise<void> {
        return new Promise((resolve, reject) => {
            const mailOptions = {
                from: this.config.environment.MAILER_USER!,
                to: to,
                subject: subject,
                template: "dist/templates/" + `${template.template}-${lang}`,
                context: { ...template.context, baseUrl: this.baseUrl },
            };

            this.transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    this.logger.error("error", err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
