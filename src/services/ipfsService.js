const projectId = import.meta.env.VITE_INFURA_PROJECT_ID || ''
const projectSecret = import.meta.env.VITE_INFURA_API_SECRET || ''

const auth = 'Basic ' + btoa(projectId + ':' + projectSecret)

export async function uploadFileToIPFS(file) {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': auth
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('IPFS upload success:', result.Hash)
    return result.Hash
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw error
  }
}

export async function uploadMetadataToIPFS(metadata) {
  try {
    const formData = new FormData()
    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    formData.append('file', blob)

    const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': auth
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Metadata upload success:', result.Hash)
    return result.Hash
  } catch (error) {
    console.error('Metadata upload error:', error)
    throw error
  }
}

export function getIPFSUrl(cid) {
  return `https://ipfs.io/ipfs/${cid}`
}