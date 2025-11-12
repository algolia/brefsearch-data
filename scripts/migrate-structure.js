#!/usr/bin/env node
/**
 * Migration script: old structure → new structure
 *
 * Old:
 * data/source/episodes/*.json
 * data/source/subtitles/*.vtt
 * data/source/popularity/*.json
 * data/generated/*.json
 *
 * New:
 * data/input/{episode}/metadata.json
 * data/input/{episode}/subtitle.vtt
 * data/external/{episode}/popularity.json
 * data/output/{episode}/episode.json
 */

import { absolute, exists, glob, mkdirp, move, readJson } from 'firost';
import { _, pMap } from 'golgoth';
import path from 'node:path';

const gitRoot = absolute('<gitRoot>');

async function migrate() {
  console.log('🔄 Starting migration to new structure...\n');

  // 1. Create new directory structure
  console.log('📁 Creating new directories...');
  await mkdirp(absolute(gitRoot, 'data/input'));
  await mkdirp(absolute(gitRoot, 'data/external'));
  await mkdirp(absolute(gitRoot, 'data/output'));
  console.log('✅ New directories created\n');

  // 2. Get all episodes from source/episodes
  const episodeFiles = await glob('data/source/episodes/*.json', { cwd: gitRoot });
  console.log(`📊 Found ${episodeFiles.length} episodes to migrate\n');

  await pMap(
    episodeFiles,
    async (episodeFile) => {
      const episode = await readJson(episodeFile);
      const basename = path.basename(episodeFile, '.json'); // e.g., S01E01_brefJaiDragueCetteFille

      console.log(`  Migrating ${basename}...`);

      // Create episode directory in each layer
      const inputDir = absolute(gitRoot, `data/input/${basename}`);
      const externalDir = absolute(gitRoot, `data/external/${basename}`);
      const outputDir = absolute(gitRoot, `data/output/${basename}`);

      await mkdirp(inputDir);
      await mkdirp(externalDir);
      await mkdirp(outputDir);

      // Move metadata.json
      const oldMetadata = absolute(gitRoot, `data/source/episodes/${basename}.json`);
      const newMetadata = absolute(inputDir, 'metadata.json');
      if (await exists(oldMetadata)) {
        await move(oldMetadata, newMetadata);
      }

      // Move subtitle.vtt
      const oldSubtitle = absolute(gitRoot, `data/source/subtitles/${basename}.vtt`);
      const newSubtitle = absolute(inputDir, 'subtitle.vtt');
      if (await exists(oldSubtitle)) {
        await move(oldSubtitle, newSubtitle);
      }

      // Move popularity.json (if exists)
      const oldPopularity = absolute(gitRoot, `data/source/popularity/${basename}.json`);
      const newPopularity = absolute(externalDir, 'popularity.json');
      if (await exists(oldPopularity)) {
        await move(oldPopularity, newPopularity);
      }

      // Move generated episode.json
      const oldGenerated = absolute(gitRoot, `data/generated/${basename}.json`);
      const newGenerated = absolute(outputDir, 'episode.json');
      if (await exists(oldGenerated)) {
        await move(oldGenerated, newGenerated);
      }

      console.log(`  ✅ ${basename} migrated`);
    },
    { concurrency: 5 }
  );

  console.log('\n🎉 Migration completed!');
  console.log('\n📝 Next steps:');
  console.log('  1. Verify migration: ls -la data/input/');
  console.log('  2. Remove old directories: rm -rf data/source data/generated');
  console.log('  3. Handle images symlink separately (points to brefsearch-images)');
}

migrate().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
