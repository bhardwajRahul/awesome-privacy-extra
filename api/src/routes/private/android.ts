// Exodus Privacy app lookup, joined with the tracker dictionary
import { createRoute, z } from '@hono/zod-openapi'
import { fetchJson } from '@/lib/fetch'
import { ApiError } from '@/lib/errors'
import { newApp } from '@/lib/openapi'
import { AndroidReportSchema, ErrorResponse, Ok } from '@/schemas'

const app = newApp()

const SUCCESS_TTL = 7 * 24 * 60 * 60
const NEGATIVE_TTL = 6 * 60 * 60

interface AppDetails {
  trackers: number[]
  [key: string]: unknown
}
interface TrackerLookup {
  trackers: Record<string, unknown>
}

const EXODUS_BASE = 'https://reports.exodus-privacy.eu.org/api'

const route = createRoute({
  method: 'get',
  path: '/enrich/android/{pkg}',
  tags: ['Enrichment'],
  summary: 'Android app info',
  request: { params: z.object({ pkg: z.string() }) },
  responses: {
    200: Ok(AndroidReportSchema),
    401: ErrorResponse,
    404: ErrorResponse,
    500: ErrorResponse,
    502: ErrorResponse,
  },
})

// Resolve the apk then replace tracker ids with their detail records
app.openapi(route, async (c) => {
  const { pkg } = c.req.valid('param')
  const token = c.env.EXODUS_TOKEN
  if (!token) throw new ApiError('INTERNAL', 'EXODUS_TOKEN not configured', 500)
  const headers = { Authorization: `Token ${token}` }
  const data = await c.var.storage.fetch(
    `android:${pkg}`,
    SUCCESS_TTL,
    NEGATIVE_TTL,
    async () => {
      const detailsUrl = `${EXODUS_BASE}/search/${encodeURIComponent(pkg)}/details`
      const details = await fetchJson<AppDetails[]>(detailsUrl, {
        headers,
        timeoutMs: 10000,
      })
      const appInfo = details?.[0]
      if (!appInfo) {
        throw new ApiError('NOT_FOUND', `Package '${pkg}' not found on Exodus`, 404)
      }
      const { trackers } = await fetchJson<TrackerLookup>(`${EXODUS_BASE}/trackers`, {
        headers,
        timeoutMs: 10000,
      })
      return {
        ...appInfo,
        trackers: appInfo.trackers.map((id) => trackers[String(id)]),
      }
    },
  )
  return c.json(data, 200)
})

export default app
