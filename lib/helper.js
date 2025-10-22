import { _ } from 'golgoth';

/**
 * Returns a slug identifying the episode, with padded index
 *
 * @param {object} data - The input data object.
 * @param {string} data.slug - The slug to include in the basename.
 * @param {number|string} data.index - The index to pad and include in the basename.
 * @returns {string} The formatted basename string.
 */
export function getBasename(data) {
  const { slug, index } = data;
  const paddedIndex = _.padStart(index, 2, '0');
  return `${paddedIndex}_${slug}`;
}
