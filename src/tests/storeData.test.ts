import { APIGatewayProxyResult } from 'aws-lambda';
import { handler } from '../handlers/storeData';
import { DbService } from '../services/dbService';

   jest.mock('../services/dbService');

   describe('POST /almacenar', () => {
     it('should store valid data', async () => {
       (DbService.storeCustomData as jest.Mock).mockResolvedValue(undefined);

       const event = {
         body: JSON.stringify({ name: 'Test', description: 'Test description' }),
       };
      const result = await handler(event as any, {} as any, {} as any) as APIGatewayProxyResult;

       expect(result.statusCode).toBe(201);
       const body = JSON.parse(result.body);
       expect(body.name).toBe('Test');
       expect(DbService.storeCustomData).toHaveBeenCalled();
     });

     it('should return 400 for invalid input', async () => {
       const event = { body: JSON.stringify({ name: 'Test' }) };
      const result = await handler(event as any, {} as any, {} as any) as APIGatewayProxyResult;

       expect(result.statusCode).toBe(400);
       expect(JSON.parse(result.body).message).toBe('Invalid input: name and description required');
     });
   });