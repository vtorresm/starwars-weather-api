export const logger = {
     info: (message: string, data?: any) => {
       console.log(JSON.stringify({ level: 'INFO', message, data }));
     },
     error: (message: string, error: any) => {
       console.error(JSON.stringify({ level: 'ERROR', message, error }));
     },
   };