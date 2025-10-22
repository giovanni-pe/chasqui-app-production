<template>
    <Layout header-title="Historial de viajes" :show-back="false" :mobile-nav="PassengerMobileNavWrapper"
        class="pb-20 lg:pb-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
        <!-- Fondo decorativo flotante -->
        <div class="relative flex flex-col h-full overflow-hidden px-4 py-4">
            <div
                class="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-200/30 to-blue-300/30 blur-3xl animate-float pointer-events-none" />
            <div
                class="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-violet-200/20 to-purple-300/20 blur-4xl animate-float pointer-events-none" />

            <!-- Mensajes flotantes patrióticos -->
            <transition-group name="fade" tag="div" class="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
                <div v-for="(msg, index) in messages" :key="msg + index"
                    class="bg-white/80 backdrop-blur-lg text-sm font-semibold text-red-600 px-4 py-1 rounded-full shadow-lg mb-2 animate-fade-in-up">
                    🇵🇪 {{ msg }}
                </div>
            </transition-group>

            <!-- Mensaje de orgullo y compartir -->
            <div
                class="flex items-center justify-between bg-gradient-to-r from-yellow-50 via-white to-green-50 border border-yellow-200/50 rounded-2xl px-5 py-3 mb-4 shadow-lg animate-fade-in">
                <div class="flex items-center gap-3">
                    <p class="text-sm font-semibold text-yellow-800">
                        🇵🇪 ¡Gracias por confiar en una app hecha con espíritu chasqui!
                    </p>
                    <div
                        class="flex items-center gap-1 bg-green-100 border border-green-300 text-green-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        <Icon icon="mdi:hiking" class="w-4 h-4" />
                        {{ completedTrips }} viajes completados
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button @click="shareOnFacebook" title="Compartir en Facebook"
                        class="text-blue-700 hover:text-blue-900">
                        <Icon icon="mdi:facebook" class="w-5 h-5" />
                    </button>
                    <button @click="shareOnWhatsApp" title="Compartir en WhatsApp"
                        class="text-green-700 hover:text-green-900">
                        <Icon icon="mdi:whatsapp" class="w-5 h-5" />
                    </button>
                </div>
            </div>



            <!-- Filtros -->
            <div class="z-10 mb-4">
                <FilterNavbar />
            </div>

            <!-- Lista de viajes -->
            <div class="flex-1 overflow-y-auto z-10">
                <TripHistoryList />
            </div>
        </div>
    </Layout>
</template>

<script setup lang="ts">
import Layout from '@/ui/Layout.vue'
import FilterNavbar from '../components/FilterNavbar.vue'
import TripHistoryList from '../components/TripHistoryList.vue'
import PassengerMobileNav from '../../dashoboard/components/PassengerMobileNav.vue'
import Badge from '@/ui/Badge.vue'
import { Icon } from '@iconify/vue'
import { shallowRef, computed, ref, onMounted } from 'vue'
import { useTripHistoryStore } from '../store/useTripHistoryStore'

const PassengerMobileNavWrapper = shallowRef(PassengerMobileNav)
const store = useTripHistoryStore()

const completedTrips = computed(() => {
    return store.trips.filter(t => t.status === 'completed').length
})

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent('🚖 Descubre mi historial de viajes con Chasqui, una app peruana de movilidad 🇵🇪')
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank')
}

function shareOnWhatsApp() {
    const text = encodeURIComponent('🚖 Estoy usando Chasqui, una app peruana de movilidad. Mira mi historial de viajes 🇵🇪: ' + window.location.href)
    window.open(`https://wa.me/?text=${text}`, '_blank')
}

// Mensajes flotantes rotativos
const messages = ref<string[]>([])
const patrioticMessages = [
    'Perú ya no observa, ahora lidera 🚀',
    'Desde los Andes, compitiendo con Silicon Valley 🌎',
    'Tecnología que nació en casa y ya conquista el mundo 🇵🇪',
    'No seguimos tendencias, las creamos en Perú 🔥',
    'De Tingo María al mapa global 🌍',
    'Chasqui: Gratis para peruanos, hecho con amor nacional ❤️',
    'Ya no somos promesa, somos realidad 🌟',
    'Perú no imita, innova. Tú eres parte del cambio 🙌',
    'Nuestra app, nuestra voz, nuestra revolución 🇵🇪',
    '¡Chasqui compite con gigantes internacionales! Y tú, ¿ya viajaste? 🏁',
    'Orgullo peruano al volante de la tecnología ✨',
    'Movilidad con raíces peruanas, visión global 🌐'
];


onMounted(() => {
    let index = 0
    setInterval(() => {
        messages.value = [patrioticMessages[index % patrioticMessages.length]]
        index++
    }, 20000)
})
</script>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.6s ease-out;
}

.animate-fade-in-up {
    animation: fade-in-up 0.7s ease-in-out;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>