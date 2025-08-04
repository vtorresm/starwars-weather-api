import { handler } from '../handlers/fusedData';
   import { SwapiService } from '../services/swapiService';
   import { WeatherService } from '../services/weatherService';
   import { CacheService } from '../services/cacheService';
   import { DbService } from '../services/dbService';

   jest.mock('../services/swapiService');
   jest.mock('../services/weatherService');
   jest.mock('../services/cacheService');
   jest.mock('../services/dbService');

   describe('GET /fusionados', () => {
     beforeEach(() => {
       jest.clearAllMocks();
     });

     it('should return cached data if available', async () => {
       const mockCachedData = { id: '1', characterName: 'Luke' };
       (CacheService.getCachedData as jest.Mock).mockResolvedValue(mockCachedData);

       const event = { queryStringParameters: { characterId: '1' } };
       const result = await handler(event as any, {} as any);

       expect(result.statusCode).toBe(200);
       expect(JSON.parse(result.body)).toEqual(mockCachedData);
       expect(CacheService.getCachedData).toHaveBeenCalledWith('character_1');
     });

     it('should fetch and fuse data if not cached', async () => {
       (CacheService.getCachedData as jest.Mock).mockResolvedValue(null);
       (SwapiService.getCharacter as jest.Mock).mockResolvedValue({
         characterName: 'Luke Skywalker',
         planetName: 'Tatooine',
         planetClimate: 'arid',
       });
       (WeatherService.getWeather as jest.Mock).mockResolvedValue({
         temperature: 30,
         description: 'sunny',
         humidity: 10,
       });
       (DbService.storeFusedData as jest.Mock).mockResolvedValue(undefined);
       (CacheService.setCachedData as jest.Mock).mockResolvedValue(undefined);

       const event = { queryStringParameters: { characterId: '1' } };
       const result = await handler(event as any, {} as any);

       expect(result.statusCode).toBe(200);
       const body = JSON.parse(result.body);
       expect(body.characterName).toBe('Luke Skywalker');
       expect(body.weather.temperature).toBe(30);
     });
   });