import {
    S3Client,
    CreateBucketCommand,
    GetObjectCommand,
    HeadBucketCommand,
    waitUntilBucketExists,
    ListObjectsV2Command,
    PutObjectCommand,
    _Object,
    GetObjectCommandOutput,
    ListObjectsV2CommandOutput,
    CopyObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

class S3 {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || "us-east-1",
            endpoint: process.env.AWS_ENDPOINT || "http://localhost:4566",
            forcePathStyle: true,
            credentials: fromEnv(),
        });
    }

    public async createBucket(bucket: string): Promise<void> {
        try {
            const headBucketCommand = new HeadBucketCommand({ Bucket: bucket });
            await this.s3Client.send(headBucketCommand);
            console.log(`Bucket ${bucket} already exists`);
        } catch (err: any) {
            if (err.name === "NotFound") {
                const createBucketCommand = new CreateBucketCommand({ Bucket: bucket });
                await this.s3Client.send(createBucketCommand);
                console.log(`Bucket ${bucket} successfully created`);
            } else {
                throw err;
            }
        }

        await waitUntilBucketExists({ client: this.s3Client, maxWaitTime: 20 }, { Bucket: bucket });
        console.log(`Bucket ${bucket} is ready`);
    }

    public async uploadFile(bucket: string, filePath: string): Promise<void> {
        const file = path.basename(filePath);
        const fileStream = fs.createReadStream(filePath);
        fileStream.on("error", function (err: Error) {
            console.error("File Error", err);
        });

        const uploadParams = {
            Bucket: bucket,
            Key: file,
            Body: fileStream,
        };

        const putObjectCommand = new PutObjectCommand(uploadParams);
        await this.s3Client.send(putObjectCommand);
        console.log(`File ${file} successfully uploaded to bucket ${bucket}`);
    }

    public async listObjects(bucket: string): Promise<string[]> {
        const listObjectsCommand = new ListObjectsV2Command({ Bucket: bucket });
        const data = await this.s3Client.send(listObjectsCommand);

        if (!data.Contents || data.Contents.length === 0) {
            console.log("No objects found in the bucket");
            return [];
        }

        return data.Contents.map((object: _Object) => object.Key as string);
    }

    public async generateSignedUrl(bucket: string, key: string): Promise<string | null> {
        try {
            const getObjectUrl = await getSignedUrl(this.s3Client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
                expiresIn: 3600,
                responseContentDisposition: "inline",
            });
            return getObjectUrl;
        } catch (error) {
            console.error(`Error generating signed URL for ${key}:`, error);
            return null;
        }
    }

    public async uploadDirectory(bucket: string, directoryPath: string): Promise<void> {
        const files = fs.readdirSync(directoryPath);
        const uploadPromises = files.map((file: string) => {
            const filePath = path.join(directoryPath, file);
            return this.uploadFile(bucket, filePath);
        });

        await Promise.all(uploadPromises);
    }

    public async getSignedUrlsForBucket(bucket: string): Promise<(string | null)[]> {
        const keys = await this.listObjects(bucket);
        const signedUrls = await Promise.all(keys.map((key: string) => this.generateSignedUrl(bucket, key)));
        return signedUrls;
    }

    private streamToString = (stream: Readable): Promise<string> => {
        return new Promise((resolve, reject) => {
            const chunks: Uint8Array[] = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        });
    };

    public async getJson(bucket: string, key: string): Promise<any> {
        try {
            const command = new GetObjectCommand({ Bucket: bucket, Key: key });
            const response: GetObjectCommandOutput = await this.s3Client.send(command);
            if (response.Body instanceof Readable) {
                const jsonContent = await this.streamToString(response.Body);
                return JSON.parse(jsonContent);
            } else {
                throw new Error("Response body is not a stream.");
            }
        } catch (err) {
            console.error("Error getting file from S3:", err);
            throw err; // Re-throw the error to be handled by the caller
        }
    }

    listAllFiles = async (bucketName: string, prefix: string): Promise<string[]> => {
        let files: string[] = [];
        let continuationToken: string | undefined = undefined;

        do {
            const params = {
                Bucket: bucketName,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            };

            try {
                const command = new ListObjectsV2Command(params);
                const response: ListObjectsV2CommandOutput = await this.s3Client.send(command);

                if (response.Contents) {
                    files = files.concat(response.Contents.map((item) => item.Key!));
                }

                continuationToken = response.NextContinuationToken;
            } catch (err) {
                console.error("Error listing files:", err);
                throw err;
            }
        } while (continuationToken);

        return files;
    };

    moveFile = async (bucketName: string, sourceKey: string, destinationKey: string): Promise<void> => {
        try {
            // Copy the object to the new location
            const copyParams = {
                Bucket: bucketName,
                CopySource: `${bucketName}/${sourceKey}`,
                Key: destinationKey,
            };

            const copyCommand = new CopyObjectCommand(copyParams);
            await this.s3Client.send(copyCommand);
            console.log(`File copied from ${sourceKey} to ${destinationKey}`);

            // Delete the original object
            const deleteParams = {
                Bucket: bucketName,
                Key: sourceKey,
            };

            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await this.s3Client.send(deleteCommand);
            console.log(`File deleted from ${sourceKey}`);
        } catch (err) {
            console.error("Error moving file:", err);
            throw err;
        }
    };

    updateJsonFile = async (bucketName: string, key: string, newContent: Record<string, any>): Promise<void> => {
        try {
            // Convert the JSON object to a string
            const fileContent = JSON.stringify(newContent);

            // Set up parameters for the PutObjectCommand
            const params = {
                Bucket: bucketName,
                Key: key,
                Body: fileContent,
                ContentType: "application/json", // Important to set the correct content type
            };

            // Create and send the PutObjectCommand
            const command = new PutObjectCommand(params);
            await this.s3Client.send(command);
            console.log(`File at ${key} updated successfully.`);
        } catch (err) {
            console.error("Error updating file:", err);
            throw err;
        }
    };
}

export const s3 = new S3();
