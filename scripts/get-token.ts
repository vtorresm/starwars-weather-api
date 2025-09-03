#!/usr/bin/env node

import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider({ region: 'us-east-1' });
const CLIENT_ID = '5m24kbogjpi8u1jgfvhfn3jtdk';

async function getToken() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage:
  # Get token with username/password
  npx ts-node scripts/get-token.ts login <username> <password>
  
  # Refresh token
  npx ts-node scripts/get-token.ts refresh <refresh_token>
  
  # Check if token is expired
  npx ts-node scripts/get-token.ts check <access_token>
    `);
    process.exit(1);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'login': {
        const [, username, password] = args;
        if (!username || !password) {
          console.error('Username and password required');
          process.exit(1);
        }

        const result = await cognito.initiateAuth({
          ClientId: CLIENT_ID,
          AuthFlow: 'USER_PASSWORD_AUTH',
          AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
          },
        }).promise();

        if (result.AuthenticationResult) {
          console.log('🎉 Authentication successful!');
          console.log('\nAccess Token:');
          console.log(result.AuthenticationResult.AccessToken);
          console.log('\nID Token (for API Gateway):');
          console.log(result.AuthenticationResult.IdToken);
          console.log('\nRefresh Token:');
          console.log(result.AuthenticationResult.RefreshToken);
          console.log(`\nExpires in: ${result.AuthenticationResult.ExpiresIn} seconds`);
          
          // Save to environment
          console.log('\n📝 Commands to set as environment variables:');
          console.log(`$env:ACCESS_TOKEN="${result.AuthenticationResult.AccessToken}"`);
          console.log(`$env:ID_TOKEN="${result.AuthenticationResult.IdToken}"`);
          console.log(`$env:REFRESH_TOKEN="${result.AuthenticationResult.RefreshToken}"`);
        }
        break;
      }

      case 'refresh': {
        const [, refreshToken] = args;
        if (!refreshToken) {
          console.error('Refresh token required');
          process.exit(1);
        }

        const result = await cognito.initiateAuth({
          ClientId: CLIENT_ID,
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          AuthParameters: {
            REFRESH_TOKEN: refreshToken,
          },
        }).promise();

        if (result.AuthenticationResult) {
          console.log('🔄 Token refreshed successfully!');
          console.log('\nNew Access Token:');
          console.log(result.AuthenticationResult.AccessToken);
          console.log(`\nExpires in: ${result.AuthenticationResult.ExpiresIn} seconds`);
          
          console.log('\n📝 Command to set as environment variable:');
          console.log(`$env:ACCESS_TOKEN="${result.AuthenticationResult.AccessToken}"`);
        }
        break;
      }

      case 'check': {
        const [, token] = args;
        if (!token) {
          console.error('Token required');
          process.exit(1);
        }

        try {
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          const now = Math.floor(Date.now() / 1000);
          const isExpired = payload.exp < now;
          
          console.log('\n🔍 Token Analysis:');
          console.log(`User: ${payload.username || payload.sub}`);
          console.log(`Expires at: ${new Date(payload.exp * 1000).toISOString()}`);
          console.log(`Current time: ${new Date(now * 1000).toISOString()}`);
          console.log(`Status: ${isExpired ? '❌ EXPIRED' : '✅ VALID'}`);
          
          if (isExpired) {
            console.log('\n💡 Use the refresh command to get a new token');
          }
        } catch (error) {
          console.error('❌ Invalid token format');
          process.exit(1);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message || error);
    process.exit(1);
  }
}

getToken();
