# Star Wars Weather API

This is a serverless RESTful API built with Node.js 20, TypeScript, and Serverless Framework, deployed on AWS Lambda with API Gateway and DynamoDB. It integrates the Star Wars API (SWAPI) and OpenWeatherMap API to fuse character and planet data with weather information, caches responses for 30 minutes, and provides endpoints for storing custom data and retrieving history. The project includes unit and integration tests with Jest and supports bonus features like AWS Cognito authentication and Swagger documentation.

## Prerequisites

- **Node.js**: Version 20.x
- **AWS CLI**: Configured with valid credentials
- **AWS Account**: For deployment
- **OpenWeatherMap API Key**: Sign up at [OpenWeatherMap](https://openweathermap.org/) for a free API key
- **Git**: For cloning the repository (optional)
- **NPM**: For dependency management

## Project Structure

```
├── src
│   ├── handlers/          # Lambda handlers for endpoints
│   ├── services/         # API and database services
│   ├── models/           # Data models
│   ├── utils/            # Utility functions (e.g., logging)
│   ├── tests/            # Jest unit and integration tests
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── serverless.yml        # Serverless Framework configuration
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest configuration
├── swagger.yml           # Swagger API documentation
├── README.md             # This file
```

## Setup Instructions

### 1. Clone the Repository (Optional)
If you have a repository, clone it:
```bash
git clone <repository-url>
cd starwars-weather-api
```

Alternatively, create a new directory and initialize the project:
```bash
mkdir starwars-weather-api
cd starwars-weather-api
npm init -y
```

### 2. Install Dependencies
Install the required dependencies:
```bash
npm install
```

The `package.json` includes:
- Dependencies: `axios`, `aws-sdk`, `dotenv`, `serverless`, `uuid`
- Dev Dependencies: `@types/jest`, `@types/node`, `@types/uuid`, `jest`, `serverless-offline`, `serverless-plugin-typescript`, `ts-jest`, `typescript`

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your OpenWeatherMap API key:
```bash
echo "WEATHER_API_KEY=your_openweathermap_api_key" > .env
echo "DYNAMODB_TABLE=starwars-weather-api-data" >> .env
echo "CACHE_TABLE=starwars-weather-api-cache" >> .env
```
Replace `your_openweathermap_api_key` with your actual API key.

### 4. Configure AWS Credentials
Ensure the AWS CLI is installed and configured:
```bash
aws configure
```
Enter your AWS Access Key ID, Secret Access Key, region (e.g., `us-east-1`), and output format (e.g., `json`).

## Running Locally

### 1. Start the Local Server
Use `serverless-offline` to simulate AWS Lambda and API Gateway:
```bash
npm run start
```
This starts the server at `http://localhost:3000`.

### 2. Test Endpoints Locally
Use `curl`, Postman, or a similar tool to test the endpoints:

- **GET /fusionados**: Fetch fused Star Wars and weather data
  ```bash
  curl http://localhost:3000/fusionados?characterId=1
  ```
  Example response:
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

- **POST /almacenar**: Store custom data
  ```bash
  curl -X POST http://localhost:3000/almacenar -H "Content-Type: application/json" -d '{"name":"Test","description":"Test description"}'
  ```
  Example response:
  ```json
  {
    "id": "uuid",
    "name": "Test",
    "description": "Test description",
    "timestamp": 1698765432000
  }
  ```

- **GET /historial**: Retrieve paginated history
  ```bash
  curl http://localhost:3000/historial?limit=5
  ```
  Example response:
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

## Running Tests

### 1. Run Unit and Integration Tests
Execute tests using Jest:
```bash
npm test
```

The tests cover:
- **GET /fusionados**: Cache hits and API data fusion
- **POST /almacenar**: Input validation and storage
- **GET /historial**: Paginated history retrieval

Test files are located in `src/tests/`. Example test coverage:
- `fusedData.test.ts`: Verifies cache and API integration
- `storeData.test.ts`: Ensures valid data storage
- `history.test.ts`: Tests pagination logic

### 2. Mock External APIs
Tests use mocked versions of SWAPI and OpenWeatherMap to avoid external calls. Ensure the `.env` file is present for local testing.

## Deployment

### 1. Deploy to AWS
Deploy the application to AWS Lambda, API Gateway, and DynamoDB:
```bash
npm run deploy
```
This command uses the `serverless.yml` configuration to create:
- Two DynamoDB tables: `starwars-weather-api-data` and `starwars-weather-api-cache`
- Three Lambda functions: `getFusedData`, `storeData`, `getHistory`
- API Gateway endpoints: `/fusionados`, `/almacenar`, `/historial`

The deployment output provides the API Gateway endpoint URLs (e.g., `https://<id>.execute-api.us-east-1.amazonaws.com/prod/`).

### 2. Test Deployed Endpoints
Use the API Gateway URLs to test the deployed endpoints, similar to local testing:
```bash
curl https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/fusionados?characterId=1
```

### 3. Monitor Logs
Check logs in AWS CloudWatch under the `/aws/lambda/starwars-weather-api-*` log group. The `logger.ts` utility logs `INFO` and `ERROR` levels for debugging.

## Configuration Details

### Environment Variables
- `WEATHER_API_KEY`: OpenWeatherMap API key
- `DYNAMODB_TABLE`: Name of the DynamoDB table for data storage (`starwars-weather-api-data`)
- `CACHE_TABLE`: Name of the DynamoDB table for caching (`starwars-weather-api-cache`)

### AWS Resources
- **Lambda**: Configured with 128MB memory and 10-second timeout for cost efficiency.
- **DynamoDB**: Uses on-demand billing and TTL for cache table.
- **API Gateway**: Exposes REST endpoints with optional Cognito authentication.
- **CloudWatch**: Logs API requests and errors.

### Bonus Features
- **AWS Cognito**: Protects `/almacenar` and `/historial` endpoints (configured in `serverless.yml`).
- **Swagger Documentation**: Available in `swagger.yml`. Serve locally with `swagger-ui-express` or integrate with API Gateway.
- **Rate Limiting**: Configured in API Gateway via usage plans in `serverless.yml`.
- **AWS X-Ray**: Enabled for tracing (optional, configured in `serverless.yml`).

## Cost Optimization
- **Lambda**: Minimal memory (128MB) and timeout (10s).
- **DynamoDB**: On-demand billing to avoid over-provisioning; TTL for cache cleanup.
- **API Gateway**: Optional caching for GET endpoints to reduce costs.

## Troubleshooting
- **SWAPI Issues**: SWAPI may be rate-limited. Use mocks during testing.
- **OpenWeatherMap**: Ensure a valid API key is set in `.env`.
- **Deployment Errors**: Verify AWS credentials and region in `aws configure`.
- **Tests Failing**: Check mocks and `.env` configuration.

## Cleanup
Remove AWS resources to avoid costs:
```bash
serverless remove --stage prod
```

## Additional Notes
- **Caching**: Responses are cached in DynamoDB for 30 minutes using TTL.
- **Testing**: Expand integration tests with `cucumber-js` for Gherkin/BDD (optional).
- **Documentation**: View `swagger.yml` with Swagger UI for endpoint details.
- **Extensibility**: Add more planet-to-city mappings in `weatherService.ts` for broader coverage.

For further assistance, contact the project maintainer or refer to the [Serverless Framework documentation](https://www.serverless.com/framework/docs).