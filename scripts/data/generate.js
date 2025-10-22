/**
 * Reads source data files, merge them, and create the generated files
 **/
import { absolute, exists, firostError, readJson, writeJson } from 'firost';
import { forEachEpisode, getBasename } from '../../lib/helper.js';
import { convertVtt } from '../../lib/convertVtt.js';

await forEachEpisode(async function (episode) {
  const basename = getBasename(episode);
  const outputFilepath = absolute(`<gitRoot>/data/generated/${basename}.json`);

  // Subtitles
  const subtitlePath = absolute(
    `<gitRoot>/data/source/subtitles/${basename}.vtt`,
  );
  if (!(await exists(subtitlePath))) {
    throw firostError(
      'GENERATE_NO_SUBTITLES',
      `Subtitle file not found: ${subtitlePath}`,
    );
  }
  const subtitles = await convertVtt(subtitlePath);

  // Popularity
  const popularityPath = absolute(
    `<gitRoot>/data/source/popularity/${basename}.json`,
  );
  if (!(await exists(popularityPath))) {
    throw firostError(
      'GENERATE_NO_POPULARITY',
      `Popularity file not found: ${popularityPath}`,
    );
  }
  const popularity = await readJson(popularityPath);
  episode.viewCount = popularity.viewCount;

  const data = {
    episode,
    subtitles,
  };
  console.log(data);
  await writeJson(data, outputFilepath);
});
