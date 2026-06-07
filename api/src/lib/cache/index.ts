/**
 * The storage interface
 * Caches certain lookup results, so as to reduce load and improve perf
 * Picks between in-mem store for Bun/Node or KV db for Cloudflare Workers
 */

import { ApiError, type ErrorCode } from '@/lib/errors'
import type { AppEnv } from '@/types'
import { kvStorage } from '@/lib/cache/kv'
import { memoryStorage } from '@/lib/cache/memory'

export interface Storage {
  get<T = unknown>(key: string): Promise<T | null>
  set<T = unknown>(key: string, value: T, ttlSec: number): Promise<void>
  // Run loader once, cache the result for ttl, cache negatives for negTtl
  fetch<T>(key: string, ttl: number, negTtl: number, loader: () => Promise<T>): Promise<T>
}

export const createStorage = (env: AppEnv): Storage =>
  env.CACHE ? kvStorage(env.CACHE) : memoryStorage()

interface NegEntry {
  ok: false
  code: ErrorCode
  message: string
  status: number
}
interface PosEntry<T> {
  ok: true
  value: T
}

// Shared fetch wrapper, caches successes and replays typed negatives
export const wrapFetch =
  (storage: Storage) =>
  async <T>(
    key: string,
    ttl: number,
    negTtl: number,
    loader: () => Promise<T>,
  ): Promise<T> => {
    const cached = await storage.get<PosEntry<T> | NegEntry>(key)
    if (cached) {
      if (cached.ok) return cached.value
      throw new ApiError(cached.code, cached.message, cached.status)
    }
    try {
      const value = await loader()
      await storage.set(key, { ok: true, value } satisfies PosEntry<T>, ttl)
      return value
    } catch (caught) {
      const error =
        caught instanceof ApiError
          ? caught
          : new ApiError('UPSTREAM_ERROR', (caught as Error).message, 502)
      const negative: NegEntry = {
        ok: false,
        code: error.code,
        message: error.message,
        status: error.status,
      }
      await storage.set(key, negative, negTtl)
      throw error
    }
  }
