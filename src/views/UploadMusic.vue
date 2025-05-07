<script setup>
import { storeToRefs } from 'pinia'
import { useUploadStore } from '../store/uploadStore'
import { useWeb3Store } from '../store/web3Store'

const uploadStore = useUploadStore()
const web3Store = useWeb3Store()

const {
    isUploading,
    uploadProgress,
    error,
    successMessage,
    title,
    artist,
    description,
    royaltyPercentage,
    coverImageUrl,
    audioFileUrl
} = storeToRefs(uploadStore)

const { isConnected } = storeToRefs(web3Store)


function handleAudioFileChange(e) {
    const file = e.target.files[0]
    if (file && file.type.startsWith('audio/')) {
        uploadStore.setAudioFile(file)
    } else {
        alert('Molimo odaberite audio datoteku')
    }
}


function handleCoverImageChange(e) {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
        uploadStore.setCoverImage(file)
    } else {
        alert('Molimo odaberite sliku')
    }
}


function resetForm() {
    uploadStore.resetForm()

    const fileInputs = document.querySelectorAll('input[type="file"]')
    fileInputs.forEach(input => {
        input.value = ''
    })
}
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8 text-center">Upload Glazbe kao NFT</h1>

        <div v-if="!isConnected" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <p class="font-bold">Upozorenje</p>
            <p>Morate se povezati s MetaMask novčanikom da biste kreirali glazbeni NFT.</p>
            <button @click="web3Store.connectWallet"
                class="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Poveži Novčanik
            </button>
        </div>

        <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p class="font-bold">Greška</p>
            <p>{{ error }}</p>
        </div>

        <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p class="font-bold">Uspjeh!</p>
            <p>{{ successMessage }}</p>
        </div>

        <div class="bg-white shadow-md rounded-lg p-6 mb-8">
            <form @submit.prevent="uploadStore.uploadAndMint">
                <!-- Osnovni podaci -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
                            Naslov *
                        </label>
                        <input id="title" v-model="title" type="text"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required>
                    </div>

                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="artist">
                            Izvođač *
                        </label>
                        <input id="artist" v-model="artist" type="text"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required>
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
                        Opis
                    </label>
                    <textarea id="description" v-model="description"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="4"></textarea>
                </div>

                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="royalty">
                        Royalty postotak ({{ royaltyPercentage }}%)
                    </label>
                    <input id="royalty" v-model="royaltyPercentage" type="range" min="0" max="10" step="0.5"
                        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                    <div class="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span>5%</span>
                        <span>10%</span>
                    </div>
                </div>

                <!-- Audio datoteka -->
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                        Audio datoteka *
                    </label>
                    <div class="flex flex-col space-y-2">
                        <input type="file" accept="audio/*" @change="handleAudioFileChange"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required>
                        <audio v-if="audioFileUrl" controls class="w-full">
                            <source :src="audioFileUrl" />
                            Vaš preglednik ne podržava audio element.
                        </audio>
                    </div>
                </div>

                <!-- Cover slika -->
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                        Cover slika *
                    </label>
                    <div class="flex flex-col space-y-2">
                        <input type="file" accept="image/*" @change="handleCoverImageChange"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required>
                        <img v-if="coverImageUrl" :src="coverImageUrl" class="max-h-40 object-contain" />
                    </div>
                </div>

                <!-- Progress bar -->
                <div v-if="isUploading" class="mb-6">
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: `${uploadProgress}%` }"></div>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">{{ uploadProgress }}% Završeno</p>
                </div>

                <!-- Gumbi -->
                <div class="flex justify-between">
                    <button type="button" @click="resetForm"
                        class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                        Poništi
                    </button>
                    <button type="submit" :disabled="isUploading || !isConnected"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="isUploading">Uploading...</span>
                        <span v-else>Kreiraj NFT</span>
                    </button>
                </div>
            </form>
        </div>

        <div class="bg-blue-50 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">O kreiranju glazbenih NFT-ova</h2>
            <p class="mb-4">
                Kreiranjem glazbenog NFT-a, vaša će glazba biti tokenizirana na Ethereum blockchain-u.
                To vam omogućuje direktnu prodaju obožavateljima i automatsko primanje tantijema pri svakoj preprodaji.
            </p>
            <p class="mb-4">
                <strong>Royalty postotak</strong> određuje koliko ćete primiti od svake preprodaje vašeg NFT-a.
                Na primjer, ako postavite royalty na 5% i netko proda vaš NFT za 1 ETH, automatski ćete primiti 0.05
                ETH.
            </p>
            <p>
                <strong>Napomena:</strong> Nakon kreiranja NFT-a, trebat ćete ga listati na markteplaceu kako bi bio
                dostupan za prodaju.
            </p>
        </div>
    </div>
</template>