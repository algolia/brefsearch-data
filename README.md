# brefsearch-data

Data processing scripts for the [brefsearch](https://github.com/pixelastic/brefsearch) project.

This repository contains all the scripts and tools needed to extract subtitles from YouTube videos, generate thumbnails and animated previews, and push the data to Algolia for search indexing.

## Record Structure

Structure of a single Algolia record (one record per subtitle line):

```json
{
  "episode": {
    "basename": "S01E65_brefJaiUnNouveauPote",
    "duration": "2:06",
    "id": "ZbGrzgcO68A",
    "index": 65,
    "name": "Bref. J'ai un nouveau pote.",
    "slug": "brefJaiUnNouveauPote",
    "viewCount": 9350261
  },
  "subtitle": {
    "content": "— Tu sais donc pas que c'est pas bien d'être raciste ?\n— Nom de Zeus, Marty !",
    "index": 13,
    "mostReplayedScore": 3,
    "start": 35
  },
  "media": {
    "height": 720,
    "lqip": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAA[…]XOfz/2JXQfoi2/FXAAAAAElFTkSuQmCC",
    "previewPath": "previews/S01E65_brefJaiUnNouveauPote/035.mp4",
    "thumbnailPath": "thumbnails/S01E65_brefJaiUnNouveauPote/035.png",
    "width": 1280
  }
}
```

## Data Structure

The data directory is organized in 4 layers following the data processing flow:

```
data/
├── input/                          # Manual source of truth
│   └── {episode}/                  # One directory per episode
│       ├── metadata.json           # Episode info (name, slug, YouTube ID, duration)
│       └── subtitle.vtt            # WebVTT subtitle file with dialogue timestamps
│
├── computed/                       # Computed data from external sources
│   └── {episode}/
│       ├── popularity.json         # View count and heatmap from YouTube API
│       ├── media.json              # Media metadata (dimensions, LQIP, paths)
│       ├── thumbnails/             # Symlink → ../brefsearch-media/media/{episode}/thumbnails/
│       └── previews/               # Symlink → ../brefsearch-media/media/{episode}/previews/
│
├── output/                         # Generated artifacts
│   └── {episode}/
│       └── episode.json            # Complete episode data ready for Algolia
│
└── tmp/                            # Temporary working files (not committed)
    └── {episode}/
        └── video.mp4               # Downloaded YouTube video for processing
```

**Episode naming convention:** `S01E{padded_index}_{slug}` (e.g., `S01E01_brefJaiDragueCetteFille`)



## Data Pipeline

### Prerequisites

- **Node.js** >= 22.16.0
- **Docker** (for yt-dlp and FFmpeg tools)
- **Yarn 4.6.0** (via Corepack)

### Setup (one-time)

```bash
# Download YouTube videos to tmp/ for FFmpeg processing
yarn setup:download-videos
```

### Update (weekly via cron)

```bash
# Fetch fresh popularity data from YouTube API
yarn update:popularity

# Regenerate episode JSON files with updated popularity
yarn generate:episodes

# Deploy to production
yarn deploy:algolia

# Commit and push changes
git add data/computed/ data/output/
git commit -m "chore: update popularity data"
git push
```

### Local Development (after editing subtitles or adding episodes)

```bash
# Update computed data
yarn update:media            # Generate thumbnails/previews + media.json
yarn update:popularity       # Fetch view counts (if needed)

# Generate final output
yarn generate:episodes       # Merge input + computed → output

# Deploy to production
yarn deploy:algolia          # Push records to Algolia index
yarn deploy:media            # Sync media assets to CDN
```

### Environment Variables

Different scripts require different credentials:

- **`yarn update:popularity`** (if using YouTube Data API): `YOUTUBE_API_KEY`
- **`yarn deploy:algolia`**: `ALGOLIA_APP_ID`, `ALGOLIA_API_KEY`
- **`yarn deploy:images`**: SSH access configured for rsync

Scripts validate their required environment variables and fail early with clear error messages if missing.

### Scripts Overview

| Command | Input | Output | External Tools | Description |
|---------|-------|--------|----------------|-------------|
| **Setup** | | | | |
| `setup:download-videos` | YouTube playlist | `tmp/{episode}/video.mp4` | yt-dlp (Docker) | Download source videos for FFmpeg processing |
| **Update** (writes to `computed/`) | | | | |
| `update:popularity` | YouTube API | `computed/{episode}/popularity.json` | yt-dlp (Docker) | Fetch view counts and heatmaps |
| `update:media` | `tmp/` + `input/` | `computed/{episode}/media.json` + images | FFmpeg (Docker) | Generate thumbnails/previews + metadata (dimensions, LQIP) |
| **Generate** (writes to `output/`) | | | | |
| `generate:episodes` | `input/` + `computed/` | `output/{episode}/episode.json` | Node.js | Merge all data into complete episode files |
| **Deploy** | | | | |
| `deploy:algolia` | `output/{episode}/episode.json` | Algolia index | Algolia API | Transform and push records to search index |
| `deploy:media` | `computed/{episode}/thumbnails/`, `previews/` | Remote CDN | rsync | Sync media assets to CDN |

**Note:** All scripts using yt-dlp or FFmpeg run through Docker wrappers automatically (no local installation required).

# Initial data dump

Before getting the repo in that state, I had to do a bit of manual processing. Below is a generic documentation of the process. I do not have scripts for you to redo the same thing automatically as it was a lot of manual one-off scripting.

I first "manually" downloaded the YouTube videos and audio files using `yt-dlp`:

```bash
# Download videos (for thumbnails/previews)
cd ./tmp/mp4 && yt-dlp "PLlFikkv2B2ffwYiFQJmcao3RKtw1DFMz5"

# Download audio only (for subtitle generation)
cd ./tmp/mp3 && yt-dlp --extract-audio "PLlFikkv2B2ffwYiFQJmcao3RKtw1DFMz5"
```

I named my files with the pattern Files are expected be named like: `S01E75_brefJaiToutCasse.mp3`

I uploaded my `.mp3` files to [HappyScribe](https://www.happyscribe.com) to generate `.vtt` subtitle files. I saved them in `data/source/subtitles/`. I proofread them all by watching the episodes with VLC and the subtitles.

## Related Repositories

- [brefsearch](https://github.com/pixelastic/brefsearch) - Frontend website (Next.js)
- [brefsearch-media](https://github.com/pixelastic/brefsearch-media) - Media assets repository (thumbnails + previews)

## License

MIT
