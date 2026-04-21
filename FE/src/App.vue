<script setup>
import { reactive, ref } from 'vue';
import { login } from './services/authService';

const form = reactive({
  email: '',
  password: '',
});

const fieldErrors = reactive({
  email: '',
  password: '',
});

const showPassword = ref(false);
const isSubmitting = ref(false);
const requestError = ref('');
const requestSuccess = ref('');

function validateForm() {
  fieldErrors.email = '';
  fieldErrors.password = '';

  let isValid = true;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email || !emailPattern.test(form.email)) {
    fieldErrors.email = 'Masukkan email yang valid.';
    isValid = false;
  }

  if (!form.password || form.password.length < 6) {
    fieldErrors.password = 'Password minimal 6 karakter.';
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  requestError.value = '';
  requestSuccess.value = '';

  if (!validateForm()) {
    return;
  }

  try {
    isSubmitting.value = true;
    const result = await login({
      email: form.email.trim(),
      password: form.password,
    });

    requestSuccess.value = result?.message || 'Login berhasil.';
  } catch (error) {
    requestError.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden bg-stone-950 text-stone-100">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-16 top-10 h-52 w-52 rounded-full bg-orange-500/20 blur-3xl"></div>
      <div class="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl"></div>
      <div class="absolute left-1/3 top-1/3 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl"></div>
    </div>

    <section class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-12 lg:flex-row lg:items-center lg:gap-16">
      <div class="max-w-xl">
        <p class="inline-flex rounded-full border border-orange-300/25 bg-orange-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
          MendingMana
        </p>
        <h1 class="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
          Masuk dan lanjutkan eksplorasi gadget terbaik.
        </h1>
        <p class="mt-5 text-base leading-relaxed text-stone-300">
          Login untuk memberi rating, menulis ulasan, menyimpan gadget favorit,
          dan menggunakan fitur komparasi produk secara lengkap.
        </p>
      </div>

      <div class="w-full max-w-md rounded-3xl border border-stone-700/70 bg-stone-900/80 p-7 shadow-2xl backdrop-blur-sm sm:p-8">
        <h2 class="text-2xl font-semibold text-white">Login Akun</h2>
        <p class="mt-1 text-sm text-stone-400">Gunakan email dan password yang sudah terdaftar.</p>

        <form class="mt-7 space-y-5" @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="mb-2 block text-sm font-medium text-stone-200">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="nama@email.com"
              class="w-full rounded-xl border border-stone-700 bg-stone-950/70 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/30"
            />
            <p v-if="fieldErrors.email" class="mt-2 text-xs text-rose-300">{{ fieldErrors.email }}</p>
          </div>

          <div>
            <label for="password" class="mb-2 block text-sm font-medium text-stone-200">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Masukkan password"
                class="w-full rounded-xl border border-stone-700 bg-stone-950/70 px-4 py-3 pr-20 text-sm text-stone-100 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/30"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-stone-300 hover:bg-stone-800"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <p v-if="fieldErrors.password" class="mt-2 text-xs text-rose-300">{{ fieldErrors.password }}</p>
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="inline-flex items-center gap-2 text-stone-300">
              <input type="checkbox" class="h-4 w-4 rounded border-stone-700 bg-stone-900 text-orange-400" />
              Ingat saya
            </label>
            <a href="#" class="font-medium text-orange-300 hover:text-orange-200">Lupa password?</a>
          </div>

          <p v-if="requestError" class="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {{ requestError }}
          </p>
          <p v-if="requestSuccess" class="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {{ requestSuccess }}
          </p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full rounded-xl bg-orange-300 px-4 py-3 text-sm font-bold text-stone-950 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {{ isSubmitting ? 'Memproses...' : 'Masuk Sekarang' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-stone-400">
          Belum punya akun?
          <a href="#" class="font-semibold text-orange-300 hover:text-orange-200">Daftar di sini</a>
        </p>
      </div>
    </section>
  </main>
</template>