/**
 * Reads source data files, merge them, and create the generated files
 **/
import { absolute, writeJson } from 'firost';
import { forEachEpisode, getBasename } from '../../lib/helper.js';
import { convertVtt } from '../../lib/convertVtt.js';

await forEachEpisode(async function (episode) {
  const basename = getBasename(episode);
  const outputFilepath = absolute(`<gitRoot>/data/generated/${basename}.json`);

  // Subtitles
  const subtitlePath = absolute(
    `<gitRoot>/data/source/subtitles/${basename}.vtt`,
  );
  const subtitles = await convertVtt(subtitlePath);

  // Popularity

  const data = {
    episode,
    subtitles,
  };
  console.log(data);
  await writeJson(data, outputFilepath);
});
