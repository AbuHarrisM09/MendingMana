<script setup>
import { Cpu, Eye, EyeOff, LogIn, AlertCircle, ArrowLeft, UserPlus } from 'lucide-vue-next';
import { useLoginView } from '../composables/useLoginView';
import { supabase } from '../config/supabase';

const {
  logo,
  authMode,
  loginForm,
  registerForm,
  fieldErrors,
  showPassword,
  isSubmitting,
  requestError,
  requestSuccess,
  setMode,
  handleSubmit,
} = useLoginView();

const loginWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    if (error) throw error;
  } catch (err) {
    console.error('Failed to trigger Google OAuth:', err.message);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md animate-fade-in-up">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2.5">
          <img :src="logo" alt="Mending Mana Logo" class="w-12 h-12 object-cover rounded-2xl shadow-lg shadow-blue-600/30" />
          <span class="text-white font-extrabold text-2xl tracking-tight">Mending Mana</span>
        </router-link>
        <p class="text-slate-400 text-sm mt-3">Platform Review & Rating Gadget</p>
      </div>

      <div class="bg-white rounded-3xl shadow-2xl shadow-black/20 p-8">
        <Transition name="fade" mode="out-in">
          <div :key="authMode">
            <!-- Login Mode -->
            <template v-if="authMode === 'login'">
              <h2 class="text-slate-800 mb-1 font-extrabold text-xl">Selamat Datang!</h2>
              <p class="text-slate-500 text-sm mb-6">Masuk ke akun Mending Mana Anda</p>
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                  <label class="block text-sm text-slate-700 mb-1.5 font-bold">Email</label>
                  <input
                    type="email"
                    v-model="loginForm.email"
                    placeholder="nama@email.com"
                    class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                  <p v-if="fieldErrors.email" class="mt-1.5 text-xs text-red-500 font-medium">{{ fieldErrors.email }}</p>
                </div>
                <div>
                  <label class="block text-sm text-slate-700 mb-1.5 font-bold">Password</label>
                  <div class="relative">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      v-model="loginForm.password"
                      placeholder="••••••••"
                      class="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <EyeOff v-if="showPassword" class="w-4 h-4" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>
                  <p v-if="fieldErrors.password" class="mt-1.5 text-xs text-red-500 font-medium">{{ fieldErrors.password }}</p>
                </div>

                <!-- Error / Success -->
                <div v-if="requestError" class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle class="w-4 h-4 text-red-500 shrink-0" />
                  <span class="text-red-600 text-sm font-medium">{{ requestError }}</span>
                </div>
                <div v-if="requestSuccess" class="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span class="text-emerald-600 text-sm font-medium">{{ requestSuccess }}</span>
                </div>

                <div class="flex justify-end">
                  <a href="#" class="text-sm text-blue-600 hover:underline font-medium">Lupa password?</a>
                </div>

                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-600/20"
                >
                  <div v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <LogIn v-else class="w-4 h-4" />
                  {{ isSubmitting ? 'Memproses...' : 'Masuk' }}
                </button>

                <!-- Divider -->
                <div class="relative flex py-1.5 items-center">
                  <div class="flex-grow border-t border-slate-200"></div>
                  <span class="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Atau</span>
                  <div class="flex-grow border-t border-slate-200"></div>
                </div>

                <!-- Google Login Button -->
                <button
                  type="button"
                  @click="loginWithGoogle"
                  class="w-full py-3 border border-slate-200 hover:border-slate-300 rounded-xl text-sm hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-center gap-3 font-bold text-slate-700 shadow-sm"
                >
                  <svg class="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.015c1.472 0 2.802.535 3.843 1.42l3.14-3.14a10.237 10.237 0 0 0-6.983-2.765C8.36 2 3.5 6.86 3.5 12.5S8.36 23 13.99 23c5.78 0 9.51-4.06 9.51-9.7a9.23 9.23 0 0 0-.17-1.742H12.24Z"
                    />
                  </svg>
                  Masuk dengan Google
                </button>
              </form>

              <p class="text-center text-sm text-slate-500 mt-5">
                Belum punya akun?
                <button type="button" @click="setMode('register')" class="text-blue-600 hover:underline font-bold">
                  Daftar Gratis
                </button>
              </p>
            </template>

            <!-- Register Mode -->
            <template v-else>
              <h2 class="text-slate-800 mb-1 font-extrabold text-xl">Buat Akun Baru</h2>
              <p class="text-slate-500 text-sm mb-6">Isi data berikut untuk membuat akun member baru.</p>

              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                  <label class="block text-sm text-slate-700 mb-1.5 font-bold">Nama Lengkap</label>
                  <input
                    v-model="registerForm.fullName"
                    type="text"
                    autocomplete="name"
                    placeholder="Nama lengkap Anda"
                    class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                  <p v-if="fieldErrors.fullName" class="mt-1.5 text-xs text-red-500 font-medium">{{ fieldErrors.fullName }}</p>
                </div>
                <div>
                  <label class="block text-sm text-slate-700 mb-1.5 font-bold">Email</label>
                  <input
                    v-model="registerForm.email"
                    type="email"
                    autocomplete="email"
                    placeholder="nama@email.com"
                    class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                  <p v-if="fieldErrors.email" class="mt-1.5 text-xs text-red-500 font-medium">{{ fieldErrors.email }}</p>
                </div>
                <div>
                  <label class="block text-sm text-slate-700 mb-1.5 font-bold">Password</label>
                  <div class="relative">
                    <input
                      v-model="registerForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      placeholder="Minimal 6 karakter"
                      class="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                    <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      <EyeOff v-if="showPassword" class="w-4 h-4" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>
                  <p v-if="fieldErrors.password" class="mt-1.5 text-xs text-red-500 font-medium">{{ fieldErrors.password }}</p>
                </div>
                <div>
                  <label class="block text-sm text-slate-700 mb-1.5 font-bold">Konfirmasi Password</label>
                  <input
                    v-model="registerForm.confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Ulangi password"
                    class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                  <p v-if="fieldErrors.confirmPassword" class="mt-1.5 text-xs text-red-500 font-medium">{{ fieldErrors.confirmPassword }}</p>
                </div>

                <div v-if="requestError" class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle class="w-4 h-4 text-red-500 shrink-0" />
                  <span class="text-red-600 text-sm font-medium">{{ requestError }}</span>
                </div>
                <div v-if="requestSuccess" class="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span class="text-emerald-600 text-sm font-medium">{{ requestSuccess }}</span>
                </div>

                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-600/20"
                >
                  <div v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <UserPlus v-else class="w-4 h-4" />
                  {{ isSubmitting ? 'Memproses...' : 'Daftar Sekarang' }}
                </button>

                <!-- Divider -->
                <div class="relative flex py-1.5 items-center">
                  <div class="flex-grow border-t border-slate-200"></div>
                  <span class="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Atau</span>
                  <div class="flex-grow border-t border-slate-200"></div>
                </div>

                <!-- Google Register Button -->
                <button
                  type="button"
                  @click="loginWithGoogle"
                  class="w-full py-3 border border-slate-200 hover:border-slate-300 rounded-xl text-sm hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-center gap-3 font-bold text-slate-700 shadow-sm"
                >
                  <svg class="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.015c1.472 0 2.802.535 3.843 1.42l3.14-3.14a10.237 10.237 0 0 0-6.983-2.765C8.36 2 3.5 6.86 3.5 12.5S8.36 23 13.99 23c5.78 0 9.51-4.06 9.51-9.7a9.23 9.23 0 0 0-.17-1.742H12.24Z"
                    />
                  </svg>
                  Daftar dengan Google
                </button>
              </form>

              <p class="text-center text-sm text-slate-500 mt-5">
                Sudah punya akun?
                <button type="button" @click="setMode('login')" class="text-blue-600 hover:underline font-bold">
                  Masuk di sini
                </button>
              </p>
            </template>
          </div>
        </Transition>
      </div>

      <p class="text-center text-slate-500 text-xs mt-6">
        <router-link to="/" class="hover:text-slate-300 transition-colors flex items-center justify-center gap-1">
          <ArrowLeft class="w-3 h-3" /> Kembali ke Beranda
        </router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
