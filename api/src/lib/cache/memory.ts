/* In-process Map with TTL, storage cache for Node/Bun */
import type { Storage } from '@/lib/cache'
import { wrapFetch } from '@/lib/cache'

interface Entry {
  expires: number
  value: unknown
}
const store = new Map<string, Entry>()

export const memoryStorage = (): Storage => {
  const storage: Storage = {
    async get<T>(key: string) {
      const entry = store.get(key)
      if (!entry) return null
      if (entry.expires < Date.now()) {
        store.delete(key)
        return null
      }
      return entry.value as T
    },
    async set<T>(key: string, value: T, ttlSec: number) {
      store.set(key, { expires: Date.now() + ttlSec * 1000, value })
    },
    fetch: async () => {
      throw new Error('uninit')
    },
  }
  storage.fetch = wrapFetch(storage)
  return storage
}
