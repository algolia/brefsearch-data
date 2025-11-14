/**
 * Fetch heatmap data from YouTube via yt-dlp and save to computed/
 * Returns empty heatmap for age-restricted videos
 * Usage: yarn run generate:heatmap [metadata.json files...]
 */
import { writeJson } from 'firost';
import { forEachEpisode } from '../../lib/helper.js';
import { getHeatmapPath } from '../../lib/paths.js';
import { buildImage } from '../../lib/docker.js';
import { getHeatmap } from '../../lib/ytdlp.js';

const files = process.argv.slice(2);

await buildImage();

await forEachEpisode(
  async function (episode) {
    const heatmap = await getHeatmap(episode.id);
    const outputFilepath = getHeatmapPath(episode);
    await writeJson({ heatmap }, outputFilepath, { sort: false });
  },
  { files },
);
