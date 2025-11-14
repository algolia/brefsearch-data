/**
 * Fetch heatmap data from YouTube via yt-dlp and save to computed/
 * Returns empty heatmap for age-restricted videos
 */
import { writeJson } from 'firost';
import { forEachEpisode } from '../../lib/helper.js';
import { getHeatmapPath } from '../../lib/paths.js';
import { buildImage } from '../../lib/docker.js';
import { getHeatmap } from '../../lib/ytdlp.js';

await buildImage();

await forEachEpisode(async function (episode) {
  const heatmap = await getHeatmap(episode.id);
  const outputFilepath = getHeatmapPath(episode);
  await writeJson({ heatmap }, outputFilepath);
});
