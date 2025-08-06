import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);
const CACHE_TABLE = process.env.CACHE_TABLE!;

   export class CacheService {
     static async getCachedData(cacheKey: string): Promise<any | null> {
       const command = new GetCommand({
         TableName: CACHE_TABLE,
         Key: { cacheKey },
       });
       const result = await dynamoDb.send(command);
       return result.Item?.data || null;
     }

     static async setCachedData(cacheKey: string, data: any): Promise<void> {
       const command = new PutCommand({
         TableName: CACHE_TABLE,
         Item: {
           cacheKey,
           data,
           ttl: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
         },
       });
       await dynamoDb.send(command);
     }
   }