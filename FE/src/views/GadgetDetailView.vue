<template>
  <div class="min-h-screen bg-slate-50 relative overflow-hidden">
    <!-- Decorative Background -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/50 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>
    <div class="absolute top-40 left-0 w-[400px] h-[400px] bg-purple-200/50 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>

    <!-- Navbar -->
    <header class="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="h-16 flex items-center justify-between">
          <router-link to="/" class="flex items-center gap-2.5">
            <img :src="logo" alt="Mending Mana Logo" class="w-9 h-9 object-cover rounded-xl shadow-lg shadow-blue-600/20" />
            <span class="text-slate-900 tracking-tight font-extrabold text-lg hidden sm:block">Mending Mana</span>
          </router-link>
          <div class="flex items-center gap-3">
            <router-link to="/" class="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Beranda</router-link>
            <router-link to="/compare" class="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Komparasi</router-link>
            <router-link to="/about" class="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">About</router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 animate-fade-in">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p class="text-slate-500 font-medium">Memuat data gadget...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-lg mx-auto mt-16 bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 text-center shadow-lg animate-fade-in">
      <p class="font-bold mb-4 text-lg">{{ error }}</p>
      <button @click="fetchGadget" class="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg">
        Coba Lagi
      </button>
    </div>

    <!-- Gadget Detail -->
    <main v-else-if="gadget" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-slate-500 mb-6 bg-white/40 backdrop-blur-md px-4 py-2 rounded-2xl w-max border border-white/60 shadow-xs animate-slide-in-left">
        <router-link to="/" class="hover:text-blue-600 transition-colors flex items-center gap-1">
          <ArrowLeft class="w-4 h-4" /> Beranda
        </router-link>
        <ChevronRight class="w-4 h-4" />
        <router-link :to="'/?category=' + gadget.category" class="hover:text-blue-600 transition-colors">{{ gadget.category }}</router-link>
        <ChevronRight class="w-4 h-4" />
        <span class="text-slate-800 font-semibold">{{ gadget.name }}</span>
      </nav>

      <div class="grid lg:grid-cols-2 gap-8 mb-10">
        <!-- Image Carousel -->
        <div class="animate-fade-in-up">
          <div class="relative rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl aspect-square group">
            <img
              :key="activeImageIndex"
              :src="activeImage"
              :alt="gadget.name"
              class="w-full h-full object-cover transition-all duration-500"
            />
            <template v-if="gadget.images && gadget.images.length > 1">
              <button
                @click="prevImage"
                class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeftIcon class="w-6 h-6 text-slate-700" />
              </button>
              <button
                @click="nextImage"
                class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight class="w-6 h-6 text-slate-700" />
              </button>
            </template>
            <span v-if="gadget.isNew" class="absolute top-6 left-6 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
              Terbaru
            </span>
          </div>
          
          <!-- Thumbnails -->
          <div v-if="gadget.images && gadget.images.length > 1" class="flex gap-3 mt-4">
            <button
              v-for="(img, i) in gadget.images"
              :key="i"
              @click="activeImageIndex = i"
              :class="[
                'relative w-20 h-20 rounded-2xl overflow-hidden transition-all',
                activeImageIndex === i 
                  ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' 
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              ]"
            >
              <img :src="img" alt="" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Gadget Info -->
        <div class="flex flex-col animate-slide-in-right delay-200" style="opacity:0; animation-fill-mode: forwards;">
          <div class="flex items-start justify-between mb-4">
            <div>
              <span class="inline-block px-3 py-1 bg-white/60 backdrop-blur border border-white/60 text-blue-700 text-xs rounded-full font-bold mb-3 shadow-xs">
                {{ gadget.category || 'Uncategorized' }}
              </span>
              <h1 class="text-slate-900 font-extrabold text-3xl sm:text-4xl leading-tight tracking-tight mb-2">
                {{ gadget.name }}
              </h1>
              <p class="text-slate-500 text-base">oleh <span class="font-bold text-slate-700">{{ gadget.brand || 'No Brand' }}</span></p>
            </div>
            <div class="flex gap-2">
              <button class="w-12 h-12 rounded-2xl border bg-white/80 backdrop-blur-md border-white/60 text-slate-400 hover:text-pink-500 flex items-center justify-center transition-all shadow-xs hover:scale-105">
                <Heart class="w-6 h-6" />
              </button>
              <button class="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-all shadow-xs hover:scale-105">
                <Share2 class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- Rating -->
          <div class="flex items-center gap-3 my-2">
            <div class="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
              <Star class="w-5 h-5 text-amber-500 fill-current" />
              <span class="font-extrabold text-slate-800">{{ gadget.averageRating ? gadget.averageRating.toFixed(1) : '0.0' }}</span>
              <span class="text-slate-500 text-sm font-medium">({{ gadget.totalReviews || 0 }} ulasan)</span>
            </div>
          </div>

          <!-- Price -->
          <div class="bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-6 my-6 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl"></div>
            <p class="text-sm text-slate-500 mb-1 font-medium relative z-10">Harga Estimasi</p>
            <p class="text-blue-600 font-extrabold text-3xl md:text-4xl relative z-10 tracking-tight">
              {{ formatPrice(gadget.price) }}
            </p>
            <p class="text-xs text-slate-400 mt-2 relative z-10 font-medium">* Harga dapat berbeda di setiap retailer</p>
          </div>

          <!-- Description -->
          <p class="text-slate-600 text-base leading-relaxed mb-8 flex-1">{{ gadget.description || gadget.summary || 'Tidak ada deskripsi tersedia.' }}</p>

          <!-- CTA Buttons -->
          <div class="flex gap-4 mt-auto">
            <button
              @click="$router.push('/compare?ids=' + gadget.id)"
              class="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all shadow-md bg-white/80 backdrop-blur-md border border-white text-slate-700 hover:bg-white hover:scale-[1.02]"
            >
              <GitCompare class="w-5 h-5" />
              Bandingkan
            </button>
            <button
              @click="$router.push('/login')"
              class="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-bold transition-all shadow-lg hover:scale-[1.02] hover:shadow-blue-500/30"
            >
              <StarIcon class="w-5 h-5" />
              Tulis Ulasan
            </button>
          </div>

          <!-- Release Date -->
          <p v-if="gadget.releaseDate" class="text-xs text-slate-400 mt-6 font-medium">
            Rilis: {{ new Date(gadget.releaseDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
        </div>
      </div>

      <!-- Specs & Rating -->
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Specs -->
        <div class="lg:col-span-1 space-y-6 animate-fade-in-up delay-300" style="opacity:0; animation-fill-mode: forwards;">
          <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl p-6">
            <h2 class="text-slate-900 font-extrabold text-xl mb-6 flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle class="w-4 h-4 text-blue-600" />
              </div>
              Spesifikasi
            </h2>
            <div v-if="gadget.specs && gadget.specs.length > 0" class="space-y-3">
              <div v-for="(spec, i) in gadget.specs" :key="i" :class="['flex flex-col py-2', i < gadget.specs.length - 1 ? 'border-b border-slate-100' : '']">
                <span class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{{ spec.spec_key || spec.label }}</span>
                <span class="text-slate-800 text-sm font-bold">{{ spec.spec_value || spec.value }}</span>
              </div>
            </div>
            <div v-else class="text-slate-500 italic text-sm">Belum ada data spesifikasi.</div>
          </div>

          <!-- Rating Distribution -->
          <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl p-6">
            <h2 class="text-slate-900 font-extrabold text-xl mb-6">Rating</h2>
            <div class="flex flex-col items-center mb-6">
              <span class="text-slate-900 font-black text-6xl tracking-tighter mb-2">
                {{ gadget.averageRating ? gadget.averageRating.toFixed(1) : '0.0' }}
              </span>
              <div class="flex items-center gap-1">
                <Star v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= Math.round(gadget.averageRating || 0) ? 'text-amber-400 fill-current' : 'text-slate-200'" />
              </div>
              <p class="text-sm text-slate-500 mt-2 font-medium">{{ gadget.totalReviews || 0 }} ulasan</p>
            </div>
            <div class="space-y-2.5">
              <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-3">
                <span class="text-sm text-slate-600 font-bold w-3">{{ star }}</span>
                <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
                <div class="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div
                    :class="[
                      'h-full rounded-full transition-all duration-1000',
                      star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-amber-400' : 'bg-red-500'
                    ]"
                    :style="{ width: `${getRatingPercent(star)}%` }"
                  ></div>
                </div>
                <span class="text-xs text-slate-500 font-bold w-8 text-right">{{ getRatingCount(star) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Description Full -->
        <div class="lg:col-span-2 animate-fade-in-up delay-400" style="opacity:0; animation-fill-mode: forwards;">
          <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl p-8">
            <h2 class="text-slate-900 font-extrabold text-xl mb-6 flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <MessageSquare class="w-4 h-4 text-purple-600" />
              </div>
              Deskripsi Produk
            </h2>
            <div class="prose prose-slate max-w-none">
              <p class="whitespace-pre-wrap text-slate-600 leading-relaxed">{{ gadget.description || 'Tidak ada deskripsi tersedia.' }}</p>
            </div>
          </div>

          <!-- CTA to write review -->
          <div class="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[2rem] p-8 text-center shadow-lg relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
            <h3 class="text-slate-900 text-xl font-extrabold mb-3">
              Punya pengalaman dengan {{ gadget.name }}?
            </h3>
            <p class="text-slate-600 mb-6 font-medium">Bagikan ulasan Anda untuk membantu orang lain memilih gadget yang tepat.</p>
            <button
              @click="$router.push('/login')"
              class="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-105"
            >
              Login untuk Menulis Ulasan
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-100 mt-16 pt-12 pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
        &copy; {{ new Date().getFullYear() }} Mending Mana. Platform Review & Rating Gadget.
      </div>
    </footer>
  </div>
</template>

<script setup>
import {
  ArrowLeft, ChevronRight, ChevronLeft as ChevronLeftIcon, Heart, Share2,
  Star, Star as StarIcon, GitCompare, CheckCircle, MessageSquare
} from 'lucide-vue-next';
import { useGadgetDetailView } from '../composables/useGadgetDetailView';

const {
  logo,
  loading,
  error,
  gadget,
  activeImageIndex,
  activeImage,
  prevImage,
  nextImage,
  getRatingCount,
  getRatingPercent,
  fetchGadget,
  formatPrice
} = useGadgetDetailView();
</script>
