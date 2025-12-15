<template>
  <div class="auth-container">
    <h2>Login to WaveBeat</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <input type="email" v-model="email" placeholder="Email" required />
      </div>
      <div class="form-group">
        <input type="password" v-model="password" placeholder="Password" required />
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    <p class="switch-form">
      Don't have an account? <router-link to="/signup">Sign Up</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/authService'

const email = ref('')
const password = ref('')
const error = ref(null)
const isLoading = ref(false)
const router = useRouter()

const handleLogin = async () => {
  isLoading.value = true
  error.value = null
  try {
    await login(email.value, password.value)
    router.push('/') // Redirect to home on successful login
  } catch (err) {
    error.value = 'Failed to login. Please check your credentials.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}
h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
input {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--bg-elevation);
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--text-primary);
}
.error-message {
  color: #e53e3e;
  margin-bottom: 1rem;
  text-align: center;
}
.switch-form {
  text-align: center;
  margin-top: 1.5rem;
}
.switch-form a {
  color: var(--brand-green);
  text-decoration: none;
}
button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--brand-green);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
