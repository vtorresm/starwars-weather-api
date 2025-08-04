import axios from 'axios';

   export class SwapiService {
     static async getCharacter(id: number) {
       const response = await axios.get(`https://swapi.dev/api/people/${id}/`);
       const character = response.data;
       const planet = await this.getPlanet(character.homeworld);
       return {
         characterName: character.name,
         planetName: planet.name,
         planetClimate: planet.climate.toLowerCase(),
       };
     }

     static async getPlanet(url: string) {
       const response = await axios.get(url);
       return response.data;
     }
   }