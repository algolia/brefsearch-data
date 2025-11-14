import { absolute, gitRoot } from 'firost';
import { _ } from 'golgoth';

const root = gitRoot();

/**
 * Returns a slug identifying the episode, with padded index
 */
export function getBasename(episode) {
  const { slug, index } = episode;
  const paddedIndex = _.padStart(index, 2, '0');
  return `S01E${paddedIndex}_${slug}`;
}

// data/input or data/input/{episode}
export function getInputDir(episode) {
  if (!episode) {
    return absolute(root, 'data/input');
  }
  return absolute(root, 'data/input', getBasename(episode));
}

// input/{episode}/subtitle.vtt
export function getSubtitlePath(episode) {
  return `${getInputDir(episode)}/subtitle.vtt`;
}

// input/{episode}/metadata.json
export function getMetadataPath(episode) {
  return `${getInputDir(episode)}/metadata.json`;
}

// computed/{episode}
export function getComputedDir(episode) {
  return absolute(root, 'data/computed', getBasename(episode));
}

// computed/{episode}/viewcount.json
export function getViewcountPath(episode) {
  return `${getComputedDir(episode)}/viewcount.json`;
}

// computed/{episode}/heatmap.json
export function getHeatmapPath(episode) {
  return `${getComputedDir(episode)}/heatmap.json`;
}

// computed/{episode}/media.json
export function getMediaPath(episode) {
  return `${getComputedDir(episode)}/media.json`;
}

// computed/{episode}/thumbnails
export function getThumbnailsDir(episode) {
  return `${getComputedDir(episode)}/thumbnails`;
}

// computed/{episode}/thumbnails/{timestamp}.png
export function getThumbnailPath(episode, timestamp) {
  const key = _.padStart(timestamp, 3, '0');
  return `${getThumbnailsDir(episode)}/${key}.png`;
}

// computed/{episode}/previews
export function getPreviewsDir(episode) {
  return `${getComputedDir(episode)}/previews`;
}

// computed/{episode}/previews/{timestamp}.mp4
export function getPreviewPath(episode, timestamp) {
  const key = _.padStart(timestamp, 3, '0');
  return `${getPreviewsDir(episode)}/${key}.mp4`;
}

// output/{episode}
export function getOutputDir(episode) {
  return absolute(root, 'data/output', getBasename(episode));
}

// output/{episode}/episode.json
export function getEpisodePath(episode) {
  return `${getOutputDir(episode)}/episode.json`;
}

// tmp/{episode}
export function getTmpDir(episode) {
  return absolute(root, 'data/tmp', getBasename(episode));
}

// tmp/{episode}/video.mp4
export function getVideoPath(episode) {
  return `${getTmpDir(episode)}/video.mp4`;
}

// ../brefsearch-media/media
export function getMediaRepoDir() {
  return absolute('<gitRoot>/../brefsearch-media/media');
}
