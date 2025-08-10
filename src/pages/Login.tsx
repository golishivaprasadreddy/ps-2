import { useState } from 'react'
import API from '../api/axios';

// ...existing imports...

export default function Login() {
  // ...existing state and functions...

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // ...existing code to collect credentials...
    const res = await API.post('/api/auth/login', { /* ...credentials... */ });
    if (!res || !res.data) {
      // handle error
      return;
    }
    const data = res.data;
    const email = data?.email ?? data?.user?.email;
    if (email) {
      localStorage.setItem('authUser', JSON.stringify({ email }));
      window.dispatchEvent(new CustomEvent('auth:update', { detail: { email } }));
    }
    // ...existing navigation...
  }

  // ...existing code...
}