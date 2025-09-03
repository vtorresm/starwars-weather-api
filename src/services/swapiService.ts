import axios from 'axios';
import * as AWSXRay from 'aws-xray-sdk';
import * as https from 'https';

// Configurar axios para ignorar certificados SSL expirados (SWAPI tiene certificado expirado)
axios.defaults.httpsAgent = new https.Agent({
  rejectUnauthorized: false // Ignorar certificados SSL
});

// Solo instrumentar en producción (no en serverless offline)
if (!process.env.IS_OFFLINE) {
  AWSXRay.captureHTTPsGlobal(require('http'));
  AWSXRay.captureHTTPsGlobal(require('https'));
}

export class SwapiService {
  static async getCharacter(id: number) {
    const segment = process.env.IS_OFFLINE ? null : AWSXRay.getSegment()?.addNewSubsegment('SWAPI');
    try {
      const response = await axios.get(`https://swapi.dev/api/people/${id}/`);
      const character = response.data;
      const planet = await this.getPlanet(character.homeworld);
      return {
        characterName: character.name,
        planetName: planet.name,
        planetClimate: planet.climate.toLowerCase(),
      };
    } finally {
      segment?.close();
    }
  }

  static async getPlanet(url: string) {
    const segment = process.env.IS_OFFLINE ? null : AWSXRay.getSegment()?.addNewSubsegment('SWAPI_Planet');
    try {
      const response = await axios.get(url);
      return response.data;
    } finally {
      segment?.close();
    }
  }
}