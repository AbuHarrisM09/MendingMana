<template>
  <div class="min-h-screen bg-slate-50 p-6 md:p-10">
    <header class="mb-8 flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Dashboard Member</h1>
        <p class="text-sm text-slate-500">Selamat datang kembali di MendingMana.</p>
      </div>
      <button
        @click="logout"
        class="mt-4 md:mt-0 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold transition"
      >
        Logout
      </button>
    </header>

    <div class="bg-white rounded-2xl border border-slate-200 p-5">
      <p class="text-slate-800 font-semibold">Akun</p>
      <p class="text-slate-500 text-sm mt-1">
        {{ userFullName || 'Member' }} — {{ userEmail || '-' }}
      </p>

      <div class="mt-5 text-slate-600 text-sm">
        Halaman ini placeholder UI member (mengikuti pola patokan). Setelah ini kita bisa lanjut implement:
        katalog gadget, ulasan, dan komparasi.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userFullName = computed(() => localStorage.getItem('userFullName') || '')
const userEmail = computed(() => localStorage.getItem('userEmail') || '')

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('userFullName')
  localStorage.removeItem('userEmail')
  router.push('/login')
}
</script>
