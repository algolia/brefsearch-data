# brefsearch-data

Data processing scripts for the [brefsearch](https://github.com/pixelastic/brefsearch) project.

This repository contains all the scripts and tools needed to extract subtitles from YouTube videos, generate thumbnails and animated previews, and push the data to Algolia for search indexing.

## Installation

```bash
yarn install
```

## Data Structure

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



## Data Pipeline

### Sources

Files in `./data/source/` are the source of truth from which the whole data will be re-generated when running `yarn run data:generate`

- `./data/source/episodes` contains the episode metadata (title, index, YouTube Id). I don't expect this to change, ever.
- `./data/source/subtitles` are subtitle files (in `.vtt`) format for all episodes. You're encouraged to update those files if you spot any typos.
- `./data/source/popularity` contains files with popularity metrics (view count and most replayed heatmap) for each episode. That changes overtime, and should be updated regularly through `yarn run data:update-popularity`
- `./data/source/images` is a symlink to the [brefsearch-images](https://github.com/pixelastic/brefsearch-images) repository, expected to be a sibling of this repo. It contains all the static thumbnails and animated previews used in the front-end. Its content should be regenerated with `yarn run data:update-images` whenever a timing is updated in the subtitles)

### Generated

The files located in `./data/source/generated` are snapshots of the data at any given time. Those files are generated from the various sources. You should not manually edit those files as any change will be overwritten by a call to `yarn run data:generate`.

### Pushed

- Running `yarn run data:push-algolia` will parse all files in `./data/generated` and generate an array of records following the data structure documented above, and push them to an Algolia index.
- Running `yarn run data:push-images` will push all images to a private server so they can be served by the front-end UI

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
- [brefsearch-images](https://github.com/pixelastic/brefsearch-images) - Media assets repository

## License

MIT
