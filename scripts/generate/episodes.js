/**
 * Reads input and computed data, merges them, and creates episode.json files in
 * output/
 * Usage: yarn run generate:episodes [metadata.json files...]
 */
import { exists, firostError, readJson, writeJson } from 'firost';
import { _ } from 'golgoth';
import { forEachEpisode } from '../../lib/helper.js';
import {
  getEpisodePath,
  getHeatmapPath,
  getMediaPath,
  getSubtitlePath,
  getViewcountPath,
} from '../../lib/paths.js';
import { getSubtitles } from '../../lib/subtitle.js';
import { addMostReplayedScores } from '../../lib/heatmap.js';

const files = process.argv.slice(2);

await forEachEpisode(
  async (episode) => {
    const data = {};

    // Add .episode key
    data.episode = {
      ...episode,
    };

    // View count (validate existence)
    const viewcountPath = getViewcountPath(episode);
    if (!(await exists(viewcountPath))) {
      throw firostError(
        'GENERATE_NO_VIEWCOUNT',
        `View count file not found: ${viewcountPath}`,
      );
    }
    const { viewCount } = await readJson(viewcountPath);
    data.episode.viewCount = viewCount;

    // Heatmap (validate existence)
    const heatmapPath = getHeatmapPath(episode);
    if (!(await exists(heatmapPath))) {
      throw firostError(
        'GENERATE_NO_HEATMAP',
        `Heatmap file not found: ${heatmapPath}`,
      );
    }
    const { heatmap } = await readJson(heatmapPath);

    // Get subtitles (validate existence)
    const subtitlePath = getSubtitlePath(episode);
    if (!(await exists(subtitlePath))) {
      throw firostError(
        'GENERATE_NO_SUBTITLES',
        `Subtitle file not found: ${subtitlePath}`,
      );
    }
    const rawSubtitles = await getSubtitles(episode);
    const subtitles = addMostReplayedScores(rawSubtitles, heatmap);

    // Add media to subtitles (validate existence)
    const mediaPath = getMediaPath(episode);
    if (!(await exists(mediaPath))) {
      throw firostError(
        'GENERATE_NO_MEDIA',
        `Media file not found: ${mediaPath}`,
      );
    }
    const media = await readJson(mediaPath);
    const subtitlesWithMedia = _.map(subtitles, (subtitle) => {
      const key = _.padStart(subtitle.start, 3, '0');
      return {
        ...subtitle,
        media: media[key],
      };
    });
    data.subtitles = subtitlesWithMedia;

    const outputFilepath = getEpisodePath(episode);
    await writeJson(data, outputFilepath);
  },
  { concurrency: 10, files },
);
