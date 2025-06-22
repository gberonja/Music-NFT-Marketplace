// Mock IPFS Service for Testing
// Since Infura IPFS is no longer available for new users

function generateMockCID() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'Qm'
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Store uploaded files in memory for this session
const mockStorage = new Map()

export async function uploadFileToIPFS(file) {
  console.log('🎭 Mock IPFS: Uploading file...', file.name, `(${(file.size / 1024).toFixed(1)}KB)`)
  
  // Simulate realistic upload delay based on file size
  const delay = Math.min(file.size / 100000 + 500, 3000) // 500ms to 3s
  await new Promise(resolve => setTimeout(resolve, delay))
  
  const mockCID = generateMockCID()
  
  // Store file URL for preview (if it's an image)
  if (file.type.startsWith('image/')) {
    mockStorage.set(mockCID, URL.createObjectURL(file))
  } else if (file.type.startsWith('audio/')) {
    mockStorage.set(mockCID, URL.createObjectURL(file))
  }
  
  console.log('✅ Mock IPFS upload success:', mockCID)
  
  return mockCID
}

export async function uploadMetadataToIPFS(metadata) {
  console.log('🎭 Mock IPFS: Uploading metadata...')
  console.log('📄 Metadata:', { 
    name: metadata.name, 
    artist: metadata.artist,
    genre: metadata.genre 
  })
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const mockCID = generateMockCID()
  
  // Store metadata for retrieval
  mockStorage.set(mockCID, metadata)
  
  console.log('✅ Mock metadata upload success:', mockCID)
  
  return mockCID
}

export function getIPFSUrl(cid) {
  // If we have the actual file stored (images/audio), return it
  if (mockStorage.has(cid)) {
    return mockStorage.get(cid)
  }
  
  // Return different placeholder images based on CID
  const placeholders = [
    'https://via.placeholder.com/400x400/6366f1/white?text=🎵+Music+NFT',
    'https://via.placeholder.com/400x400/8b5cf6/white?text=🎧+Audio+Track', 
    'https://via.placeholder.com/400x400/06b6d4/white?text=🎼+Digital+Music',
    'https://via.placeholder.com/400x400/10b981/white?text=🎤+Sound+NFT',
    'https://via.placeholder.com/400x400/f59e0b/white?text=🎶+Music+Token',
    'https://via.placeholder.com/400x400/ef4444/white?text=🎸+Rock+NFT'
  ]
  
  // Use CID to determine which placeholder (consistent per CID)
  const index = cid ? cid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % placeholders.length : 0
  return placeholders[index]
}

// Mock audio URLs for testing audio player
export function getMockAudioUrl() {
  // These are royalty-free test audio files
  const mockAudioUrls = [
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    'https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav',
    'https://www.soundjay.com/misc/sounds/success-sound-effect.wav'
  ]
  
  return mockAudioUrls[Math.floor(Math.random() * mockAudioUrls.length)]
}

// Additional helper functions
export async function testConnection() {
  console.log('🎭 Mock IPFS: Testing connection...')
  await new Promise(resolve => setTimeout(resolve, 500))
  console.log('✅ Mock IPFS connection ready')
  return true
}

export function clearMockStorage() {
  console.log('🧹 Clearing mock IPFS storage...')
  mockStorage.clear()
}

// Show mock info banner
console.log(`
🎭 MOCK IPFS SERVICE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️  Using mock IPFS for testing
✅ All functionality will work
🖼️ Placeholder images will be shown
🎵 Real uploaded files preserved for preview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)