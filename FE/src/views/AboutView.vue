<template>
  <div class="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col font-sans">
    <!-- Decorative Background Blurs -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>

    <!-- Header / Navbar -->
    <header class="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 shadow-sm transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="h-16 flex items-center justify-between">
          <router-link to="/" class="flex items-center gap-2.5">
            <img :src="logo" alt="Mending Mana Logo" class="w-9 h-9 object-cover rounded-xl shadow-lg shadow-blue-600/20" />
            <span class="text-slate-900 tracking-tight font-extrabold text-lg">Mending Mana</span>
          </router-link>

          <router-link
            to="/"
            class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft class="w-4 h-4" /> Kembali ke Beranda
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
      
      <!-- Hero / Section Title -->
      <div class="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
        <div class="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 mb-6 border border-slate-200">
          <span class="text-xs font-bold uppercase tracking-wider">Meet The Team</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Tim Pengembang <span class="text-slate-900">Mending Mana</span>
        </h1>
      </div>

      <!-- Members Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="(member, index) in teamMembers"
          :key="member.nim"
          class="bg-white rounded-3xl border border-slate-100 p-8 text-center hover:shadow-2xl hover:border-blue-100 transition-all duration-300 group hover:-translate-y-2 animate-fade-in-up"
          :style="{ animationDelay: `${(index + 1) * 0.1}s`, animationFillMode: 'forwards', opacity: 0 }"
        >
          <!-- Avatar Initial with Gradient -->
          <div class="relative w-24 h-24 mx-auto mb-6">
            <div :class="['w-full h-full rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg transform group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300', member.bgColor]">
              {{ getInitials(member.name) }}
            </div>
            <!-- Decorative badge -->
            <div class="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-800 text-white p-1.5 rounded-xl">
              <Code2 v-if="member.roleType === 'tech'" class="w-4 h-4" />
              <Layers v-else class="w-4 h-4" />
            </div>
          </div>

          <!-- Name & NIM -->
          <h3 class="text-slate-900 font-extrabold text-lg group-hover:text-blue-600 transition-colors mb-1">
            {{ member.name }}
          </h3>
          <p class="text-slate-400 text-xs font-bold tracking-wider uppercase mb-4">
            NIM: {{ member.nim }}
          </p>

          <!-- Role Pill -->
          <div class="inline-block px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600 text-xs font-semibold mb-6">
            {{ member.role }}
          </div>

          <hr class="border-slate-100 my-4" />

          <!-- Social / Contact Links -->
          <div class="flex items-center justify-center gap-3">
            <a href="#" class="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all">
              <Github class="w-4 h-4" />
            </a>
            <a href="#" class="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all">
              <Linkedin class="w-4 h-4" />
            </a>
            <a :href="'mailto:' + member.email" class="p-2 text-slate-400 hover:text-purple-600 bg-slate-50 hover:bg-purple-50 rounded-xl transition-all">
              <Mail class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-100 py-8 mt-16 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
        &copy; {{ new Date().getFullYear() }} Mending Mana Team. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { Cpu, ArrowLeft, Github, Mail, Linkedin, Code2, Layers } from 'lucide-vue-next';
import { useAboutView } from '../composables/useAboutView';

const { logo, teamMembers, getInitials } = useAboutView();
</script>

<style scoped>
/* Specific view styles if any */
</style>
