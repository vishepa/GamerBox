import { env } from '../config/env.js';

export async function getAppList({ maxResults = 100, lastAppid } = {}) {
  const inputJson = {
    include_games: true,
    include_dlc: false,
    include_software: false,
    include_videos: false,
    include_hardware: false,
    max_results: maxResults,
  };

  if (lastAppid) {
    inputJson.last_appid = lastAppid;
  }

  const params = new URLSearchParams({
    key: env.steamApiKey,
    input_json: JSON.stringify(inputJson),
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

export async function getAllApps(onBatch) {
  let lastAppid;
  let totalFetched = 0;

  while (true) {
    const response = await getAppList({ maxResults: 25000, lastAppid });
    const apps = response.apps || [];

    if (apps.length === 0) break;

    totalFetched += apps.length;

    if (onBatch) {
      await onBatch(apps, totalFetched);
    }

    if (!response.have_more_results) break;
    lastAppid = response.last_appid;
  }

  return totalFetched;
}
