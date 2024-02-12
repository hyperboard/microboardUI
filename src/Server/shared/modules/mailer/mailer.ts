import * as nodemailer from "nodemailer";
import { Config } from "../../config/config";
import winston from "winston";
import hbs from "nodemailer-express-handlebars";

type Template = {
    template: "verify-email";
    context: {
        passcode: string;
        userId: number;
    };
};

export class Mailer {
    private transporter;

    constructor(
        private readonly config: Config,
        private readonly logger: winston.Logger
    ) {
        this.transporter = nodemailer.createTransport(
            {
                host: "smtp.yandex.com",
                port: 465,
                ignoreTLS: true,
                secure: true,
                auth: {
                    user: this.config.environment.MAILER_USER!,
                    pass: this.config.environment.MAILER_PASSWORD!,
                },
            } as nodemailer.TransportOptions,
            {
                from: this.config.environment.MAILER_USER!,
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

    sendMail(to: string, subject: string, template: Template): Promise<void> {
        return new Promise((resolve, reject) => {
            const mailOptions = {
                from: this.config.environment.MAILER_USER!,
                to: to,
                subject: subject,
                template: "dist/templates/" + template.template,
                context: template.context,
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
