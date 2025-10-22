/**
 * Reads source data files, merge them, and create the generated files
 **/
import { absolute, readJson, writeJson } from 'firost';
import {
  forEachEpisode,
  getBasename,
  getPopularityPath,
  getSubtitlePath,
} from '../../lib/helper.js';
import { convertVtt } from '../../lib/convertVtt.js';
import { setMostReplayedScore } from '../../lib/setMostReplayedScore.js';

await forEachEpisode(async function (episode) {
  const basename = getBasename(episode);
  const outputFilepath = absolute(`<gitRoot>/data/generated/${basename}.json`);
  episode.basename = basename;

  // Popularity
  const popularityPath = await getPopularityPath(basename);
  const { viewCount, heatmap } = await readJson(popularityPath);
  episode.viewCount = viewCount;

  // Subtitles
  const subtitlePath = await getSubtitlePath(basename);
  const subtitles = await convertVtt(subtitlePath);
  const subtitlesWithPopularity = setMostReplayedScore(subtitles, heatmap);

  const data = {
    episode,
    subtitles: subtitlesWithPopularity,
  };
  // console.log(data);
  await writeJson(data, outputFilepath);
}, 10);
