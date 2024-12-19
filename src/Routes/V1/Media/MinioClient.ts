import { Client } from "minio";
export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME ?? "minio-bucket";
const config = {
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000", 10),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "",
    secretKey: process.env.MINIO_SECRET_KEY || "",
};

export const minioClient = (process.env.MINIO_ENABLED === "true" ? new Client(config) : null) as Client;

// Check if the bucket exists, if not create it
const MAX_RETRIES = 5; // Define the maximum number of retries

// Function to delay execution by a given number of milliseconds
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const bucketPolicy = {
    Version: "2012-10-17",
    Statement: [
        {
            Effect: "Allow",
            Principal: {
                AWS: "*",
            },
            Action: ["s3:GetBucketLocation", "s3:ListBucket"],
            Resource: `arn:aws:s3:::${BUCKET_NAME}`,
        },
        {
            Effect: "Allow",
            Principal: {
                AWS: "*",
            },
            Action: ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
            Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
        },
    ],
};

// Function to ensure the bucket policy is applied
const ensureBucketPolicy = async () => {
    const policyJSON = JSON.stringify(bucketPolicy);
    await minioClient.setBucketPolicy(BUCKET_NAME, policyJSON);
    console.log(`Bucket policy set successfully for ${BUCKET_NAME}.`);
};

const ensureBucketExists = async (retries: number = 0) => {
    try {
        const bucketExists = await minioClient.bucketExists(BUCKET_NAME);

        if (!bucketExists) {
            await minioClient.makeBucket(BUCKET_NAME, "");
            console.log(`Bucket ${BUCKET_NAME} created successfully.`);

            // Set the bucket policy
            await ensureBucketPolicy();
        } else {
            console.log(`Bucket ${BUCKET_NAME} already exists.`);

            // Check and update the bucket policy if needed
            try {
                const currentPolicy = await minioClient.getBucketPolicy(BUCKET_NAME);
                console.log(`Existing policies for ${BUCKET_NAME}: `, currentPolicy);
            } catch (error) {
                console.log(`Bucket policy does not exist. Setting new policy.`);
                await ensureBucketPolicy();
            }
        }
    } catch (error) {
        console.error(`Error ensuring bucket exists: ${error}`);

        if (retries < MAX_RETRIES) {
            console.log(`Retrying in 5 seconds... (Attempt ${retries + 1}/${MAX_RETRIES})`);
            await delay(5000); // Wait for 5 seconds before retrying
            await ensureBucketExists(retries + 1); // Retry
        } else {
            console.error(`Failed to ensure bucket exists after ${MAX_RETRIES} attempts.`);
            process.exit(1); // Exit with failure if all retries are exhausted
        }
    }
};

// Initialize MinIO setup
if (process.env.MINIO_ENABLED === "true") {
    ensureBucketExists();
}
