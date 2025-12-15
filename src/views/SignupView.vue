<template>
  <div class="auth-container">
    <h2>Create your WaveBeat Account</h2>
    <form @submit.prevent="handleSignup">
      <div class="form-group">
        <input type="text" v-model="displayName" placeholder="Display Name" required />
      </div>
      <div class="form-group">
        <input type="email" v-model="email" placeholder="Email" required />
      </div>
      <div class="form-group">
        <input
          type="password"
          v-model="password"
          placeholder="Password (min. 6 characters)"
          required
        />
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Creating account...' : 'Sign Up' }}
      </button>
    </form>
    <p class="switch-form">Already have an account? <router-link to="/login">Login</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signup } from '../services/authService'

const displayName = ref('')
const email = ref('')
const password = ref('')
const error = ref(null)
const isLoading = ref(false)
const router = useRouter()

const handleSignup = async () => {
  isLoading.value = true
  error.value = null
  try {
    await signup(email.value, password.value, displayName.value)
    router.push('/') // Redirect to home on successful signup
  } catch (err) {
    error.value = err.message || 'Failed to create an account.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Using the same styles as Login.vue */
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
