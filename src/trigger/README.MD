## Set trigger in test environment:

### Setup trigger in Dev:

`docker compose -f docker-compose.test.yml up --build -d test_triggerdotdev`

Update env by visiting http://localhost:3030 or using `npx @trigger.dev/cli@latest init`

`TRIGGER_PROJECT_ID` - `# http://localhost:3030/orgs/<YOUR_ORG>/projects/<PROJECT_ID>`
`TRIGGER_API_KEY` - `# http://localhost:3030/orgs/<YOUR_ORG>/projects/<PROJECT_ID>/environments - first hidden field in current environment (NODE_ENV)`

and endpointId in package.json:

```
  "trigger.dev": {
    "endpointId": "<YOUR_PROJECT_ID>"
  }
```

Run rest app and trigger:

`docker compose -f docker-compose.test.yml up --build -d`  
&  
`npm run trigger` - `# requires installed ngrok or another tunnel`

### Setup s3 localstack:

Pull and run container:

```
docker pull localstack/localstack
docker run -d --rm -it -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack
```

Take container-id/name from `docker ps` of Docker Desktop and enter in bash:

```
docker exec -it '<container-id>/<name>' bash
```

Create bucket (in container):

```
aws configure --profile default
awslocal s3api create-bucket --bucket talk --region us-east-1
```

Copy sample (on local machine):

```
docker cp <path_to_folder> <container_id>:/test-storage
```

Add files to bucket (in container):

```
awslocal s3 cp /test-storage s3://talk/ --recursive
```

Localstack useful commands:

```
awslocal s3 ls s3://talk/ --recursive # Check all files
awslocal s3 rm s3://talk/ --recursive # Clear bucket

```
