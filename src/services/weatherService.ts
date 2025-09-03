import axios from 'axios';
import * as AWSXRay from 'aws-xray-sdk';

// Solo instrumentar en producción (no en serverless offline)
if (!process.env.IS_OFFLINE) {
  AWSXRay.captureHTTPsGlobal(require('http'));
  AWSXRay.captureHTTPsGlobal(require('https'));
}

   const cityMap: { [key: string]: string } = {
     tatooine: 'Cairo',
     hoth: 'Moscow',
     endor: 'Vancouver',
     naboo: 'Rome',
   };

   export class WeatherService {
     static async getWeather(planetName: string) {
       const segment = process.env.IS_OFFLINE ? null : AWSXRay.getSegment()?.addNewSubsegment('OpenWeatherMap');
       try {
         const city = cityMap[planetName.toLowerCase()] || 'London';
         const response = await axios.get(
           `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`
         );
         const data = response.data;
         return {
           temperature: Math.round(data.main.temp - 273.15),
           description: data.weather[0].description,
           humidity: data.main.humidity,
         };
       } finally {
         segment?.close();
       }
     }
   }