import path from "path";
import fs from "fs";

const publicKeyPath = process.env.PUBLIC_KEY_PATH;
if (!publicKeyPath) {
    throw new Error("Public key path is not set up");
}
export const publicKey = fs.readFileSync(path.resolve(publicKeyPath), "utf8");


const privateKeyPath = process.env.PRIVATE_KEY_PATH;
if (!privateKeyPath) {
    throw new Error("Public key path is not set up");
}
export const privateKey = fs.readFileSync(path.resolve(privateKeyPath), "utf8");

