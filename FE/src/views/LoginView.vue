<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { login, register } from "../services/authService";
import { Cpu, Eye, EyeOff, LogIn, AlertCircle, ArrowLeft, UserPlus } from 'lucide-vue-next';

const router = useRouter();
const authMode = ref("login");

const loginForm = reactive({
  email: "",
  password: "",
});

const registerForm = reactive({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const fieldErrors = reactive({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const showPassword = ref(false);
const isSubmitting = ref(false);
const requestError = ref("");
const requestSuccess = ref("");

function setMode(mode, options = {}) {
  const { keepSuccess = false } = options;
  authMode.value = mode;
  requestError.value = "";
  if (!keepSuccess) {
    requestSuccess.value = "";
  }
  clearErrors();
}

function clearErrors() {
  fieldErrors.fullName = "";
  fieldErrors.email = "";
  fieldErrors.password = "";
  fieldErrors.confirmPassword = "";
}

function validateLoginForm() {
  clearErrors();
  let isValid = true;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!loginForm.email || !emailPattern.test(loginForm.email)) {
    fieldErrors.email = "Masukkan email yang valid.";
    isValid = false;
  }
  if (!loginForm.password || loginForm.password.length < 6) {
    fieldErrors.password = "Password minimal 6 karakter.";
    isValid = false;
  }
  return isValid;
}

function validateRegisterForm() {
  clearErrors();
  let isValid = true;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!registerForm.fullName || registerForm.fullName.trim().length < 3) {
    fieldErrors.fullName = "Nama lengkap minimal 3 karakter.";
    isValid = false;
  }
  if (!registerForm.email || !emailPattern.test(registerForm.email)) {
    fieldErrors.email = "Masukkan email yang valid.";
    isValid = false;
  }
  if (!registerForm.password || registerForm.password.length < 6) {
    fieldErrors.password = "Password minimal 6 karakter.";
    isValid = false;
  }
  if (registerForm.confirmPassword !== registerForm.password) {
    fieldErrors.confirmPassword = "Konfirmasi password tidak sama.";
    isValid = false;
  }
  return isValid;
}


async function handleSubmit() {
  requestError.value = "";
  requestSuccess.value = "";
  try {
    if (authMode.value === "login" && !validateLoginForm()) return;
    if (authMode.value === "register" && !validateRegisterForm()) return;

    isSubmitting.value = true;
    const result =
      authMode.value === "login"
        ? await login({
            email: loginForm.email.trim(),
            password: loginForm.password,
          })
        : await register({
            fullName: registerForm.fullName.trim(),
            email: registerForm.email.trim(),
            password: registerForm.password,
          });

    requestSuccess.value =
      result?.message ||
      (authMode.value === "login"
        ? "Login berhasil."
        : "Registrasi berhasil, silakan login.");

    if (authMode.value === "login") {
      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.user?.role || "member");
      localStorage.setItem("userFullName", result.user?.fullName || "");
      localStorage.setItem("userEmail", result.user?.email || "");
      if (result.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else if (authMode.value === "register") {
      registerForm.fullName = "";
      registerForm.email = "";
      registerForm.password = "";
      registerForm.confirmPassword = "";
      setMode("login", { keepSuccess: true });
    }
  } catch (error) {
    requestError.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md animate-fade-in-up">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2.5">
          <div class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Cpu class="w-7 h-7 text-white" />
          </div>
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
