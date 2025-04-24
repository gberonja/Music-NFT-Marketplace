<script setup>
// Importi komponenti ako su potrebni
</script>

<template>
    <div class="py-12">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold mb-4">Dobrodošli u MusicNFT Marketplace</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                    Kupujte, prodajte i kolekcionirajte jedinstvene glazbene NFT-ove.
                    Podržite svoje omiljene umjetnike direktno, bez posrednika.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold mb-2">Za glazbenike</h3>
                    <p class="text-gray-600">
                        Tokenizacija vaše glazbe kao NFT-ova, postavite svoju cijenu i primajte tantijeme pri svakoj
                        preprodaji.
                    </p>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold mb-2">Za obožavatelje</h3>
                    <p class="text-gray-600">
                        Otkrijte nove umjetnike, kupite njihove NFT-ove i podržite ih direktno. Izgradite svoju
                        kolekciju.
                    </p>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold mb-2">Blockchain tehnologija</h3>
                    <p class="text-gray-600">
                        Sigurnost i transparentnost osigurani Ethereum blockchainom i pametnim ugovorima.
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