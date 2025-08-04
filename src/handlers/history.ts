import { APIGatewayProxyHandler } from 'aws-lambda';
   import { DbService } from '../services/dbService';
   import { logger } from '../utils/logger';

   export const handler: APIGatewayProxyHandler = async (event) => {
     try {
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
     }
   };