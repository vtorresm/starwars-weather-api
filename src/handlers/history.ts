import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWSXRay from 'aws-xray-sdk';
import { DbService } from '../services/dbService';
import { logger } from '../utils/logger';

export const handler: APIGatewayProxyHandler = async (event) => {
  const segment = process.env.IS_OFFLINE ? null : AWSXRay.getSegment()?.addNewSubsegment('GetHistory');
  try {
    // Token validation is handled by API Gateway Cognito Authorizer
    // No manual validation needed

    const limit = Number(event.queryStringParameters?.limit) || 10;
    const offset = event.queryStringParameters?.offset || undefined;

    const history = await DbService.getHistory(limit, offset);
    logger.info('History retrieved', { limit, offset });

    return {
      statusCode: 200,
      body: JSON.stringify(history),
    };
  } catch (error) {
    logger.error('Error in getHistory', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  } finally {
    segment?.close();
  }
};