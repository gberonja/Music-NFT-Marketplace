import { ref, reactive } from 'vue'


const audioState = reactive({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  isMuted: false,
  playlist: [],
  currentIndex: -1,
  isLoading: false
})

let audioElement = null

export class AudioPlayerService {
  constructor() {
    this.initializeAudio()
  }

  initializeAudio() {
    if (typeof Audio !== 'undefined') {
      audioElement = new Audio()
      

      audioElement.addEventListener('loadeddata', () => {
        audioState.duration = audioElement.duration
        audioState.isLoading = false
      })
      
      audioElement.addEventListener('timeupdate', () => {
        audioState.currentTime = audioElement.currentTime
      })
      
      audioElement.addEventListener('ended', () => {
        this.playNext()
      })
      
      audioElement.addEventListener('play', () => {
        audioState.isPlaying = true
      })
      
      audioElement.addEventListener('pause', () => {
        audioState.isPlaying = false
      })
      
      audioElement.addEventListener('loadstart', () => {
        audioState.isLoading = true
      })
      
      audioElement.addEventListener('error', (e) => {
        console.error('Audio error:', e)
        audioState.isLoading = false
        this.playNext()
      })
      
 
      audioElement.volume = audioState.volume
    }
  }


  setTrack(track) {
    if (!audioElement) return
    
    audioState.currentTrack = track
    audioElement.src = track.audioUrl
    audioState.currentTime = 0
    audioElement.load()
  }


  async play() {
    if (!audioElement || !audioState.currentTrack) return
    
    try {
      await audioElement.play()
    } catch (error) {
      console.error('Play error:', error)
    }
  }

 
  pause() {
    if (!audioElement) return
    audioElement.pause()
  }

 
  togglePlay() {
    if (audioState.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

 
  setCurrentTime(time) {
    if (!audioElement) return
    audioElement.currentTime = time
  }

  
  setVolume(volume) {
    if (!audioElement) return
    audioState.volume = volume
    audioElement.volume = volume
  }

  toggleMute() {
    if (!audioElement) return
    
    if (audioState.isMuted) {
      audioElement.volume = audioState.volume
      audioState.isMuted = false
    } else {
      audioElement.volume = 0
      audioState.isMuted = true
    }
  }

  setPlaylist(tracks) {
    audioState.playlist = tracks
    if (tracks.length > 0) {
      audioState.currentIndex = 0
      this.setTrack(tracks[0])
    }
  }

  playFromPlaylist(index) {
    if (audioState.playlist.length === 0 || index < 0 || index >= audioState.playlist.length) return
    
    audioState.currentIndex = index
    this.setTrack(audioState.playlist[index])
    this.play()
  }

  
  playNext() {
    if (audioState.playlist.length === 0) {
      audioState.isPlaying = false
      return
    }
    
    const nextIndex = (audioState.currentIndex + 1) % audioState.playlist.length
    this.playFromPlaylist(nextIndex)
  }


  playPrevious() {
    if (audioState.playlist.length === 0) return
    
    const prevIndex = audioState.currentIndex === 0 
      ? audioState.playlist.length - 1 
      : audioState.currentIndex - 1
    this.playFromPlaylist(prevIndex)
  }


  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00'
    
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  get state() {
    return audioState
  }
}

export const audioPlayer = new AudioPlayerService()