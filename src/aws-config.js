import { Amplify } from 'aws-amplify';

// Amplify configuration
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || 'YOUR_USER_POOL_ID',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || 'YOUR_USER_POOL_CLIENT_ID',
      signUpVerificationMethod: 'code',
      loginWith: {
        oauth: {
          domain: `${import.meta.env.VITE_COGNITO_DOMAIN || 'YOUR_COGNITO_DOMAIN'}.auth.ap-northeast-1.amazoncognito.com`,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [window.location.origin],
          redirectSignOut: [window.location.origin],
          responseType: 'code',
          providers: ['Google']
        }
      }
    }
  }
};

// Configure Amplify
Amplify.configure(awsConfig);

export default awsConfig;