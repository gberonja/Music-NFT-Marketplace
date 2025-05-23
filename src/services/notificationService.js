import { reactive } from 'vue'

const notifications = reactive([])

export class NotificationService {
  static show(message, type = 'info', duration = 4000) {
    const id = Date.now() + Math.random()
    const notification = {
      id,
      message,
      type, 
      duration,
      visible: true
    }
    
    notifications.push(notification)
    

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, duration)
    }
    
    return id
  }
  
  static remove(id) {
    const index = notifications.findIndex(n => n.id === id)
    if (index > -1) {
      notifications[index].visible = false
      setTimeout(() => {
        notifications.splice(index, 1)
      }, 300)
    }
  }
  
  static success(message, duration) {
    return this.show(message, 'success', duration)
  }
  
  static error(message, duration) {
    return this.show(message, 'error', duration)
  }
  
  static warning(message, duration) {
    return this.show(message, 'warning', duration)
  }
  
  static info(message, duration) {
    return this.show(message, 'info', duration)
  }
  
  static get notifications() {
    return notifications
  }
}


export const toast = NotificationService