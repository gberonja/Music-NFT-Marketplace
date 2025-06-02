# MusicNFT Marketplace 🎵

Decentralizirana Web3 aplikacija za tokenizaciju glazbe kao NFT-ova s automatskim royalty sustavom.

## 📋 Pregled

MusicNFT Marketplace omogućuje glazbenicima da:

- Tokeniziraju svoju glazbu kao NFT-ove
- Postavljaju royalty postotak (automatske naknade pri preprodaji)
- Prodaju direktno obožavateljima bez posrednika
- Zarađuju od svake preprodaje svojih NFT-ova

## 🛠 Tehnologije

### Blockchain

- **Ethereum** - osnovna blockchain platforma
- **Solidity** - pametni ugovori
- **Hardhat** - development framework
- **OpenZeppelin** - sigurni ERC-721 standard

### Frontend

- **Vue.js 3** - reaktivni UI framework
- **Pinia** - state management
- **Tailwind CSS** - styling framework
- **Vite** - build tool

### Storage & Integration

- **IPFS** - decentralizirano pohranjivanje datoteka
- **Infura** - IPFS gateway
- **MetaMask** - Web3 wallet integracija

## 🏗 Arhitektura

### Smart Contracts

- `MusicNFT.sol` - ERC-721 implementation s royalty sustavom
- `MusicMarketplace.sol` - tržište za kupnju/prodaju NFT-ova

### Frontend Komponente

- Upload glazbe i metapodataka
- Marketplace s pretraživanjem i filtriranjem
- Audio player za preview
- Profil s korisničkim NFT-ovima

## 🚀 Instalacija i Setup

### Preduvjeti

- Node.js (v16+)
- npm ili yarn
- MetaMask browser ekstenzija
- Infura account (za IPFS)

### 1. Kloniraj repository

```bash
git clone [your-repo-url]
cd music-nft-marketplace
```

### 2. Instaliraj dependencies

```bash
# Root dependencies
npm install

# Smart contracts dependencies
cd smart-contracts
npm install
cd ..
```

### 3. Environment setup

#### Stvori `smart-contracts/.env`:

```env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
SEPOLIA_URL=https://sepolia.infura.io/v3/your_infura_project_id
```

#### Stvori `.env` u root direktoriju:

```env
VITE_MUSICNFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_MARKETPLACE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_INFURA_PROJECT_ID=your_infura_project_id
VITE_INFURA_API_SECRET=your_infura_api_secret
```

### 4. Infura IPFS Setup

1. Registriraj se na [Infura.io](https://infura.io)
2. Stvori novi IPFS projekt
3. Kopiraj Project ID i API Secret u `.env`

### 5. MetaMask Setup

#### Dodaj Localhost Network:

```
Network name: Localhost 8545
New RPC URL: http://localhost:8545
Chain ID: 1337
Currency symbol: ETH
```

#### Importaj Test Account:

```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## 🎯 Pokretanje

### 1. Pokreni Hardhat blockchain (Terminal 1)

```bash
cd smart-contracts
npx hardhat node
```

### 2. Deploy contracts (Terminal 2)

```bash
cd smart-contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Pokreni frontend (Terminal 3)

```bash
npm run dev
```

Aplikacija će biti dostupna na: http://localhost:5173

## 📱 Korištenje

### Za Glazbenike:

1. **Poveži MetaMask** wallet
2. **Upload Music** - učitaj audio datoteku i cover sliku
3. **Postavi royalty** postotak (0-10%)
4. **Kreiraj NFT** - mint na blockchain
5. **Listaj na marketplace** za prodaju

### Za Kupce:

1. **Pregledaj Marketplace**
2. **Slušaj preview** glazbe
3. **Kupi NFT** putem MetaMaska
4. **Preprodaj** u svom profilu

## 🎵 Značajke

### ✅ Implementirane

- **NFT kreiranje** s IPFS pohranom
- **Marketplace** s kupnjom/prodajom
- **Royalty sustav** (10% autorima)
- **Audio player** s playlist funkcionalnostima
- **Responsive design** s dark mode
- **MetaMask integracija**
- **IPFS decentralizirano pohranjivanje**

### 🔄 U razvoju

- **Batch upload** više glazbenih datoteka
- **Social features** (komentari, ocjene)
- **Advanced filtering** (žanr, godina)
- **NFT staking** možnosti

## 🧪 Testiranje

```bash
# Test smart contracts
cd smart-contracts
npx hardhat test

# Run frontend tests
npm run test
```

## 📁 Struktura Projekta

```
music-nft-marketplace/
├── smart-contracts/          # Blockchain layer
│   ├── contracts/           # Solidity smart contracts
│   ├── scripts/             # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.js   # Hardhat configuration
├── src/                    # Frontend application
│   ├── components/         # Vue components
│   ├── views/             # Page components
│   ├── store/             # Pinia stores
│   ├── services/          # API services
│   └── router/            # Vue Router setup
├── public/                # Static assets
└── package.json          # Dependencies
```

## 🔐 Sigurnost

### Smart Contracts

- **OpenZeppelin** battle-tested libraries
- **ReentrancyGuard** zaštita
- **Access Control** s Ownable pattern
- **Input validation** u svim funkcijama

### Frontend

- **Environment variables** za osjetljive podatke
- **HTTPS** komunikacija s IPFS
- **MetaMask** secure wallet integration

## 💰 Ekonomski Model

- **Marketplace fee**: 2.5% od svake prodaje
- **Royalty fee**: Do 10% originalnom autoru pri preprodaji
- **Gas optimizacija** za niže troškove transakcija

## 🌐 Deployment

### Localhost (Development)

Već konfigurirano - slijedi upute za pokretanje.

### Testnet (Sepolia)

```bash
# Deploy na Sepolia
cd smart-contracts
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet (Production)

⚠️ **Pažnja**: Mainnet deployment troški pravi novac!

## 🐛 Česti Problemi

### "Could not fetch chain ID"

- Provjeri da je Hardhat node pokrenut
- Restartaj MetaMask

### "Failed to connect wallet"

- Prebaci na Localhost 8545 mrežu
- Provjeri je li MetaMask otključan

### "IPFS upload failed"

- Provjeri Infura credentials u `.env`
- Provjeri internetsku konekciju

### "Transaction failed"

- Provjeri imaš li dovoljno ETH za gas
- Restartaj blockchain i redeploy contracts

## 🤝 Doprinosi

1. Fork repository
2. Stvori feature branch (`git checkout -b feature/nova-funkcionalnost`)
3. Commit promjene (`git commit -am 'Dodaj novu funkcionalnost'`)
4. Push na branch (`git push origin feature/nova-funkcionalnost`)
5. Stvori Pull Request

## 📄 Licenca

MIT License - vidi [LICENSE](LICENSE) file za detalje.

## 👨‍💻 Autor

**Gabriel Beronja**

- GitHub: [@gberonja]

## 🙏 Zahvale

- **OpenZeppelin** za sigurne smart contract patterns
- **Infura** za IPFS infrastructure
- **Hardhat** za development framework
- **Vue.js** community za odličnu dokumentaciju
