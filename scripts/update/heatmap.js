/**
 * Fetch heatmap data from YouTube via yt-dlp and save to computed/
 * Returns empty heatmap for age-restricted videos
 */
import { absolute, spinner, writeJson } from 'firost';
import { forEachEpisode, getBasename } from '../../lib/helper.js';
import { buildImage } from '../../lib/docker.js';
import { getHeatmap } from '../../lib/ytdlp.js';

await buildImage();

const computedFolder = absolute('<gitRoot>/data/computed');

const progress = spinner();
await forEachEpisode(async function (episode) {
  progress.tick(`Fetching heatmap for "${episode.name}"`);

  const heatmap = await getHeatmap(episode.id);

  // Save to file (even if empty)
  const basename = getBasename(episode);
  const outputFilepath = absolute(`${computedFolder}/${basename}/heatmap.json`);
  await writeJson({ heatmap }, outputFilepath, { sort: false });
});

progress.success('Heatmaps updated for episode(s)');
