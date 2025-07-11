<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Welcome</h1>
      <p class="subtitle">Sign in to access the API</p>
      
      <div v-if="!isAuthenticated">
        <button @click="signInWithGoogle" class="google-signin-btn">
          <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
      
      <div v-else class="user-info">
        <p>Welcome, {{ userEmail }}!</p>
        <button @click="signOut" class="signout-btn">Sign Out</button>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { signInWithRedirect, signOut as amplifySignOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

export default {
  name: 'LoginComponent',
  setup() {
    const isAuthenticated = ref(false);
    const userEmail = ref('');
    const error = ref('');

    const checkAuthStatus = async () => {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        
        if (session.tokens) {
          isAuthenticated.value = true;
          userEmail.value = session.tokens.idToken?.payload?.email || 'User';
          
          // Store the JWT token for API calls
          localStorage.setItem('idToken', session.tokens.idToken.toString());
          localStorage.setItem('accessToken', session.tokens.accessToken.toString());
        }
      } catch (err) {
        isAuthenticated.value = false;
        userEmail.value = '';
        localStorage.removeItem('idToken');
        localStorage.removeItem('accessToken');
      }
    };

    const signInWithGoogle = async () => {
      try {
        error.value = '';
        await signInWithRedirect({ provider: 'Google' });
      } catch (err) {
        error.value = 'Failed to initiate sign in: ' + err.message;
      }
    };

    const signOut = async () => {
      try {
        await amplifySignOut();
        isAuthenticated.value = false;
        userEmail.value = '';
        localStorage.removeItem('idToken');
        localStorage.removeItem('accessToken');
        window.location.reload();
      } catch (err) {
        error.value = 'Failed to sign out: ' + err.message;
      }
    };

    onMounted(() => {
      checkAuthStatus();
    });

    return {
      isAuthenticated,
      userEmail,
      error,
      signInWithGoogle,
      signOut
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 300px;
}

h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.google-signin-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background-color: white;
  color: #3c4043;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.google-signin-btn:hover {
  background-color: #f8f9fa;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3);
}

.google-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.user-info {
  margin-top: 1rem;
}

.signout-btn {
  margin-top: 1rem;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #dc3545;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.signout-btn:hover {
  background-color: #c82333;
}

.error-message {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c33;
  font-size: 14px;
}
</style>