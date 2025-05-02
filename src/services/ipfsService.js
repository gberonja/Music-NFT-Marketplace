import { create } from 'ipfs-http-client'


const projectId = import.meta.env.VITE_INFURA_PROJECT_ID || ''
const projectSecret = import.meta.env.VITE_INFURA_API_SECRET || ''


const auth = 'Basic ' + btoa(projectId + ':' + projectSecret)


const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
})


export async function uploadFileToIPFS(file) {
  try {
    const added = await ipfs.add(file, {
      progress: (prog) => console.log(`Učitano: ${prog}`)
    })
    const url = `https://ipfs.io/ipfs/${added.path}`
    console.log('IPFS URL:', url)
    return added.path
  } catch (error) {
    console.error('Greška pri uploadu na IPFS:', error)
    throw error
  }
}


export async function uploadMetadataToIPFS(metadata) {
  try {
    const metadataJSON = JSON.stringify(metadata)
    const added = await ipfs.add(metadataJSON)
    const url = `https://ipfs.io/ipfs/${added.path}`
    console.log('Metadata URL:', url)
    return added.path
  } catch (error) {
    console.error('Greška pri uploadu metapodataka na IPFS:', error)
    throw error
  }
}


export function getIPFSUrl(cid) {
  return `https://ipfs.io/ipfs/${cid}`
}