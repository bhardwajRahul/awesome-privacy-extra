/**
 * Middleware to add basic bearer token auth to /enrich/* routes
 * To prevent abuse of endpoints which make third-party requests
 * It's off-by-default, and can be enabled by setting API_TOKEN
 * Works by checking the "Authorization: Bearer $API_TOKEN" header
 */

import type { MiddlewareHandler } from 'hono'
import { ApiError } from '@/lib/errors'
import type { HonoEnv } from '@/types'

// Compare specified token against expected, using constant time
const constantTimeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false
  let diff = 0
  for (let index = 0; index < left.length; index++) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return diff === 0
}

// If auth enabled, check specified header matches env var, otherwise respond 401
export const requireBearer = (): MiddlewareHandler<HonoEnv> => async (c, next) => {
  const expected = c.env.API_TOKEN
  if (!expected) return next()
  const header = c.req.header('authorization') ?? ''
  const match = /^Bearer\s+(\S+)$/i.exec(header)
  if (!match || !constantTimeEqual(match[1], expected)) {
    throw new ApiError('UNAUTHORIZED', 'Invalid or missing bearer token', 401)
  }
  await next()
}
