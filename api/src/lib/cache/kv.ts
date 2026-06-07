/* Workers KV backed Storage */
import type { Storage } from '@/lib/cache'
import { wrapFetch } from '@/lib/cache'

export const kvStorage = (kv: KVNamespace): Storage => {
  const storage: Storage = {
    async get<T>(key: string) {
      const value = await kv.get(key, 'json')
      return (value as T) ?? null
    },
    async set<T>(key: string, value: T, ttlSec: number) {
      await kv.put(key, JSON.stringify(value), {
        expirationTtl: Math.max(ttlSec, 60),
      })
    },
    fetch: async () => {
      throw new Error('uninit')
    },
  }
  storage.fetch = wrapFetch(storage)
  return storage
}
