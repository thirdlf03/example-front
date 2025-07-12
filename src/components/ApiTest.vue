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

    <div>
      <p>aaaa</p>
      <button @click="testProtectedEndpoint('/health', 'health')" :disabled="loading.scenarios">テスト実行</button>
      <div v-if="responses.health" :class="['response-container', responses.health.error ? 'error' : 'success']">
        {{ responses.health.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">シナリオ一覧</div>
      <div class="endpoint-url">GET /scenarios</div>
      <button @click="testEndpoint('/scenarios', 'scenarios')" :disabled="loading.scenarios">テスト実行</button>
      <span v-if="loading.scenarios" class="loading">実行中...</span>
      <div v-if="responses.scenarios" :class="['response-container', responses.scenarios.error ? 'error' : 'success']">
        {{ responses.scenarios.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">ヘルスチェック（通常）</div>
      <div class="endpoint-url">GET /health</div>
      <button @click="testEndpoint('/health', 'healthNormal')" :disabled="loading.healthNormal">テスト実行</button>
      <span v-if="loading.healthNormal" class="loading">実行中...</span>
      <div v-if="responses.healthNormal" :class="['response-container', responses.healthNormal.error ? 'error' : 'success']">
        {{ responses.healthNormal.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">ヘルスチェック（認証付き）</div>
      <div class="endpoint-url">GET /health</div>
      <div class="endpoint-description">Bearer JWT tokenヘッダー付き</div>
      <button @click="testProtectedEndpoint('/health', 'healthAuth')" :disabled="loading.healthAuth">テスト実行</button>
      <span v-if="loading.healthAuth" class="loading">実行中...</span>
      <div v-if="responses.healthAuth" :class="['response-container', responses.healthAuth.error ? 'error' : 'success']">
        {{ responses.healthAuth.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">コスト情報</div>
      <div class="endpoint-url">GET /costs</div>
      <button @click="testEndpoint('/costs', 'costs')" :disabled="loading.costs">テスト実行</button>
      <span v-if="loading.costs" class="loading">実行中...</span>
      <div v-if="responses.costs" :class="['response-container', responses.costs.error ? 'error' : 'success']">
        {{ responses.costs.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">シナリオ詳細</div>
      <div class="endpoint-url">GET /scenarios/個人ブログ</div>
      <button @click="testEndpoint('/scenarios/個人ブログ', 'scenarioDetail')" :disabled="loading.scenarioDetail">テスト実行</button>
      <span v-if="loading.scenarioDetail" class="loading">実行中...</span>
      <div v-if="responses.scenarioDetail" :class="['response-container', responses.scenarioDetail.error ? 'error' : 'success']">
        {{ responses.scenarioDetail.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">コスト計算</div>
      <div class="endpoint-url">POST /calculate</div>
      <div class="endpoint-description">サンプル構成でコスト計算を実行</div>
      <button @click="testCalculateEndpoint()" :disabled="loading.calculate">テスト実行</button>
      <span v-if="loading.calculate" class="loading">実行中...</span>
      <div v-if="responses.calculate" :class="['response-container', responses.calculate.error ? 'error' : 'success']">
        {{ responses.calculate.content }}
      </div>
    </div>

    <div class="section-divider">
      <h2>🔒 認証が必要なエンドポイント</h2>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">ゲーム一覧取得</div>
      <div class="endpoint-url">GET /play/games</div>
      <div class="endpoint-description">JWTトークンが必要</div>
      <button @click="testProtectedEndpoint('/play/games', 'playGames')" :disabled="loading.playGames">テスト実行</button>
      <span v-if="loading.playGames" class="loading">実行中...</span>
      <div v-if="responses.playGames" :class="['response-container', responses.playGames.error ? 'error' : 'success']">
        {{ responses.playGames.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">ゲームシナリオ取得</div>
      <div class="endpoint-url">GET /play/scenarioes</div>
      <div class="endpoint-description">IDトークンが必要</div>
      <button @click="testProtectedEndpoint('/play/scenarioes', 'playScenarioes')" :disabled="loading.playScenarioes">テスト実行</button>
      <span v-if="loading.playScenarioes" class="loading">実行中...</span>
      <div v-if="responses.playScenarioes" :class="['response-container', responses.playScenarioes.error ? 'error' : 'success']">
        {{ responses.playScenarioes.content }}
      </div>
    </div>

    <div class="endpoint-container">
      <div class="endpoint-title">ゲーム作成</div>
      <div class="endpoint-url">POST /play/create</div>
      <div class="endpoint-description">認証されたユーザーのみアクセス可能</div>
      <button @click="testCreateGameEndpoint()" :disabled="loading.createGame">テスト実行</button>
      <span v-if="loading.createGame" class="loading">実行中...</span>
      <div v-if="responses.createGame" :class="['response-container', responses.createGame.error ? 'error' : 'success']">
        {{ responses.createGame.content }}
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
  scenarios: false,
  healthNormal: false,
  healthAuth: false,
  costs: false,
  scenarioDetail: false,
  calculate: false,
  playGames: false,
  playScenarioes: false,
  createGame: false
})
const responses = reactive({
  scenarios: null,
  healthNormal: null,
  healthAuth: null,
  costs: null,
  scenarioDetail: null,
  calculate: null,
  playGames: null,
  playScenarioes: null,
  createGame: null
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

// POST endpoint for cost calculation
async function testCalculateEndpoint() {
  loading.calculate = true
  responses.calculate = null
  authStatus.value = ''
  
  try {
    const sampleData = {
      struct_data: {
        type: "s3",
        name: "sample-bucket"
      },
      num_requests: 1000
    }
    
    const response = await fetch(baseUrl.value + '/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sampleData)
    })
    
    const data = await response.json()
    
    responses.calculate = {
      content: JSON.stringify(data, null, 2),
      error: false
    }
    authStatus.value = 'API呼び出し成功'
  } catch (error) {
    responses.calculate = {
      content: `エラー: ${error.message}\n\nサーバーが起動していることを確認してください。\nまたは、CORSの設定を確認してください。`,
      error: true
    }
    authStatus.value = 'API呼び出しエラー'
  } finally {
    loading.calculate = false
  }
}

// POST endpoint for game creation
async function testCreateGameEndpoint() {
  loading.createGame = true
  responses.createGame = null
  authStatus.value = ''
  
  try {
    // Get fresh JWT token
    const session = await fetchAuthSession()
    const idToken = session.tokens?.idToken?.toString()
    
    if (!idToken) {
      authStatus.value = 'JWTトークンが取得できませんでした。再ログインしてください。'
      responses.createGame = {
        content: '認証が必要です。ログインしてください。',
        error: true
      }
      return
    }
    
    const gameData = {
      game_name: "テストゲーム",
      scenarioes: "個人ブログ"
    }
    
    const response = await fetch(baseUrl.value + '/play/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(gameData)
    })
    
    if (response.status === 401) {
      authStatus.value = '認証が必要です。JWTトークンが無効です。'
      responses.createGame = {
        content: '401 Unauthorized: 認証が必要です',
        error: true
      }
      return
    }
    
    const data = await response.json()
    
    responses.createGame = {
      content: JSON.stringify(data, null, 2),
      error: false
    }
    authStatus.value = 'API呼び出し成功（認証済み）'
  } catch (error) {
    responses.createGame = {
      content: `エラー: ${error.message}\n\nサーバーが起動していることを確認してください。\nまたは、CORSの設定を確認してください。`,
      error: true
    }
    authStatus.value = 'API呼び出しエラー'
  } finally {
    loading.createGame = false
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
