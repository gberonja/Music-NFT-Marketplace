# MusicStore - Decentralizirana glazbena tržnica

Jednostavna Web3 aplikacija za kupnju i prodaju glazbenih NFT-ova izgrađena na Ethereum blockchainu.

## Opis projekta

MusicStore omogućuje glazbenicima da kreiraju NFT-ove svojih pjesama i prodaju ih direktno kupcima bez posrednika. Aplikacija koristi pametne ugovore za sigurnu trgovinu i MetaMask za upravljanje novčanikom.

## Funkcionalnosti

- 🎵 Kreiranje glazbenih NFT-ova
- 💰 Kupnja i prodaja glazbe u ETH
- 🔍 Pretraživanje pjesama i izvođača
- 💳 MetaMask integracija
- 📱 Responzivni dizajn

## Tehnologije

- **Frontend**: Vue.js 3, Tailwind CSS
- **Blockchain**: Ethereum, Solidity
- **Razvoj**: Hardhat, Ethers.js

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

3. **Deploiraj pametni ugovor**

   ```bash
   npx hardhat compile
   npx hardhat deploy --network localhost
   ```

4. **Postavi .env datoteku**

   ```
   VITE_CONTRACT_ADDRESS=adresa_deployiranog_ugovora
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
4. Kupiti pjesme drugih korisnika
5. Pretraživati pjesme po nazivu ili izvođaču

---

**Projekt izrađen u sklopu kolegija Blockchain aplikacije**  
**Mentor: dr.sc. Nikola Tanković**  
**Fakultet informatike u Puli, 2025.**
