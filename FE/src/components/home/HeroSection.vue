<template>
  <section v-if="heroGadget" class="relative overflow-hidden pt-12 pb-24">
    <div class="absolute inset-0 z-0">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div class="absolute top-40 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div class="animate-slide-in-left">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 mb-6 border border-orange-100">
            <Flame class="w-4 h-4 text-orange-500 animate-pulse" />
            <span class="text-xs font-bold uppercase tracking-wider">Paling Dicari</span>
          </div>
          
          <h1 class="text-slate-900 font-extrabold tracking-tight mb-4" style="font-size: clamp(2.5rem, 5vw, 4rem); line-height: 1.1;">
            Temukan <br/>
            <span class="text-amber-600">Gadget Impian</span> Anda.
          </h1>
          
          <p class="text-slate-500 text-lg mb-8 max-w-lg leading-relaxed">
            Bandingkan, temukan ulasan jujur, dan dapatkan harga terbaik untuk <strong class="text-slate-700">{{ heroGadget.name }}</strong> dan ribuan gadget lainnya.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4">
            <router-link
              :to="'/gadget/' + heroGadget.id"
              class="px-8 py-4 bg-slate-900 text-white rounded-2xl text-base font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20"
            >
              Lihat {{ heroGadget.name.split(' ')[0] }} <ChevronRight class="w-5 h-5" />
            </router-link>
            <router-link
              to="/compare"
              class="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl text-base font-bold hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm"
            >
              Mulai Komparasi
            </router-link>
          </div>
        </div>

        <div class="relative lg:h-[600px] flex items-center justify-center animate-scale-in delay-200" style="opacity:0; animation-fill-mode: forwards;">
          <div class="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
          <img
            :src="heroGadget.images && heroGadget.images[0] ? heroGadget.images[0] : 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?w=300&h=300&fit=crop'"
            :alt="heroGadget.name"
            class="relative z-10 w-[80%] h-[80%] object-contain drop-shadow-2xl hover:scale-105 hover:-rotate-2 transition-transform duration-500"
          />
          
          <!-- Floating detail cards -->
          <div class="absolute z-20 bottom-10 left-2 sm:-left-10 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-xl animate-fade-in-up delay-600" style="opacity:0; animation-fill-mode: forwards;">
            <div class="text-xs text-slate-500 font-medium mb-1">Harga Mulai</div>
            <div class="text-lg font-extrabold text-slate-900">{{ formatPrice(heroGadget.price) }}</div>
          </div>
          
          <div class="absolute z-20 top-20 right-2 sm:-right-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-xl flex items-center gap-3 animate-fade-in-up delay-800" style="opacity:0; animation-fill-mode: forwards;">
            <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Star class="w-5 h-5 text-amber-500 fill-current" />
            </div>
            <div>
              <div class="text-lg font-extrabold text-slate-900 flex items-center gap-1">
                {{ heroGadget.averageRating ? heroGadget.averageRating.toFixed(1) : '0.0' }} 
              </div>
              <div class="text-xs text-slate-500">Dari {{ heroGadget.totalReviews || 0 }} ulasan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Flame, ChevronRight, Star } from 'lucide-vue-next'
import { formatPrice } from '../../data/mockData.js'

defineProps({
  heroGadget: {
    type: Object,
    required: true
  }
})
</script>
