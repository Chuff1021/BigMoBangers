# Fireworks Supermarket Catalog Sync

Goal: mirror the public Fireworks Supermarket product catalog for storefront browsing without storing video files locally.

## Source of truth

- Product data comes from the public WooCommerce Store API:
  `https://fireworkssupermarket.com/wp-json/wc/store/v1/products`
- Product videos are not exposed in that API. The sync script visits each product page and extracts the real video embed URL.
- Videos stay hosted remotely by the source provider, usually Vimeo. The app stores only the URL, then embeds it on the product detail page.

## Sync catalog CSV

```bash
pnpm sync:fireworks-supermarket
```

Current verified source count on 2026-06-17:

- 772 public products
- 525 products with remote video URLs

The script writes:

```text
packages/db/fireworks-supermarket-catalog.csv
```

Useful options:

```bash
pnpm sync:fireworks-supermarket -- --concurrency=4
pnpm sync:fireworks-supermarket -- --skip-videos
pnpm sync:fireworks-supermarket -- --default-qty=999
pnpm sync:fireworks-supermarket -- --output=/tmp/fireworks-supermarket.csv
```

## Import into Big MO's catalog

The import is a real database write. It upserts by `sku:fwsm-{sourceProductId}` and falls back to product name.

```bash
pnpm import:catalog packages/db/fireworks-supermarket-catalog.csv --tenant bigmos
```

Important: the generated CSV includes `qty`, and the importer updates inventory quantities. Use the default `999` only when the goal is a broad showcase catalog rather than exact live inventory.

## Video playback

The storefront supports:

- Vimeo embeds, e.g. `https://player.vimeo.com/video/1178608540`
- YouTube embeds, e.g. `https://www.youtube.com/watch?v=...`
- Direct MP4 URLs, streamed remotely with browser controls

Do not download or commit product videos. Keep videos as remote URLs.
