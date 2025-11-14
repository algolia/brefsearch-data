import { _ } from 'golgoth';

/**
 * Assigns a "most replayed" score (1-5) to each subtitle based on heatmap data.
 *
 * For each subtitle, calculates an average heatmap value for all segments that
 * intersect with the subtitle, then divides all subtitles into 5 buckets of equal size,
 * assigning a score from 1 (least replayed) to 5 (most replayed).
 *
 * @param {Array<object>} subtitles - The array of subtitle objects to score.
 * @param {Array<number>} heatmap - The heatmap data representing replay counts.
 * @returns {Array<object>} The array of subtitle objects with added mostReplayedScore.
 */
export function addMostReplayedScores(subtitles, heatmap) {
  const bucketCount = 5;
  const bucketSize = Math.ceil(subtitles.length / bucketCount);

  return _.chain(subtitles)
    .map((subtitle) => ({
      ...subtitle,
      __heatValue: getHeatValue(heatmap, subtitle),
    }))
    .sortBy(['__heatValue', 'index'])
    .reverse()
    .chunk(bucketSize)
    .map((bucketSubtitles, bucketIndex) => {
      const mostReplayedScore = bucketCount - bucketIndex;
      return _.map(bucketSubtitles, (subtitle) => {
        const { index, start, content } = subtitle;
        return {
          content,
          start,
          index,
          mostReplayedScore,
        };
      });
    })
    .flatten()
    .sortBy('index')
    .value();
}

/**
 * Return a score between 1 and 100 for a given subtitle
 * @param {Array} heatmap Array of heatmap
 * @param {object} subtitle Subtitle object
 * @returns {number} Number between 1 and 100
 */
function getHeatValue(heatmap, subtitle) {
  const { start, stop } = subtitle;
  return (
    _.chain(heatmap)
      .filter((segment) => {
        const hasBeginning = start >= segment.start && start <= segment.end;
        const hasEnding = stop >= segment.start && stop <= segment.end;
        return hasBeginning || hasEnding;
      })
      .map('value')
      .mean()
      .round()
      .value() || 0
  );
}
