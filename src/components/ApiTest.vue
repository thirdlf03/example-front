<template>
  <div class="api-test-container">
    <h1>FastAPI テストインターフェース</h1>
    
    <div class="auth-container">
      <div class="endpoint-title">認証状態</div>
      <div v-if="isAuthenticated" class="auth-info">
        <p>ログイン済み: {{ userEmail }}</p>
        <p>JWTトークン: {{ hasToken ? '取得済み' : '未取得' }}</p>
      </div>
      <div v-else class="auth-info">
        <p>未認証: <router-link to="/login">ログインしてください</router-link></p>
      </div>
      <div v-if="authStatus" class="auth-status">
        {{ authStatus }}
      </div>
    </div>
    
    <div class="base-url-container">
      <div class="endpoint-title">ベースURL設定</div>
      <input type="text" v-model="baseUrl" placeholder="例: http://localhost:8000">
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">ルートエンドポイント</div>
      <div class="endpoint-url">GET /</div>
      <button @click="testEndpoint('/', 'root')" :disabled="loading.root">テスト実行</button>
      <span v-if="loading.root" class="loading">実行中...</span>
      <div v-if="responses.root" :class="['response-container', responses.root.error ? 'error' : 'success']">
        {{ responses.root.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">ヘルスチェック</div>
      <div class="endpoint-url">GET /health</div>
      <button @click="testEndpoint('/health', 'health')" :disabled="loading.health">テスト実行</button>
      <span v-if="loading.health" class="loading">実行中...</span>
      <div v-if="responses.health" :class="['response-container', responses.health.error ? 'error' : 'success']">
        {{ responses.health.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">テストエンドポイント</div>
      <div class="endpoint-url">GET /test</div>
      <button @click="testEndpoint('/test', 'test')" :disabled="loading.test">テスト実行</button>
      <span v-if="loading.test" class="loading">実行中...</span>
      <div v-if="responses.test" :class="['response-container', responses.test.error ? 'error' : 'success']">
        {{ responses.test.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">設定情報</div>
      <div class="endpoint-url">GET /config</div>
      <button @click="testEndpoint('/config', 'config')" :disabled="loading.config">テスト実行</button>
      <span v-if="loading.config" class="loading">実行中...</span>
      <div v-if="responses.config" :class="['response-container', responses.config.error ? 'error' : 'success']">
        {{ responses.config.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">オプション認証エンドポイント</div>
      <div class="endpoint-url">GET /optional-auth</div>
      <div class="endpoint-description">認証があればユーザー情報、なければ匿名として応答</div>
      <button @click="testEndpoint('/optional-auth', 'optionalAuth')" :disabled="loading.optionalAuth">テスト実行</button>
      <span v-if="loading.optionalAuth" class="loading">実行中...</span>
      <div v-if="responses.optionalAuth" :class="['response-container', responses.optionalAuth.error ? 'error' : 'success']">
        {{ responses.optionalAuth.content }}
      </div>
    </div>

    <div class="section-divider">
      <h2>🔒 認証が必要なエンドポイント</h2>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">保護されたエンドポイント</div>
      <div class="endpoint-url">GET /protected</div>
      <div class="endpoint-description">JWTトークンが必要（IDトークンまたはアクセストークン）</div>
      <button @click="testProtectedEndpoint('/protected', 'protected')" :disabled="loading.protected">テスト実行</button>
      <span v-if="loading.protected" class="loading">実行中...</span>
      <div v-if="responses.protected" :class="['response-container', responses.protected.error ? 'error' : 'success']">
        {{ responses.protected.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">ユーザープロフィール</div>
      <div class="endpoint-url">GET /user/profile</div>
      <div class="endpoint-description">IDトークンが必要</div>
      <button @click="testProtectedEndpoint('/user/profile', 'userProfile')" :disabled="loading.userProfile">テスト実行</button>
      <span v-if="loading.userProfile" class="loading">実行中...</span>
      <div v-if="responses.userProfile" :class="['response-container', responses.userProfile.error ? 'error' : 'success']">
        {{ responses.userProfile.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">管理者エンドポイント</div>
      <div class="endpoint-url">GET /admin</div>
      <div class="endpoint-description">認証されたユーザーのみアクセス可能</div>
      <button @click="testProtectedEndpoint('/admin', 'admin')" :disabled="loading.admin">テスト実行</button>
      <span v-if="loading.admin" class="loading">実行中...</span>
      <div v-if="responses.admin" :class="['response-container', responses.admin.error ? 'error' : 'success']">
        {{ responses.admin.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'

const baseUrl = ref(import.meta.env.VITE_API_ENDPOINT || 'http://localhost:8000')
const authStatus = ref('')
const isAuthenticated = ref(false)
const userEmail = ref('')
const hasToken = ref(false)
const loading = reactive({
  root: false,
  health: false,
  test: false,
  config: false,
  optionalAuth: false,
  protected: false,
  userProfile: false,
  admin: false
})
const responses = reactive({
  root: null,
  health: null,
  test: null,
  config: null,
  optionalAuth: null,
  protected: null,
  userProfile: null,
  admin: null
})

const checkAuthStatus = async () => {
  try {
    const user = await getCurrentUser()
    const session = await fetchAuthSession()
    
    if (session.tokens) {
      isAuthenticated.value = true
      userEmail.value = session.tokens.idToken?.payload?.email || 'Unknown'
      hasToken.value = true
    }
  } catch (error) {
    isAuthenticated.value = false
    userEmail.value = ''
    hasToken.value = false
  }
}

// Public endpoints (認証不要)
async function testEndpoint(endpoint, responseKey) {
  loading[responseKey] = true
  responses[responseKey] = null
  authStatus.value = ''
  
  try {
    const response = await fetch(baseUrl.value + endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    responses[responseKey] = {
      content: JSON.stringify(data, null, 2),
      error: false
    }
    authStatus.value = 'API呼び出し成功'
  } catch (error) {
    responses[responseKey] = {
      content: `エラー: ${error.message}\n\nサーバーが起動していることを確認してください。\nまたは、CORSの設定を確認してください。`,
      error: true
    }
    authStatus.value = 'API呼び出しエラー'
  } finally {
    loading[responseKey] = false
  }
}

// Protected endpoints (認証必要)
async function testProtectedEndpoint(endpoint, responseKey) {
  loading[responseKey] = true
  responses[responseKey] = null
  authStatus.value = ''
  
  try {
    // Get fresh JWT token
    const session = await fetchAuthSession()
    const idToken = session.tokens?.idToken?.toString()
    
    if (!idToken) {
      authStatus.value = 'JWTトークンが取得できませんでした。再ログインしてください。'
      responses[responseKey] = {
        content: '認証が必要です。ログインしてください。',
        error: true
      }
      return
    }
    
    const response = await fetch(baseUrl.value + endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    })
    
    if (response.status === 401) {
      authStatus.value = '認証が必要です。JWTトークンが無効です。'
      responses[responseKey] = {
        content: '401 Unauthorized: 認証が必要です',
        error: true
      }
      return
    }
    
    if (response.status === 403) {
      authStatus.value = 'アクセス権限がありません。'
      responses[responseKey] = {
        content: '403 Forbidden: アクセス権限がありません',
        error: true
      }
      return
    }
    
    const data = await response.json()
    
    responses[responseKey] = {
      content: JSON.stringify(data, null, 2),
      error: false
    }
    authStatus.value = 'API呼び出し成功（認証済み）'
  } catch (error) {
    responses[responseKey] = {
      content: `エラー: ${error.message}\n\nサーバーが起動していることを確認してください。\nまたは、CORSの設定を確認してください。`,
      error: true
    }
    authStatus.value = 'API呼び出しエラー'
  } finally {
    loading[responseKey] = false
  }
}

onMounted(() => {
  checkAuthStatus()
})
</script>

<style scoped>
.api-test-container {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

h1 {
  color: #333;
  text-align: center;
}

.endpoint-container,
.base-url-container,
.auth-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.endpoint-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
}

.endpoint-url {
  font-family: monospace;
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 10px;
}

button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.response-container {
  margin-top: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.response-container.error {
  background-color: #ffebee;
  border-color: #f44336;
  color: #c62828;
}

.response-container.success {
  background-color: #e8f5e9;
  border-color: #4caf50;
  color: #2e7d32;
}

.loading {
  display: inline-block;
  margin-left: 10px;
  color: #666;
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.auth-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.auth-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.login-button {
  background-color: #2196F3;
  color: white;
}

.login-button:hover {
  background-color: #1976D2;
}

.logout-button {
  background-color: #f44336;
  color: white;
}

.logout-button:hover {
  background-color: #d32f2f;
}

.auth-status {
  padding: 10px;
  background-color: #e3f2fd;
  border-radius: 4px;
  border-left: 4px solid #2196F3;
  color: #0d47a1;
  font-size: 14px;
}

.auth-info {
  margin-bottom: 15px;
}

.auth-info p {
  margin: 5px 0;
  font-size: 14px;
}

.auth-info a {
  color: #2196F3;
  text-decoration: none;
}

.auth-info a:hover {
  text-decoration: underline;
}

.section-divider {
  margin: 30px 0 20px 0;
  text-align: center;
}

.section-divider h2 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  display: inline-block;
}

.endpoint-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #3498db;
}
</style>