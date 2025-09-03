import { DynamoDB } from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { FusedData } from '../models/fusedModel';
import { CustomData } from '../models/customData';

// Solo instrumentar AWS SDK en producción
let AWS;
if (process.env.IS_OFFLINE) {
  AWS = require('aws-sdk');
} else {
  AWS = AWSXRay.captureAWS(require('aws-sdk'));
}
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const DATA_TABLE = process.env.DYNAMODB_TABLE!;

export class DbService {
  static async storeFusedData(data: FusedData): Promise<void> {
    const segment = process.env.IS_OFFLINE ? null : AWSXRay.getSegment()?.addNewSubsegment('DynamoDB_StoreFused');
    try {
      const params = {
        TableName: DATA_TABLE,
        Item: { ...data, id: 'fused_' + data.id },
      };
      await dynamoDb.put(params).promise();
    } finally {
      segment?.close();
    }
  }

  static async storeCustomData(data: CustomData): Promise<void> {
    const segment = process.env.IS_OFFLINE ? null : AWSXRay.getSegment()?.addNewSubsegment('DynamoDB_StoreCustom');
    try {
      const params = {
        TableName: DATA_TABLE,
        Item: { ...data, id: 'custom_' + data.id },
      };
      await dynamoDb.put(params).promise();
    } finally {
      segment?.close();
    }
  }

  static async getHistory(limit: number, offset?: string): Promise<any[]> {
    const segment = process.env.IS_OFFLINE ? null : AWSXRay.getSegment()?.addNewSubsegment('DynamoDB_GetHistory');
    try {
      const params: DynamoDB.DocumentClient.QueryInput = {
        TableName: DATA_TABLE,
        KeyConditionExpression: '#id = :id',
        ExpressionAttributeNames: { '#id': 'id' },
        ExpressionAttributeValues: { ':id': 'fused' },
        Limit: limit,
        ScanIndexForward: false,
      };

      if (offset) {
        params.ExclusiveStartKey = { id: 'fused', timestamp: Number(offset) };
      }

      const result = await dynamoDb.query(params).promise();
      return result.Items || [];
    } finally {
      segment?.close();
    }
  }
}