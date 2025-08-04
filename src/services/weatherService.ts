import axios from 'axios';

   const cityMap: { [key: string]: string } = {
     tatooine: 'Cairo', // Desert-like
     hoth: 'Moscow',    // Cold
     endor: 'Vancouver', // Forest
     naboo: 'Rome',     // Temperate
   };

   export class WeatherService {
     static async getWeather(planetName: string) {
       const city = cityMap[planetName.toLowerCase()] || 'London'; // Fallback
       const response = await axios.get(
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