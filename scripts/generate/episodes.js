/**
 * Reads input and computed data, merges them, and creates episode.json files in
 * output/
 */
import { absolute, readJson, spinner, writeJson } from 'firost';
import { _ } from 'golgoth';
import {
  forEachEpisode,
  getBasename,
  getHeatmapPath,
  getSubtitlePath,
  getViewCountPath,
} from '../../lib/helper.js';
import { convertVtt } from '../../lib/convertVtt.js';
import { setMostReplayedScore } from '../../lib/setMostReplayedScore.js';

const progress = spinner();
await forEachEpisode(async (episode) => {
  progress.tick(`Processing media for "${episode.name}"`);
  const basename = getBasename(episode);

  const data = {};

  // Add .episode key
  data.episode = {
    ...episode,
    basename,
  };

  // View count
  const viewCountPath = await getViewCountPath(basename);
  const { viewCount } = await readJson(viewCountPath);
  data.episode.viewCount = viewCount;

  // Heatmap
  const heatmapPath = await getHeatmapPath(basename);
  const { heatmap } = await readJson(heatmapPath);

  // Get subtitles
  const subtitlePath = await getSubtitlePath(basename);
  const rawSubtitles = await convertVtt(subtitlePath);
  const subtitles = setMostReplayedScore(rawSubtitles, heatmap);

  // Add media to subtitles
  const mediaPath = absolute('<gitRoot>/data/computed', basename, 'media.json');
  const media = await readJson(mediaPath);
  const subtitlesWithMedia = _.map(subtitles, (subtitle) => {
    const key = _.padStart(subtitle.start, 3, '0');
    return {
      ...subtitle,
      media: media[key],
    };
  });
  data.subtitles = subtitlesWithMedia;

  const outputFilepath = absolute(
    '<gitRoot>/data/output',
    basename,
    'episode.json',
  );

  await writeJson(data, outputFilepath);
}, 10);

progress.success('Media updated for all episodes');
