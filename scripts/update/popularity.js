/**
 * Fetch latest popularity metrics from YouTube and save to external/
 * Uses yt-dlp via Docker to retrieve view counts and heatmaps
 */
import { absolute, spinner, writeJson } from 'firost';
import { forEachEpisode, getBasename } from '../../lib/helper.js';
import { buildImage } from '../../lib/docker.js';
import { getPopularity } from '../../lib/ytdlp.js';

await buildImage();

const popularityFolder = absolute('<gitRoot>/data/external');

const progress = spinner();
await forEachEpisode(async function (episode) {
  progress.tick(`Fetching popularity for "${episode.name}"`);

  // Fetch popularity data from YouTube
  const data = await getPopularity(episode.id);

  // Save to file
  const basename = getBasename(episode);
  const outputFilepath = absolute(
    `${popularityFolder}/${basename}/popularity.json`,
  );
  await writeJson(data, outputFilepath, { sort: false });
}, 1); // Concurrency 1 to process only first episode for testing

progress.success('Popularity updated for episode(s)');
