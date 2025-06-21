<template>
  <div class="py-12">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Welcome to MusicNFT Marketplace</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Tokenize your music as NFTs. Direct sales without intermediaries.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold mb-2">For Musicians</h3>
          <p class="text-gray-600">
            Create NFTs from your music and sell directly to fans.
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold mb-2">For Buyers</h3>
          <p class="text-gray-600">
            Buy unique music NFTs and support artists directly.
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold mb-2">Blockchain</h3>
          <p class="text-gray-600">
            Security guaranteed by Ethereum blockchain.
          </p>
        </div>
      </div>

      <div class="text-center mt-8">
        <router-link to="/marketplace"
          class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md text-lg font-semibold">
          Explore Marketplace
        </router-link>
      </div>
    </div>
  </div>
</template>