# MusicNFT Marketplace 🎵

Decentralizirana Web3 aplikacija za tokenizaciju glazbe kao NFT-ova s automatskim royalty sustavom.

## 🚀 Brzo pokretanje

### Preduvjeti

- Node.js (v16+)
- MetaMask browser ekstenzija
- Infura account za IPFS

### 1. Instalacija

```bash
git clone [your-repo-url]
cd music-nft-marketplace
npm install

# Instaliraj smart contract dependencies
cd smart-contracts
npm install
cd ..
```

### 2. Environment setup

Stvori `.env` u root direktoriju:

```env
VITE_MUSICNFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_MARKETPLACE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_INFURA_PROJECT_ID=your_infura_project_id
VITE_INFURA_API_SECRET=your_infura_api_secret
```

Stvori `smart-contracts/.env`:

```env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
SEPOLIA_URL=https://sepolia.infura.io/v3/your_infura_project_id
```

### 3. MetaMask setup

Dodaj Localhost Network u MetaMask:

- **Network name:** Localhost 8545
- **RPC URL:** http://localhost:8545
- **Chain ID:** 1337
- **Currency:** ETH

Importaj test account:

- **Private Key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### 4. Pokretanje

**Terminal 1 - Blockchain:**

```bash
cd smart-contracts
npx hardhat node
```

**Terminal 2 - Deploy contracts:**

```bash
cd smart-contracts
npx hardhat run scripts/deploy.js --network localhost
```

**Terminal 3 - Frontend:**

```bash
npm run dev
```

Aplikacija: http://localhost:5173

## 📱 Kako koristiti

### Za Glazbenike:

1. **Poveži MetaMask** - klikni "Connect Wallet"
2. **Upload Music** - idi na "Create" tab
3. **Ispuni podatke** - naziv, izvođač, opis, žanr
4. **Upload files** - cover slika i audio datoteka
5. **Postavi royalty** - postotak za buduće prodaje (0-10%)
6. **Postavi cijenu** - za automatsko listanje (opcionalno)
7. **Kreiraj NFT** - potvrdi transakciju u MetaMask

### Za Kupce:

1. **Pregledaj Marketplace** - browse dostupne NFT-ove
2. **Slušaj preview** - testraj glazbu prije kupnje
3. **Kupi NFT** - klikni "Buy Now" i potvrdi u MetaMask
4. **Upravljaj kolekcijom** - pregledaj svoje NFT-ove u Profile

## 🛠 Tehnički stack

### Frontend

- **Vue.js 3** - reaktivni UI framework
- **Pinia** - state management
- **Vue Router** - navigacija
- **Custom CSS** - styling (bez external framework-a)

### Blockchain

- **Solidity** - smart contracts
- **Hardhat** - development environment
- **OpenZeppelin** - sigurni ERC-721 standard
- **ethers.js** - blockchain interakcija

### Storage

- **IPFS** - decentralizirano pohranjivanje
- **Infura** - IPFS gateway

## 🔧 Ključne značajke

### ✅ Implementirane

- **NFT kreiranje** s IPFS pohranom metapodataka i datoteka
- **Marketplace** s kupnjom/prodajom
- **Royalty sustav** - automatske naknade originalnom autoru
- **Audio player** za preview glazbe
- **Responsive design**
- **MetaMask integracija**
- **Real-time blockchain interakcija**
- **Error handling i user feedback**

### 🔄 Moguća poboljšanja

- **Batch upload** više datoteka odjednom
- **Social features** (komentari, ocjene, favoriti)
- **Advanced search** i filtriranje
- **NFT collections** i albumi
- **Auction system** za bidding
- **Mobile app** s React Native

## 🏗 Arhitektura

```
src/
├── components/          # Vue komponente
│   ├── Header.vue      # Navigacija i wallet connection
│   └── MusicNFTCard.vue # NFT prikaz kartica
├── views/              # Page komponente
│   ├── Home.vue        # Landing stranica
│   ├── Marketplace.vue # NFT marketplace
│   ├── Upload.vue      # Upload i mint NFT-ova
│   └── Profile.vue     # User profil i owned NFT-ovi
├── store/              # Pinia stores
│   ├── web3Store.js    # Web3 konekcija i contract instanci
│   ├── marketplaceStore.js # Marketplace funkcionalnost
│   └── uploadStore.js  # Upload i minting logika
├── services/           # External servisi
│   └── ipfsService.js  # IPFS upload funkcije
└── router/             # Vue Router setup
```

## 🔐 Sigurnost

- **OpenZeppelin** battle-tested libraries
- **Input validation** na svim razinama
- **Error boundaries** za graceful degradation
- **Secure IPFS uploads** s Infura
- **MetaMask** secure transaction signing

## 💰 Tokenomics

- **Marketplace fee:** 2.5% od svake prodaje
- **Creator royalty:** Do 10% originalnom autoru pri resale
- **Gas optimization:** Efficient contract design

## 🐛 Troubleshooting

### "Could not fetch chain ID"

```bash
# Restartaj Hardhat node
cd smart-contracts
npx hardhat node
```

### "Failed to connect wallet"

- Provjeri da je MetaMask otključan
- Prebaci na Localhost 8545 network
- Refresh stranicu

### "IPFS upload failed"

- Provjeri Infura credentials u `.env`
- Provjeri internetsku konekciju

### "Transaction failed"

- Provjeri balance za gas fees
- Povećaj gas limit ako je potrebno
- Provjeri da contract adrese u `.env` odgovaraju deployed contractovima

### Smart contract errors

```bash
# Redeploy contracts
cd smart-contracts
npx hardhat run scripts/deploy.js --network localhost
# Ažuriraj contract adrese u .env
```

## 📝 Development Notes

### Obrisani fajlovi

Sljedeći fajlovi su uklonjeni jer nisu potrebni:

- `src/utils/contractUtils.js` - zastarjeli pristup
- `src/utils/simpleWeb3.js` - test funkcije
- `src/components/Footer.vue` - ne koristi se
- `dotenv` dependency - nije potreban

### Ključne promjene

1. **Web3Store refactor** - dodani contract instance i proper initialization
2. **Upload workflow** - kompletan IPFS + minting pipeline
3. **Marketplace integration** - real blockchain data fetching
4. **Error handling** - user-friendly error messages
5. **Responsive design** - mobile-first approach

## 🤝 Contributing

1. Fork repository
2. Stvori feature branch
3. Commit changes
4. Push to branch
5. Stvori Pull Request

## 📄 Licenca

MIT License

## 👨‍💻 Autor

**Gabriel Beronja**

- GitHub: [@gberonja]
