export interface FusedData {
     id: string;
     characterName: string;
     planetName: string;
     planetClimate: string;
     weather: {
       temperature: number; // Celsius
       description: string;
       humidity: number;
     };
     timestamp: number;
   }