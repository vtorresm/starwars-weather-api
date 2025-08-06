import axios from 'axios';
import https from 'https';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

   // Create axios instance with SSL certificate bypass for development
   const axiosInstance = axios.create({
     httpsAgent: new https.Agent({
       rejectUnauthorized: false // Only use this in development!
     })
   });

   const cityMap: { [key: string]: string } = {
     tatooine: 'Cairo', // Desert-like
     hoth: 'Moscow',    // Cold
     endor: 'Vancouver', // Forest
     naboo: 'Rome',     // Temperate
   };

   export class WeatherService {
     static async getWeather(planetName: string) {
       const city = cityMap[planetName.toLowerCase()] || 'London'; // Fallback
       const response = await axiosInstance.get(
         `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`
       );
       const data = response.data;
       return {
         temperature: Math.round(data.main.temp - 273.15), // Kelvin to Celsius
         description: data.weather[0].description,
         humidity: data.main.humidity,
       };
     }
   }