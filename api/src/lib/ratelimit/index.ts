/**
 * Rate limit middleware factory
 * Basic measure to prevent obvious abuse for public routes
 * Uses CF's native rate-limiting API, configurable in wrangler.toml
 * Only applies to unauthenticated requests on the public instance
 * By default, there's no rate-limiting on self-hosted/Bun versions
 */
import type { MiddlewareHandler } from 'hono'
import { ApiError } from '@/lib/errors'
import type { HonoEnv } from '@/types'

export const rateLimit = (): MiddlewareHandler<HonoEnv> => async (c, next) => {
  const limiter = c.env.RATE_LIMIT
  if (!limiter) return next()
  const key =
    c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'anon'
  const { success } = await limiter.limit({ key })
  if (!success) throw new ApiError('RATE_LIMITED', 'Too many requests', 429)
  return next()
}
