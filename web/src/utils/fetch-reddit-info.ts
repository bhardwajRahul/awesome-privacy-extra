import { error } from './logger';
import { safeFetch } from './safe-fetch';
import { apiBase, enrichHeaders } from './api-config';

export const fetchRedditInfo = async (
  subreddit: string,
): Promise<RedditData | null> => {
  const endpoint = `${apiBase}/v1/enrich/reddit/${subreddit}`;
  try {
    const res = await safeFetch(endpoint, { headers: enrichHeaders() });
    if (!res.ok) {
      error('Reddit', `HTTP ${res.status} for r/${subreddit} (${endpoint})`);
      return null;
    }
    return await res.json();
  } catch (err) {
    error('Reddit', `Network error for r/${subreddit}: ${err}`);
    return null;
  }
};

interface SubredditInfo {
  name: string | null;
  title: string | null;
  description: string | null;
  longDescription: string | null;
  icon: string | null;
  banner: string | null;
  color: string | null;
  subscribers: number | null;
  activeSubscribers: number | null;
  dateCreated: number | null;
  descriptionHtml: string | null;
}

interface Post {
  title: string;
  body: string;
  upVotes: number;
  downVotes: number;
  date: number;
  url: string;
}

export interface RedditData {
  info: SubredditInfo;
  posts: Post[];
}
