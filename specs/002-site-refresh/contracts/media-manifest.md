# Contract: `manifest.json` (private media bucket root)

Produced once by `scripts/migrate_family_media.py` (digital_twin repo); read
by the family API on gallery/video requests. Never served to clients directly
— the API translates object keys into signed URLs.

```json
{
  "generated_at": "2026-06-11T00:00:00Z",
  "source": "thorondor MySQL dump (2006-12) + filesystem walk",
  "galleries": [
    {
      "name": "amsterdam",
      "title": "Amsterdam",
      "description": "…",
      "order": 3,
      "items": [
        {
          "caption": "Canal at dusk",
          "thumb": "galleries/amsterdam/thumbs/dsc0042.gif",
          "full": "galleries/amsterdam/full/dsc0042.jpg"
        },
        {
          "caption": null,
          "thumb": "galleries/amsterdam/full/dsc0099.jpg",
          "full": "galleries/amsterdam/full/dsc0099.jpg"
        }
      ]
    }
  ],
  "videos": [
    {
      "title": "Mt. Harvard summit",
      "description": "…",
      "date": "2003-08-09",
      "video": "videos/mt_harvard.mp4",
      "poster": "videos/mt_harvard.jpg"
    }
  ]
}
```

## Rules

- `galleries` is sorted by `order`; contains **active galleries only**
  (inactive ones are never migrated) — expected count: 21.
- `items` preserve dump ordering; filesystem-orphan photos (no dump row) are
  appended at the end of their gallery with `caption: null`.
- A photo whose thumbnail file was never found uses its `full` key for
  `thumb` (FE scales via CSS) — see second item above.
- `videos`: expected count 28; `title` has size suffixes (e.g. "(5mb)")
  stripped; `date`/`description` may be `null`.
- All `thumb`/`full`/`video`/`poster` values are object keys relative to the
  bucket root and MUST exist as objects in the bucket (the migration script
  verifies before writing the manifest).
- The dump file itself and any raw dump-derived intermediate are **never**
  committed or uploaded; only this manifest carries the metadata.
