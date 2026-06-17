<template>
  <div class="callback-container">
    <div class="glass-card">
      <div class="spinner-wrapper">
        <div class="premium-spinner"></div>
        <div class="pulse-ring"></div>
      </div>
      
      <!-- Error Message Box -->
      <div v-if="errorMessage" class="error-box">
        <span class="error-icon">⚠️</span>
        <p class="error-text">{{ errorMessage }}</p>
        <button @click="goToLogin" class="retry-btn">Kembali ke Login</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { supabase } from '../config/supabase';

const router = useRouter();

const statusTitle = ref('Menghubungkan Akun...');
const statusDescription = ref('Sedang menyelaraskan profil Google Anda dengan sistem kami. Mohon tunggu...');
const errorMessage = ref('');

const goToLogin = () => {
  router.push('/login');
};

onMounted(async () => {
  try {
    // 1. Dapatkan sesi Google dari Supabase Auth
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (!data || !data.session) {
      throw new Error('Sesi otentikasi tidak ditemukan. Silakan masuk kembali.');
    }
    
    const user = data.session.user;
    
    // Ekstrak metadata Google
    const email = user.email;
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'Google User';
    const profileImageUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
    
    statusTitle.value = 'Sinkronisasi Profil...';
    statusDescription.value = 'Mempersiapkan akun dan hak akses Anda...';
    
    // 2. Kirim ke backend Express kita untuk login/register hibrida
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google-login`;
    const response = await axios.post(apiUrl, {
      email,
      fullName,
      profileImageUrl
    });
    
    // 3. Simpan token JWT & data user kustom kita ke localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('role', response.data.user.role);
    localStorage.setItem('userFullName', response.data.user.fullName || '');
    localStorage.setItem('userEmail', response.data.user.email || '');
    localStorage.setItem('userAvatar', response.data.user.profileImageUrl || '');
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('loginMethod', 'google');
    
    // Dispatch event agar state global reaktif di navbar ter-update
    window.dispatchEvent(new Event('storage'));
    
    statusTitle.value = 'Berhasil Terhubung!';
    statusDescription.value = 'Login sukses. Mengalihkan Anda ke halaman utama...';
    
    // Hapus sesi Supabase lokal agar tidak tumpang tindih
    await supabase.auth.signOut();
    
    // 4. Redirect ke beranda
    setTimeout(() => {
      router.push('/');
    }, 1500);
    
  } catch (err) {
    console.error('Google Auth Callback Error:', err);
    statusTitle.value = 'Otentikasi Gagal';
    statusDescription.value = 'Kami tidak dapat memproses login Google Anda saat ini.';
    errorMessage.value = err.response?.data?.message || err.message || 'Terjadi kesalahan sistem.';
  }
});
</script>

<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, #0f172a, #020617);
  font-family: 'Outfit', sans-serif;
  color: #f1f5f9;
  padding: 1.5rem;
}

.glass-card {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px);
  border: 1px border rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem 2rem;
  width: 100%;
  max-width: 460px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.spinner-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.premium-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-top: 4px solid #3b82f6;
  border-right: 4px solid #6366f1;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  z-index: 2;
}

.pulse-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(99, 102, 241, 0.2);
  border-radius: 50%;
  animation: pulse 1.8s ease-out infinite;
  z-index: 1;
}

.loading-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, #60a5fa, #a5b4fc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.loading-desc {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.error-box {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1rem;
  animation: fadeInUp 0.4s ease-out;
}

.error-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.error-text {
  color: #fca5a5;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.retry-btn {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% {
    transform: scale(0.7);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
