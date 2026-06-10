import { error } from './logger';
import { safeFetch } from './safe-fetch';
import { apiBase, enrichHeaders } from './api-config';

export const fetchDiscordInfo = async (
  discordInvite: string,
): Promise<DiscordInfo | null> => {
  const endpoint = `${apiBase}/v1/enrich/discord/${discordInvite}`;
  try {
    const res = await safeFetch(endpoint, { headers: enrichHeaders() });
    if (!res.ok) {
      error('Discord', `HTTP ${res.status} for ${discordInvite} (${endpoint})`);
      return null;
    }
    return await res.json();
  } catch (err) {
    error('Discord', `Network error for ${discordInvite}: ${err}`);
    return null;
  }
};

export interface DiscordInfo {
  inviteCode: string;
  name: string;
  memberCount: number;
  memberOnlineCount: number;
  channel: string;
  icon: string;
  banner: string;
  inviter: string | null;
}
