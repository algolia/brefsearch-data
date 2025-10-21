import path from 'node:path';
import { absolute, exists, glob, mkdirp, readJson, run, spinner } from 'firost';
import { _, pMap } from 'golgoth';

const episodes = await glob('*.json', {
  cwd: absolute('<gitRoot>/data/episodes'),
});

/**
 * Read through all the episode metadata, and their lines. For each line,
 * extract a thumbnail from the video at that exact timestamp
 **/
const progress = spinner();
const concurrency = 4;
await pMap(
  episodes,
  async (episodePath) => {
    const episode = await readJson(episodePath);
    const basename = path.basename(episodePath, '.json');
    const videoPath = absolute(`<gitRoot>/tmp/mp4/${basename}.mp4`);
    const lines = episode.lines;
    const lineCount = lines.length;
    progress.tick(`Thumbnails: ${episode.episode.name}`);

    await pMap(
      lines,
      async (line, lineIndex) => {
        const timestamp = line.start;
        const paddedIndex = _.padStart(timestamp, 3, '0');
        const thumbnailPath = absolute(
          `<gitRoot>/../brefsearch-images/thumbnails/${basename}/${paddedIndex}.png`,
        );
        if (await exists(thumbnailPath)) {
          return;
        }
        await mkdirp(path.dirname(thumbnailPath));

        progress.tick(
          `Thumbnails: ${episode.episode.name} [${lineIndex}/${lineCount}]`,
        );

        // Extract thumbnail
        const extractCommand = [
          'ffmpeg',
          '-y -loglevel error',
          `-ss "${timestamp}"`,
          `-i "${videoPath}"`,
          '-vframes 1',
          '-q:v 2',
          `"${thumbnailPath}"`,
        ].join(' ');
        await run(extractCommand, { shell: true });

        // Compress thumbnail
        // const compressCommand = ['imgmin', `"${thumbnailPath}"`].join(' ');
        // await run(compressCommand, { shell: true });
      },
      { concurrency },
    );
  },
  { concurrency },
);
progress.success('All thumbnails generated');
