import { APIGatewayProxyResult } from 'aws-lambda';
import { handler } from '../handlers/history';
import { DbService } from '../services/dbService';

   jest.mock('../services/dbService');

   describe('GET /historial', () => {
     it('should return paginated history', async () => {
       const mockHistory = [{ id: '1', characterName: 'Luke' }];
       (DbService.getHistory as jest.Mock).mockResolvedValue(mockHistory);

      const event = { queryStringParameters: { limit: '5' } };
      const result = await handler(event as any, {} as any, {} as any) as APIGatewayProxyResult;

       expect(result.statusCode).toBe(200);
       expect(JSON.parse(result.body)).toEqual(mockHistory);
       expect(DbService.getHistory).toHaveBeenCalledWith(5, undefined);
     });
   });