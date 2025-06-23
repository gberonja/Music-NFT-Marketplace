# MusicStore - Decentralizirana glazbena tržnica

Napredna Web3 aplikacija za kupnju i prodaju glazbenih NFT-ova s aukcijskim sustavom izgrađena na Ethereum blockchainu.

## Opis projekta

MusicStore omogućuje glazbenicima da kreiraju NFT-ove svojih pjesama i prodaju ih direktno kupcima bez posrednika. Aplikacija koristi pametne ugovore za sigurnu trgovinu, aukcijski sustav za dinamičko određivanje cijena, i MetaMask za upravljanje novčanikom.

## Funkcionalnosti

- 🎵 Kreiranje glazbenih NFT-ova
- 💰 Kupnja i prodaja glazbe u ETH
- 🔨 Aukcijski sustav s vremenskim ograničenjem
- 💸 Licitiranje u realnom vremenu
- 🔍 Pretraživanje pjesama i izvođača
- 💳 MetaMask integracija
- 📱 Responzivni dizajn
- 🔔 Push notifikacije
- 📤 Dijeljenje glazbe

## Tehnologije

- **Frontend**: Vue.js 3, Tailwind CSS
- **Blockchain**: Ethereum, Solidity
- **Razvoj**: Hardhat, Ethers.js
- **Pametni ugovori**: SimpleMusic.sol, MusicAuction.sol

## Pokretanje

1. **Instaliraj ovisnosti**

   ```bash
   npm install
   cd smart-contracts && npm install
   ```

2. **Pokreni lokalnu blockchain mrežu**

   ```bash
   npx hardhat node
   ```

3. **Deploiraj pametne ugovore**

   ```bash
   npx hardhat compile
   npx hardhat deploy --network localhost
   ```

4. **Postavi .env datoteku**

   ```
   VITE_MUSIC_CONTRACT_ADDRESS=adresa_music_ugovora
   VITE_AUCTION_CONTRACT_ADDRESS=adresa_auction_ugovora
   ```

5. **Pokreni aplikaciju**

   ```bash
   npm run dev
   ```

6. **Konfiguriraj MetaMask**
   - Dodaj localhost mrežu (RPC: http://127.0.0.1:8545, Chain ID: 1337)
   - Importiraj test račun iz Hardhat-a

## Kako koristiti

1. Povezati MetaMask novčanik
2. Kreirati glazbeni NFT unosom naziva, izvođača i cijene
3. Pregledati dostupne pjesme na tržištu
4. Kupiti pjesme drugih korisnika direktno ili putem aukcije
5. Pokrenuti aukciju za vlastite pjesme
6. Licitirati na aktivnim aukcijama
7. Pretraživati pjesme po nazivu ili izvođaču

## Aukcijski sustav

Aplikacija uključuje napredni aukcijski sustav s:
- Postavljanjem početne cijene i vremenskog ograničenja
- Automatskim završetkom aukcije
- Povratom sredstava za neuspješne licitante
- Transferom vlasništva pobjedniku

## Arhitektura pametnih ugovora

- **SimpleMusic**: Glavni ugovor za upravljanje NFT-ovima
- **MusicAuction**: Ugovor za aukcijski sustav
- Međusobno povezani ugovori za siguran transfer vlasništva

---

**Projekt izrađen u sklopu kolegija Blockchain aplikacije**  
**Student: Gabriel Beronja**  
**Mentor: dr.sc. Nikola Tanković**  
**Fakultet informatike u Puli, 2025.**
