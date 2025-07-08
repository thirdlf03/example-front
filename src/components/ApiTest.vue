<template>
  <div class="api-test-container">
    <h1>FastAPI テストインターフェース</h1>
    
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const baseUrl = ref('http://localhost:8000')
const loading = reactive({
  root: false,
  health: false,
  test: false
})
const responses = reactive({
  root: null,
  health: null,
  test: null
})

async function testEndpoint(endpoint, responseKey) {
  loading[responseKey] = true
  responses[responseKey] = null
  
  try {
    const response = await fetch(baseUrl.value + endpoint)
    const data = await response.json()
    
    responses[responseKey] = {
      content: JSON.stringify(data, null, 2),
      error: false
    }
  } catch (error) {
    responses[responseKey] = {
      content: `エラー: ${error.message}\n\nサーバーが起動していることを確認してください。\nコマンド: python main.py`,
      error: true
    }
  } finally {
    loading[responseKey] = false
  }
}
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
.base-url-container {
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
</style>