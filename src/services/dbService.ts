import { DynamoDB } from 'aws-sdk';
   import { FusedData } from '../models/fusedModel';
   import { CustomData } from '../models/customData';

   const dynamoDb = new DynamoDB.DocumentClient();
   const DATA_TABLE = process.env.DYNAMODB_TABLE!;

   export class DbService {
     static async storeFusedData(data: FusedData): Promise<void> {
       const params = {
         TableName: DATA_TABLE,
         Item: { ...data, id: 'fused_' + data.id }, // Prefix for fused data
       };
       await dynamoDb.put(params).promise();
     }

     static async storeCustomData(data: CustomData): Promise<void> {
       const params = {
         TableName: DATA_TABLE,
         Item: { ...data, id: 'custom_' + data.id }, // Prefix for custom data
       };
       await dynamoDb.put(params).promise();
     }

     static async getHistory(limit: number, offset?: string): Promise<any[]> {
       const params: DynamoDB.DocumentClient.QueryInput = {
         TableName: DATA_TABLE,
         KeyConditionExpression: '#id = :id',
         ExpressionAttributeNames: { '#id': 'id' },
         ExpressionAttributeValues: { ':id': 'fused' },
         Limit: limit,
         ScanIndexForward: false, // Descending order
       };

       if (offset) {
         params.ExclusiveStartKey = { id: 'fused', timestamp: Number(offset) };
       }

       const result = await dynamoDb.query(params).promise();
       return result.Items || [];
     }
   }