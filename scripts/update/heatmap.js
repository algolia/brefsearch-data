/**
 * Fetch heatmap data from YouTube via yt-dlp and save to computed/
 * Returns empty heatmap for age-restricted videos
 */
import { spinner, writeJson } from 'firost';
import { forEachEpisode } from '../../lib/helper.js';
import { getHeatmapPath } from '../../lib/paths.js';
import { buildImage } from '../../lib/docker.js';
import { getHeatmap } from '../../lib/ytdlp.js';

await buildImage();

const progress = spinner();
await forEachEpisode(async function (episode) {
  progress.tick(`Fetching heatmap for "${episode.name}"`);

  const heatmap = await getHeatmap(episode.id);

  const outputFilepath = getHeatmapPath(episode);
  await writeJson({ heatmap }, outputFilepath, { sort: false });
});

progress.success('Heatmaps updated for episode(s)');
