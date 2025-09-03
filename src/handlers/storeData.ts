import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import * as AWSXRay from 'aws-xray-sdk';
import { DbService } from '../services/dbService';
import { CustomData } from '../models/customData';
import { logger } from '../utils/logger';

export const handler: APIGatewayProxyHandler = async (event) => {
  const segment = process.env.IS_OFFLINE ? null : AWSXRay.getSegment()?.addNewSubsegment('StoreData');
  try {
    // Token validation is handled by API Gateway Cognito Authorizer
    // No manual validation needed

    const data: Partial<CustomData> = JSON.parse(event.body || '{}');
    if (!data.name || !data.description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid input: name and description required' }),
      };
    }

    const item: CustomData = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      timestamp: Date.now(),
    };

    await DbService.storeCustomData(item);
    logger.info('Custom data stored', { id: item.id });

    return {
      statusCode: 201,
      body: JSON.stringify(item),
    };
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      full: error
    });
    logger.error('Error in storeData', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal Server Error',
        error: error?.message || 'Unknown error'
      }),
    };
  } finally {
    segment?.close();
  }
};
