#!/usr/bin/env node
/**
 * Reads input and external data, merges them, and creates episode.json files in output/
 * This script combines metadata + subtitles + popularity + media info
 */
import { absolute, readJson, writeJson } from 'firost';
import { pMap } from 'golgoth';
import {
  forEachEpisode,
  getBasename,
  getMediaData,
  getPopularityPath,
  getSubtitlePath,
} from '../../lib/helper.js';
import { convertVtt } from '../../lib/convertVtt.js';
import { setMostReplayedScore } from '../../lib/setMostReplayedScore.js';

await forEachEpisode(async function (episode) {
  const basename = getBasename(episode);
  const outputFilepath = absolute(`<gitRoot>/data/output/${basename}/episode.json`);
  episode.basename = basename;

  // Popularity
  const popularityPath = await getPopularityPath(basename);
  const { viewCount, heatmap } = await readJson(popularityPath);
  episode.viewCount = viewCount;

  // Subtitles
  const subtitlePath = await getSubtitlePath(basename);
  const subtitles = await convertVtt(subtitlePath);
  const subtitlesWithPopularity = setMostReplayedScore(subtitles, heatmap);

  // Media
  const subtitlesWithMedia = await pMap(
    subtitlesWithPopularity,
    async (subtitle) => {
      const media = await getMediaData(episode, subtitle);
      return {
        ...subtitle,
        media,
      };
    },
  );

  const data = {
    episode,
    subtitles: subtitlesWithMedia,
  };
  await writeJson(data, outputFilepath);
}, 10);
