<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigationItems = computed(() => [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'API Test', path: '/api-test' }
])

const navigate = (path) => {
  router.push(path)
}
</script>

<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <h1 class="nav-title">Example App</h1>
        <ul class="nav-menu">
          <li v-for="item in navigationItems" :key="item.name" class="nav-item">
            <button @click="navigate(item.path)" class="nav-link">
              {{ item.name }}
            </button>
          </li>
        </ul>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.navbar {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-title {
  margin: 0;
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1rem;
}

.nav-item {
  margin: 0;
}

.nav-link {
  background: none;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #34495e;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
</style>
