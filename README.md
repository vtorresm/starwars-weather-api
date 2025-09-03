# Star Wars Weather API

Esta es una API RESTful serverless desarrollada con Node.js 20, TypeScript, y Serverless Framework, desplegada en AWS Lambda con API Gateway y DynamoDB. Integra la API de Star Wars (SWAPI) y la API de OpenWeatherMap para combinar datos de personajes y planetas con información meteorológica, implementa un sistema de caché de 30 minutos, y ofrece endpoints para almacenar datos personalizados y recuperar historial. Incluye características adicionales como autenticación con AWS Cognito (opcional), documentación con Swagger, Rate Limiting, y monitoreo con AWS X-Ray.

## Características
- **Endpoints**:
  - `GET /fusionados`: Combina datos de SWAPI y OpenWeatherMap, con caché en DynamoDB.
  - `POST /almacenar`: Almacena datos personalizados en DynamoDB.
  - `GET /historial`: Recupera el historial de datos fusionados, con paginación.
- **Rate Limiting**: Limita solicitudes en el endpoint `/fusionados` (5 por segundo, 10 simultáneas).
- **AWS X-Ray**: Rastrea latencias y trazabilidad de solicitudes.
- **Caché**: Almacena respuestas de APIs externas en DynamoDB con TTL de 30 minutos.
- **Pruebas**: Unitarias e integración con Jest.
- **Documentación**: Swagger en `swagger.yml`.

## Prerrequisitos

