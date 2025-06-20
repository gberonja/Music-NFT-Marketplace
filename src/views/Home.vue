<template>
  <div class="py-12">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Dobrodošli u MusicNFT Marketplace</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Tokenizacija glazbe kao NFT-ova. Direktna prodaja bez posrednika.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold mb-2">Za glazbenike</h3>
          <p class="text-gray-600">
            Kreirajte NFT od svoje glazbe i prodajte direktno obožavateljima.
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold mb-2">Za kupce</h3>
          <p class="text-gray-600">
            Kupite jedinstvene glazbene NFT-ove i podržite umjetnike.
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold mb-2">Blockchain</h3>
          <p class="text-gray-600">
            Sigurnost osigurana Ethereum blockchainom.
          </p>
        </div>
      </div>

      <div class="text-center mt-8">
        <router-link to="/marketplace"
          class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md text-lg font-semibold">
          Istraži Marketplace
        </router-link>
      </div>
    </div>
  </div>
</template>