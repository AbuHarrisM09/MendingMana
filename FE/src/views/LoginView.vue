<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { login, register } from "../services/authService";

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
    if (authMode.value === "login" && !validateLoginForm()) {
      return;
    }

    if (authMode.value === "register" && !validateRegisterForm()) {
      return;
    }

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
      // Pindah ke login tapi tetap tampilkan pesan sukses
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
  <main
    class="relative min-h-screen overflow-hidden bg-stone-50 font-sans text-stone-900 antialiased"
  >
    <div class="pointer-events-none absolute inset-0">
      <div
        class="absolute -left-16 top-10 h-52 w-52 rounded-full bg-orange-200/60 blur-3xl"
      ></div>
      <div
        class="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl"
      ></div>
      <div
        class="absolute left-1/3 top-1/3 h-56 w-56 rounded-full bg-emerald-200/50 blur-3xl"
      ></div>
    </div>

    <section
      class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-12 lg:flex-row lg:items-center lg:gap-16"
    >
      <div
        class="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-xl sm:p-8"
      >
        <div class="grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1">
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-semibold transition"
            :class="
              authMode === 'login'
                ? 'bg-orange-500 text-white'
                : 'text-stone-600 hover:bg-white'
            "
            @click="setMode('login')"
          >
            Login
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-semibold transition"
            :class="
              authMode === 'register'
                ? 'bg-orange-500 text-white'
                : 'text-stone-600 hover:bg-white'
            "
            @click="setMode('register')"
          >
            Register
          </button>
        </div>

        <Transition name="fade" mode="out-in">
          <div :key="authMode">
            <h2 class="mt-5 text-2xl font-semibold text-stone-900">
          {{ authMode === "login" ? "Login Akun" : "Buat Akun Baru" }}
        </h2>
        <p class="mt-1 text-sm text-stone-500">
          {{
            authMode === "login"
              ? "Gunakan email dan password yang sudah terdaftar."
              : "Isi data berikut untuk membuat akun member baru."
          }}
        </p>

        <form class="mt-7 space-y-5" @submit.prevent="handleSubmit">
          <div v-if="authMode === 'register'">
            <label
              for="fullName"
              class="mb-2 block text-sm font-medium text-stone-700"
              >Nama Lengkap</label
            >
            <input
              id="fullName"
              v-model="registerForm.fullName"
              type="text"
              autocomplete="name"
              placeholder="Nama lengkap"
              class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
            <p v-if="fieldErrors.fullName" class="mt-2 text-xs text-rose-300">
              {{ fieldErrors.fullName }}
            </p>
          </div>

          <div>
            <label
              for="email"
              class="mb-2 block text-sm font-medium text-stone-700"
              >Email</label
            >
            <input
              v-if="authMode === 'login'"
              id="email"
              v-model="loginForm.email"
              type="email"
              autocomplete="email"
              placeholder="nama@email.com"
              class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
            <input
              v-else
              id="email"
              v-model="registerForm.email"
              type="email"
              autocomplete="email"
              placeholder="nama@email.com"
              class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
            <p v-if="fieldErrors.email" class="mt-2 text-xs text-rose-600">
              {{ fieldErrors.email }}
            </p>
          </div>

          <div>
            <label
              for="password"
              class="mb-2 block text-sm font-medium text-stone-700"
              >Password</label
            >
            <div class="relative">
              <input
                v-if="authMode === 'login'"
                id="password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Masukkan password"
                class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 pr-20 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              />
              <input
                v-else
                id="password"
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Masukkan password"
                class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 pr-20 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-stone-600 hover:bg-stone-100"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? "Hide" : "Show" }}
              </button>
            </div>
            <p v-if="fieldErrors.password" class="mt-2 text-xs text-rose-600">
              {{ fieldErrors.password }}
            </p>
          </div>

          <div v-if="authMode === 'register'">
            <label
              for="confirmPassword"
              class="mb-2 block text-sm font-medium text-stone-700"
              >Konfirmasi Password</label
            >
            <input
              id="confirmPassword"
              v-model="registerForm.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Ulangi password"
              class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
            <p
              v-if="fieldErrors.confirmPassword"
              class="mt-2 text-xs text-rose-600"
            >
              {{ fieldErrors.confirmPassword }}
            </p>
          </div>

          <div
            v-if="authMode === 'login'"
            class="flex items-center justify-between text-sm"
          >
            <label class="inline-flex items-center gap-2 text-stone-600">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-stone-300 bg-white text-orange-500"
              />
              Ingat saya
            </label>
            <a
              href="#"
              class="font-medium text-orange-600 hover:text-orange-500"
              >Lupa password?</a
            >
          </div>

          <p
            v-if="requestError"
            class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {{ requestError }}
          </p>
          <p
            v-if="requestSuccess"
            class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            {{ requestSuccess }}
          </p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {{
              isSubmitting
                ? "Memproses..."
                : authMode === "login"
                  ? "Masuk Sekarang"
                  : "Daftar Sekarang"
            }}
          </button>
        </form>

        <p
          v-if="authMode === 'login'"
          class="mt-6 text-center text-sm text-stone-500"
        >
          Belum punya akun?
          <button
            type="button"
            class="font-semibold text-orange-600 hover:text-orange-500"
            @click="setMode('register')"
          >
            Daftar di sini
          </button>
        </p>
        <p v-else class="mt-6 text-center text-sm text-stone-500">
          Sudah punya akun?
          <button
            type="button"
            class="font-semibold text-orange-600 hover:text-orange-500"
            @click="setMode('login')"
          >
            Masuk di sini
          </button>
        </p>
          </div>
        </Transition>
      </div>
    </section>
  </main>
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
