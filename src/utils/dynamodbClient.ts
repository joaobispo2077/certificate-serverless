import { DynamoDB } from 'aws-sdk';

const { IS_OFFLINE } = process.env;

const offlineOptions = {
  region: 'localhost',
  endpoint: 'http://localhost:8080',
};

console.log('offline',IS_OFFLINE);
export const document = IS_OFFLINE 
? new DynamoDB.DocumentClient(offlineOptions)
: new DynamoDB.DocumentClient();