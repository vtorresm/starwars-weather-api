import axios from 'axios';
import https from 'https';

// Create axios instance with SSL certificate bypass for development
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Only use this in development!
  }),
  timeout: 10000, // 10 second timeout
  headers: {
    'User-Agent': 'StarWars-Weather-API/1.0.0'
  }
});

export class SwapiService {
  static async getCharacter(id: number) {
    const response = await axiosInstance.get(`https://swapi.py4e.com/api/people/${id}/`);
    const character = response.data;
    const planet = await this.getPlanet(character.homeworld);
    return {
      characterName: character.name,
      planetName: planet.name,
      planetClimate: planet.climate.toLowerCase(),
    };
  }

  static async getPlanet(url: string) {
    const response = await axiosInstance.get(url);
    return response.data;
  }
}
