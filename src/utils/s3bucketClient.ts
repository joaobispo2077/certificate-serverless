import { S3, Endpoint } from 'aws-sdk';

const { IS_OFFLINE } = process.env;

const offlineOptions = {
  s3ForcePathStyle: true,
  accessKeyId: 'S3RVER', // This specific key is required when working offline
  secretAccessKey: 'S3RVER',
  endpoint: new Endpoint('http://localhost:4569'),
};

export const s3bucketClient = IS_OFFLINE 
  ? new S3(offlineOptions)
  : new S3();