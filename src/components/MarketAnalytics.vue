<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { ethers } from 'ethers'

const marketplaceStore = useMarketplaceStore()
const { listedItems } = storeToRefs(marketplaceStore)


const analytics = ref({
  totalNFTs: 0,
  totalValue: '0',
  averagePrice: '0',
  priceRanges: {},
  topArtists: [],
  dailyActivity: []
})

const loading = ref(false)
const timeRange = ref('7d') 


function calculateAnalytics() {
  loading.value = true
  
  try {
    const items = listedItems.value
    analytics.value.totalNFTs = items.length
    
    if (items.length === 0) {
      loading.value = false
      return
    }
    

    let totalValue = ethers.BigNumber.from('0')
    const prices = []
    
    items.forEach(item => {
      if (item.price && ethers.BigNumber.from(item.price).gt(0)) {
        totalValue = totalValue.add(ethers.BigNumber.from(item.price))
        prices.push(parseFloat(ethers.utils.formatEther(item.price)))
      }
    })
    
    analytics.value.totalValue = ethers.utils.formatEther(totalValue)
    

    if (prices.length > 0) {
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      analytics.value.averagePrice = avgPrice.toFixed(4)
    }
    

    const priceRanges = {
      'under_1': 0,
      '1_to_5': 0,
      '5_to_10': 0,
      'over_10': 0
    }
    
    prices.forEach(price => {
      if (price < 1) priceRanges.under_1++
      else if (price < 5) priceRanges['1_to_5']++
      else if (price < 10) priceRanges['5_to_10']++
      else priceRanges.over_10++
    })
    
    analytics.value.priceRanges = priceRanges
    

    const artistCounts = {}
    items.forEach(item => {
      const artist = item.metadata?.artist || 'Unknown'
      artistCounts[artist] = (artistCounts[artist] || 0) + 1
    })
    
    analytics.value.topArtists = Object.entries(artistCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([artist, count]) => ({ artist, count }))
    

    analytics.value.dailyActivity = generateMockDailyActivity()
    
  } catch (error) {
    console.error('Greška pri izračunu analitike:', error)
  } finally {
    loading.value = false
  }
}


function generateMockDailyActivity() {
  const days = timeRange.value === '30d' ? 30 : timeRange.value === '7d' ? 7 : 1
  const activity = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    activity.push({
      date: date.toLocaleDateString(),
      sales: Math.floor(Math.random() * 10),
      volume: (Math.random() * 5).toFixed(2)
    })
  }
  
  return activity
}


const chartData = computed(() => {
  return analytics.value.dailyActivity.map(day => ({
    name: day.date,
    sales: day.sales,
    volume: parseFloat(day.volume)
  }))
})

onMounted(() => {
  calculateAnalytics()
})


watch(timeRange, () => {
  calculateAnalytics()
})

watch(listedItems, () => {
  calculateAnalytics()
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Analitika tržišta</h2>
      <select v-model="timeRange" class="px-3 py-1 border border-gray-300 rounded-md">
        <option value="1d">Danas</option>
        <option value="7d">Prošlih 7 dana</option>
        <option value="30d">Prošlih 30 dana</option>
      </select>
    </div>
    
    <div v-if="loading" class="flex justify-center items-center h-48">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
    
    <div v-else>
      <!-- Ključni pokazatelji -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-blue-600">Ukupno NFT-ova</h3>
          <p class="text-2xl font-bold text-blue-800">{{ analytics.totalNFTs }}</p>
        </div>
        
        <div class="bg-green-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-green-600">Ukupna vrijednost</h3>
          <p class="text-2xl font-bold text-green-800">{{ parseFloat(analytics.totalValue).toFixed(2) }} ETH</p>
        </div>
        
        <div class="bg-purple-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-purple-600">Prosječna cijena</h3>
          <p class="text-2xl font-bold text-purple-800">{{ analytics.averagePrice }} ETH</p>
        </div>
        
        <div class="bg-orange-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-orange-600">Top umjetnik</h3>
          <p class="text-lg font-bold text-orange-800">
            {{ analytics.topArtists[0]?.artist || 'N/A' }}
          </p>
          <p class="text-sm text-orange-600">
            {{ analytics.topArtists[0]?.count || 0 }} NFT{{ analytics.topArtists[0]?.count !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
      
      <!-- Cjenovni rasponi -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Distribucija cijena</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold text-blue-600">{{ analytics.priceRanges.under_1 || 0 }}</p>
            <p class="text-sm text-gray-600">&lt; 1 ETH</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold text-green-600">{{ analytics.priceRanges['1_to_5'] || 0 }}</p>
            <p class="text-sm text-gray-600">1-5 ETH</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold text-yellow-600">{{ analytics.priceRanges['5_to_10'] || 0 }}</p>
            <p class="text-sm text-gray-600">5-10 ETH</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold text-purple-600">{{ analytics.priceRanges.over_10 || 0 }}</p>
            <p class="text-sm text-gray-600">&gt; 10 ETH</p>
          </div>
        </div>
      </div>
      
      <!-- Top umjetnici -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Top umjetnici</h3>
        <div class="space-y-3">
          <div v-for="(artist, index) in analytics.topArtists" :key="artist.artist" 
               class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold">
                {{ index + 1 }}
              </span>
              <span class="font-medium">{{ artist.artist }}</span>
            </div>
            <span class="text-gray-600">{{ artist.count }} NFT{{ artist.count !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Dnevna aktivnost -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Dnevna aktivnost</h3>
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="text-center">
              <p class="text-sm text-gray-600">Ukupne prodaje</p>
              <p class="text-xl font-bold">
                {{ analytics.dailyActivity.reduce((sum, day) => sum + day.sales, 0) }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-600">Ukupni volumen</p>
              <p class="text-xl font-bold">
                {{ analytics.dailyActivity.reduce((sum, day) => sum + parseFloat(day.volume), 0).toFixed(2) }} ETH
              </p>
            </div>
          </div>
          
          <!-- Jednostavan bar chart za aktivnost -->
          <div class="mt-6">
            <div class="flex justify-between items-end h-32 space-x-2">
              <div v-for="day in analytics.dailyActivity" :key="day.date" 
                   class="flex-1 flex flex-col items-center">
                <div class="bg-blue-600 rounded-t-sm transition-all hover:bg-blue-700"
                     :style="{ height: `${(day.sales / Math.max(...analytics.dailyActivity.map(d => d.sales)) * 100)}%` }">
                </div>
                <span class="text-xs text-gray-600 mt-1 transform rotate-45">{{ day.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>