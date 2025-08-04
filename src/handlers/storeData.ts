import { APIGatewayProxyHandler } from 'aws-lambda';
   import { v4 as uuidv4 } from 'uuid';
   import { DbService } from '../services/dbService';
   import { CustomData } from '../models/customData';
   import { logger } from '../utils/logger';

   export const handler: APIGatewayProxyHandler = async (event) => {
     try {
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
     } catch (error) {
       logger.error('Error in storeData', error);
       return {
         statusCode: 500,
         body: JSON.stringify({ message: 'Internal Server Error' }),
       };
     }
   };