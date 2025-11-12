#!/usr/bin/env node
/**
 * Docker helper to check and build the brefsearch-tools image
 * Usage: node scripts/docker/check.js
 */
import { isImageBuilt, buildImage } from '../../lib/docker.js';

const imageName = 'brefsearch-tools';

// First check
console.log(`Checking if Docker image '${imageName}' exists...`);
let exists = await isImageBuilt();

if (exists) {
  console.log(`✓ Image '${imageName}' exists`);
} else {
  console.log(`✗ Image '${imageName}' does not exist`);
}

// Build if needed
if (!exists) {
  console.log('\nBuilding Docker image...');
  await buildImage();
  console.log('Build complete\n');

  // Second check
  console.log('Verifying build...');
  exists = await isImageBuilt();

  if (exists) {
    console.log(`✓ Image '${imageName}' exists`);
  } else {
    console.log(`✗ Image '${imageName}' still does not exist`);
  }
}

if (exists) {
  console.log('\n✓ Docker infrastructure is ready');
} else {
  console.log('\n✗ Docker infrastructure failed to build');
  process.exit(1);
}
