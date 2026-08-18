import { supabase } from '../src/config/supabase.js';
import { getAllApps } from '../src/services/steam.js';

const BATCH_SIZE = 500;

function slugify(name, appid) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${base}-${appid}`;
}

function toTimestamptz(unix) {
  return unix ? new Date(unix * 1000).toISOString() : null;
}

async function getExistingSteamIds() {
  const ids = new Set();
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('game_sources')
      .select('source_id')
      .eq('source', 'steam')
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (data.length === 0) break;

    for (const row of data) {
      ids.add(row.source_id);
    }

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return ids;
}

async function insertBatch(apps) {
  for (let i = 0; i < apps.length; i += BATCH_SIZE) {
    const chunk = apps.slice(i, i + BATCH_SIZE);

    const gameRows = chunk.map((app) => ({
      slug: slugify(app.name, app.appid),
      name: app.name,
      type: 'game',
    }));

    const { data: insertedGames, error: gamesError } = await supabase
      .from('games')
      .insert(gameRows)
      .select('id, slug');

    if (gamesError) {
      console.error(`  Games insert error at offset ${i}:`, gamesError.message);
      throw gamesError;
    }

    const slugToId = new Map(insertedGames.map((g) => [g.slug, g.id]));

    const sourceRows = chunk.map((app) => ({
      game_id: slugToId.get(slugify(app.name, app.appid)),
      source: 'steam',
      source_id: String(app.appid),
      last_modified: toTimestamptz(app.last_modified),
    }));

    const { error: sourcesError } = await supabase
      .from('game_sources')
      .insert(sourceRows);

    if (sourcesError) {
      console.error(`  Sources insert error at offset ${i}:`, sourcesError.message);
      throw sourcesError;
    }
  }
}

console.log('Loading existing Steam entries...');
const existing = await getExistingSteamIds();
console.log(`Found ${existing.size} games already in database.\n`);

console.log('Fetching game catalogue from Steam...\n');

let inserted = 0;
let skipped = 0;

const total = await getAllApps(async (apps, totalSoFar) => {
  const newApps = apps.filter((app) => !existing.has(String(app.appid)));
  skipped += apps.length - newApps.length;

  console.log(`Fetched ${totalSoFar} from Steam — ${newApps.length} new, ${apps.length - newApps.length} already exist`);

  if (newApps.length > 0) {
    await insertBatch(newApps);
    inserted += newApps.length;
  }
});

console.log(`\nDone. ${inserted} games inserted, ${skipped} skipped (already existed). ${total} total from Steam.`);
