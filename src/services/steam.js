import { env } from '../config/env.js';

export async function getAppList({ maxResults = 100 } = {}) {
  const params = new URLSearchParams({
    key: env.steamApiKey,
    input_json: JSON.stringify({
      include_games: true,
      include_dlc: false,
      include_software: false,
      include_videos: false,
      include_hardware: false,
      max_results: maxResults,
    }),
  });

  const res = await fetch(
    `https://api.steampowered.com/IStoreService/GetAppList/v1/?${params}`,
  );

  if (!res.ok) {
    throw new Error(`Steam API returned ${res.status}`);
  }

  const { response } = await res.json();
  return response;
}
