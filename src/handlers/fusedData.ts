import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import * as AWSXRay from 'aws-xray-sdk';
import { SwapiService } from '../services/swapiService';
import { WeatherService } from '../services/weatherService';
import { CacheService } from '../services/cacheService';
import { DbService } from '../services/dbService';
import { FusedData } from '../models/fusedModel';
import { logger } from '../utils/logger';

export const handler: APIGatewayProxyHandler = async (event) => {
  const segment = process.env.IS_OFFLINE ? null : AWSXRay.getSegment()?.addNewSubsegment('GetFusedData');
  try {
    const characterId = event.queryStringParameters?.characterId || '1';
    const cacheKey = `character_${characterId}`;

    // Check cache
    const cachedData = await CacheService.getCachedData(cacheKey);
    if (cachedData) {
      logger.info('Cache hit', { cacheKey });
      return {
        statusCode: 200,
        body: JSON.stringify(cachedData),
      };
    }

    // Fetch data
    const swapiData = await SwapiService.getCharacter(Number(characterId));
    const weatherData = await WeatherService.getWeather(swapiData.planetName);

    // Fuse data
    const fusedData: FusedData = {
      id: uuidv4(),
      characterName: swapiData.characterName,
      planetName: swapiData.planetName,
      planetClimate: swapiData.planetClimate,
      weather: weatherData,
      timestamp: Date.now(),
    };

    // Store in DynamoDB
    await DbService.storeFusedData(fusedData);

    // Cache response
    await CacheService.setCachedData(cacheKey, fusedData);

    logger.info('Data fused and stored', { characterId });
    return {
      statusCode: 200,
      body: JSON.stringify(fusedData),
    };
  } catch (error) {
    logger.error('Error in getFusedData', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  } finally {
    segment?.close();
  }
};