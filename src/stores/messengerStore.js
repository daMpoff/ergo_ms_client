import { defineStore } from 'pinia'

export const useMessengerStore = defineStore('messengerStore', () => {
  return {
    messages: [],
  }
})