- **Node.js**: Versión 20.x
- **AWS CLI**: Configurado con credenciales válidas
- **Cuenta de AWS**: Para despliegue
- **Clave de API de OpenWeatherMap**: Regístrate en [OpenWeatherMap](https://openweathermap.org/) para obtener una clave gratuita
- **Postman**: Para pruebas de API
- **Git**: Opcional, para clonar el repositorio
- **NPM**: Para gestionar dependencias

## Estructura del Proyecto

```
├── src
│   ├── handlers/          # Handlers de Lambda para los endpoints
│   ├── services/         # Servicios para APIs y base de datos
│   ├── models/           # Modelos de datos
│   ├── utils/            # Funciones de utilidad (e.g., logging, X-Ray)
│   ├── tests/            # Pruebas unitarias e integración
├── .env                  # Variables de entorno
├── package.json          # Dependencias y scripts
├── serverless.yml        # Configuración de Serverless Framework
├── tsconfig.json         # Configuración de TypeScript
├── jest.config.js        # Configuración de Jest
├── swagger.yml           # Documentación de la API con Swagger
├── README.md             # Este archivo
```

## Configuración Inicial

### 1. Clonar el Repositorio (Opcional)
Si tienes un repositorio, clónalo:
```bash
git clone <repository-url>
cd starwars-weather-api
```

Alternativamente, crea un nuevo directorio:
```bash
mkdir starwars-weather-api
cd starwars-weather-api
npm init -y
```

### 2. Instalar Dependencias
Instala las dependencias listadas en `package.json`:
```bash
npm install
```

Dependencias principales:
- `axios`, `aws-sdk`, `aws-xray-sdk`, `dotenv`, `serverless`, `uuid`
- Dev: `@types/jest`, `@types/node`, `@types/uuid`, `jest`, `serverless-offline`, `serverless-plugin-typescript`, `ts-jest`, `typescript`

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en el directorio raíz:
```bash
echo "WEATHER_API_KEY=tu_clave_openweathermap" > .env
echo "DYNAMODB_TABLE=starwars-weather-api-data" >> .env
echo "CACHE_TABLE=starwars-weather-api-cache" >> .env
echo "API_KEY=tu_clave_api_gateway" >> .env
```
- Reemplaza `tu_clave_openweathermap` con tu clave de OpenWeatherMap.
- Reemplaza `tu_clave_api_gateway` con una clave para Rate Limiting (opcional, se genera automáticamente al desplegar si no se especifica).

### 4. Configurar Credenciales de AWS
Asegúrate de tener el AWS CLI instalado y configurado:
```bash
aws configure
```
Ingresa tu Access Key ID, Secret Access Key, región (e.g., `us-east-1`), y formato de salida (e.g., `json`).

## Levantar la Aplicación Localmente

### 1. Iniciar el Servidor Local
Usa `serverless-offline` para simular AWS Lambda y API Gateway:
```bash
npm run start
```
Esto inicia el servidor en `http://localhost:3000`.

### 2. Probar Endpoints Localmente

#### Usando cURL
- **GET /fusionados**: Obtiene datos combinados de SWAPI y OpenWeatherMap.
  ```bash
  curl -H "x-api-key: tu_clave_api_gateway" http://localhost:3000/fusionados?characterId=1
  ```
  Respuesta esperada:
  ```json
  {
    "id": "uuid",
    "characterName": "Luke Skywalker",
    "planetName": "Tatooine",
    "planetClimate": "arid",
    "weather": {
      "temperature": 30,
      "description": "sunny",
      "humidity": 10
    },
    "timestamp": 1698765432000
  }
  ```
  Nota: En local, `x-api-key` puede no ser necesario si `private: true` no está activo en `serverless.yml`.

- **POST /almacenar**: Almacena datos personalizados.
  ```bash
  curl -X POST http://localhost:3000/almacenar -H "Content-Type: application/json" -d '{"name":"Test","description":"Test description"}'
  ```
  Respuesta esperada:
  ```json
  {
    "id": "uuid",
    "name": "Test",
    "description": "Test description",
    "timestamp": 1698765432000
  }
  ```

- **GET /historial**: Recupera el historial paginado.
  ```bash
  curl http://localhost:3000/historial?limit=5
  ```
  Respuesta esperada:
  ```json
  [
    {
      "id": "fused_uuid",
      "characterName": "Luke Skywalker",
      "planetName": "Tatooine",
      "planetClimate": "arid",
      "weather": { ... },
      "timestamp": 1698765432000
    }
  ]
  ```

#### Usando Postman
1. **Configurar Postman**:
   - Descarga e instala Postman desde [Postman](https://www.postman.com/).
   - Crea una nueva colección llamada `StarWarsWeatherAPI`.

2. **GET /fusionados**:
   - Crea una nueva solicitud en Postman:
     - Método: GET
     - URL: `http://localhost:3000/fusionados?characterId=1`
     - Headers: Añade `x-api-key: tu_clave_api_gateway` (si aplica).
   - Envía la solicitud y verifica la respuesta JSON (similar a la de cURL).

3. **POST /almacenar**:
   - Crea una nueva solicitud:
     - Método: POST
     - URL: `http://localhost:3000/almacenar`
     - Headers: `Content-Type: application/json`
     - Body: Selecciona `raw` > `JSON` y añade:
       ```json
       {
         "name": "Test",
         "description": "Test description"
       }
       ```
   - Envía la solicitud y verifica el código 201 y la respuesta JSON.

4. **GET /historial**:
   - Crea una nueva solicitud:
     - Método: GET
     - URL: `http://localhost:3000/historial?limit=5`
   - Envía la solicitud y verifica la lista de datos fusionados.

### 3. Probar Rate Limiting Localmente
Nota: Rate Limiting no funciona completamente en `serverless-offline`. Debes probarlo en el entorno desplegado (ver más adelante).

### 4. Probar AWS X-Ray Localmente
X-Ray no envía datos en modo local, pero puedes verificar que no genera errores ejecutando las solicitudes anteriores. Los logs en la consola mostrarán las operaciones instrumentadas.

## Ejecutar Pruebas

### 1. Ejecutar Pruebas Unitarias e Integración
Ejecuta las pruebas con Jest:
```bash
npm test
```

Las pruebas cubren:
- **GET /fusionados**: Verifica caché y fusión de datos.
- **POST /almacenar**: Valida almacenamiento y manejo de errores.
- **GET /historial**: Comprueba paginación.
- **X-Ray**: Verifica creación de subsegmentos (mockeados).

Archivos de pruebas: `src/tests/fusedData.test.ts`, `src/tests/storeData.test.ts`, `src/tests/history.test.ts`.

### 2. Probar con Postman
Añade pruebas automáticas en Postman:
- Para `GET /fusionados`:
  ```javascript
  pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
  });
  pm.test("Response has characterName", () => {
    const response = pm.response.json();
    pm.expect(response.characterName).to.be.a('string');
  });
  ```

- Para `POST /almacenar`:
  ```javascript
  pm.test("Status code is 201", () => {
    pm.response.to.have.status(201);
  });
  pm.test("Response has id", () => {
    const response = pm.response.json();
    pm.expect(response.id).to.be.a('string');
  });
  ```

- Para `GET /historial`:
  ```javascript
  pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
  });
  pm.test("Response is an array", () => {
    const response = pm.response.json();
    pm.expect(response).to.be.an('array');
  });
  ```

## Levantar la Aplicación en Producción

### 1. Desplegar a AWS
Despliega la aplicación a AWS Lambda, API Gateway, y DynamoDB:
```bash
npm run deploy
```

Esto crea:
- Tablas DynamoDB: `starwars-weather-api-data` y `starwars-weather-api-cache`
- Funciones Lambda: `getFusedData`, `storeData`, `getHistory`
- Endpoints de API Gateway: `/fusionados`, `/almacenar`, `/historial`
- Clave de API y plan de uso para Rate Limiting
- Configuración de X-Ray para trazabilidad

La salida del despliegue proporciona las URLs de API Gateway (e.g., `https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/`).

### 2. Obtener la Clave de API
1. Ve a la consola de AWS API Gateway.
2. En **API Keys**, encuentra la clave generada (`starwarsWeatherApiKey`) o usa la definida en `.env` (`API_KEY`).
3. Copia la clave para usarla en las pruebas.

### 3. Probar Endpoints en Producción

#### Usando cURL
- **GET /fusionados** (con Rate Limiting):
  ```bash
  curl -H "x-api-key: tu_clave_api_gateway" https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/fusionados?characterId=1
  ```
  Respuesta esperada: Similar a la prueba local.
  Para probar Rate Limiting, envía múltiples solicitudes rápidas:
  ```bash
  for i in {1..15}; do curl -H "x-api-key: tu_clave_api_gateway" https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/fusionados?characterId=1; done
  ```
  Deberías ver errores `429 Too Many Requests` después de exceder el límite (5 solicitudes/segundo, 10 simultáneas).

- **POST /almacenar**:
  ```bash
  curl -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/almacenar -H "Content-Type: application/json" -d '{"name":"Test","description":"Test description"}'
  ```
  Respuesta esperada: Código 201 y datos almacenados.

- **GET /historial**:
  ```bash
  curl https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/historial?limit=5
  ```
  Respuesta esperada: Lista de datos fusionados.

#### Usando Postman
1. **Configurar entorno en Postman**:
   - Crea un entorno llamado `Producción`.
   - Añade variables:
     - `baseUrl`: `https://<api-id>.execute-api.us-east-1.amazonaws.com/prod`
     - `apiKey`: `tu_clave_api_gateway`

2. **GET /fusionados**:
   - Método: GET
   - URL: `{{baseUrl}}/fusionados?characterId=1`
   - Headers: `x-api-key: {{apiKey}}`
   - Envía la solicitud y verifica la respuesta JSON.
   - Para probar Rate Limiting, crea un script en Postman para enviar múltiples solicitudes:
     ```javascript
     for (let i = 0; i < 15; i++) {
       pm.sendRequest({
         url: '{{baseUrl}}/fusionados?characterId=1',
         method: 'GET',
         header: { 'x-api-key': '{{apiKey}}' }
       });
     }
     ```
     Verifica errores `429` en las respuestas.

3. **POST /almacenar**:
   - Método: POST
   - URL: `{{baseUrl}}/almacenar`
   - Headers: `Content-Type: application/json`
   - Body: `raw` > `JSON`:
     ```json
     {
       "name": "Test",
       "description": "Test description"
     }
     ```
   - Envía y verifica el código 201.

4. **GET /historial**:
   - Método: GET
   - URL: `{{baseUrl}}/historial?limit=5`
   - Envía y verifica la lista de datos.

### 4. Probar AWS X-Ray en Producción
1. Realiza solicitudes a los endpoints desplegados usando cURL o Postman.
2. Ve a la consola de AWS X-Ray:
   - Navega a **X-Ray** > **Traces** en tu región (e.g., `us-east-1`).
   - Busca trazos para `/fusionados`, `/almacenar`, y `/historial`.
   - Verifica los subsegmentos:
     - `GetFusedData`, `StoreData`, `GetHistory` (handlers)
     - `SWAPI`, `OpenWeatherMap`, `DynamoDB_*` (servicios)
   - Revisa el **Service Map** para ver interacciones entre API Gateway, Lambda, DynamoDB, y APIs externas.
   - Analiza latencias para optimizar el rendimiento.

## Monitoreo y Optimización

### 1. CloudWatch Logs
- Revisa los logs en AWS CloudWatch bajo `/aws/lambda/starwars-weather-api-*` para errores y métricas.
- Busca mensajes `INFO` y `ERROR` generados por `logger.ts`.

### 2. Rate Limiting
- Monitorea el uso en la consola de API Gateway > **Usage Plans** > **main**.
- Ajusta `burstLimit`, `rateLimit`, o `quota` en `serverless.yml` si es necesario y redeploy:
  ```bash
  npm run deploy
  ```

### 3. AWS X-Ray
- Usa el **Service Map** y los trazos para identificar cuellos de botella (e.g., APIs externas lentas).
- Optimiza la memoria de Lambda (128MB por defecto) si las latencias son altas.

## Limpieza

Para evitar costos, elimina los recursos de AWS:
```bash
serverless remove --stage prod
```

## Notas Adicionales
- **Rate Limiting**: Solo funciona en producción. Ajusta los límites según necesidades.
- **AWS X-Ray**: Agrega un costo mínimo, pero es útil para depuración. Desactiva (`tracing.lambda: false`) si no es necesario.
- **Caché**: Verifica en DynamoDB (`starwars-weather-api-cache`) que las respuestas se almacenen con TTL de 30 minutos.
- **Swagger**: Usa `swagger.yml` con Swagger UI para explorar la documentación.
- **Problemas Comunes**:
  - **SWAPI lento**: Usa mocks en pruebas locales.
  - **Clave de API inválida**: Verifica la clave en AWS API Gateway.
  - **Errores de X-Ray**: Asegúrate de que los permisos IAM incluyan `xray:PutTraceSegments`.

Para soporte adicional, consulta la documentación de [Serverless Framework](https://www.serverless.com/framework/docs) o contacta al mantenedor del proyecto.