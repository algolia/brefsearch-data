/**
 * Reads input and computed data, merges them, and creates episode.json files in
 * output/
 */
import { absolute, readJson, writeJson } from 'firost';
import { _ } from 'golgoth';
import {
  forEachEpisode,
  getBasename,
  getPopularityPath,
  getSubtitlePath,
} from '../../lib/helper.js';
import { convertVtt } from '../../lib/convertVtt.js';
import { setMostReplayedScore } from '../../lib/setMostReplayedScore.js';

await forEachEpisode(async (episode) => {
  const basename = getBasename(episode);

  const data = {};

  // Add .episode key
  data.episode = {
    ...episode,
    basename,
  };

  // Popularity
  const popularityPath = await getPopularityPath(basename);
  const { viewCount, heatmap } = await readJson(popularityPath);
  data.episode.viewCount = viewCount;

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
