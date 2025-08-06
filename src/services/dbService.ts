import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { FusedData } from '../models/fusedModel';
import { CustomData } from '../models/customData';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);
const DATA_TABLE = process.env.DYNAMODB_TABLE!;

   export class DbService {
     static async storeFusedData(data: FusedData): Promise<void> {
       const command = new PutCommand({
         TableName: DATA_TABLE,
         Item: { ...data, id: 'fused_' + data.id }, // Prefix for fused data
       });
       await dynamoDb.send(command);
     }

     static async storeCustomData(data: CustomData): Promise<void> {
       const command = new PutCommand({
         TableName: DATA_TABLE,
         Item: { ...data, id: 'custom_' + data.id }, // Prefix for custom data
       });
       await dynamoDb.send(command);
     }

     static async getHistory(limit: number, offset?: string): Promise<any[]> {
       const params: any = {
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

       const command = new QueryCommand(params);
       const result = await dynamoDb.send(command);
       return result.Items || [];
     }
   }