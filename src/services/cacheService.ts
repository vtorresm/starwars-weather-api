import { DynamoDB } from 'aws-sdk';

   const dynamoDb = new DynamoDB.DocumentClient();
   const CACHE_TABLE = process.env.CACHE_TABLE!;

   export class CacheService {
     static async getCachedData(cacheKey: string): Promise<any | null> {
       const params = {
         TableName: CACHE_TABLE,
         Key: { cacheKey },
       };
       const result = await dynamoDb.get(params).promise();
       return result.Item?.data || null;
     }

     static async setCachedData(cacheKey: string, data: any): Promise<void> {
       const params = {
         TableName: CACHE_TABLE,
         Item: {
           cacheKey,
           data,
           ttl: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
         },
       };
       await dynamoDb.put(params).promise();
     }
   }