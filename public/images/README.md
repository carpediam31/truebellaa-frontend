# Images Folder — TrueBellaa

Every image on the site is loaded from this folder instead of an external
site. To change any picture, just replace the file that has the matching
name below — keep the same filename and roughly the same aspect ratio, and
the layout won't break.

| Filename                  | Used for                          | Recommended size (W x H) |
|----------------------------|------------------------------------|---------------------------|
| `hero-banner.jpg`          | Homepage hero background           | 1600 x 1000 (landscape)   |
| `category-chains.jpg`      | "Chains" category card             | 800 x 1067 (3:4 portrait) |
| `category-pendants.jpg`    | "Pendants" category card           | 800 x 1067 (3:4 portrait) |
| `category-bracelets.jpg`   | "Bracelets" category card          | 800 x 1067 (3:4 portrait) |
| `craft-story.jpg`          | "The craft" editorial section      | 1000 x 1250 (4:5 portrait)|
| `reel-1.jpg`                | Video reel 1 (@styled.by.aria)     | 600 x 1067 (9:16 portrait)|
| `reel-2.jpg`                | Video reel 2 (@dailygold)          | 600 x 1067 (9:16 portrait)|
| `reel-3.jpg`                | Video reel 3 (@layered.look)       | 600 x 1067 (9:16 portrait)|
| `reel-4.jpg`                | Video reel 4 (@mens.edit)          | 600 x 1067 (9:16 portrait)|

## Product images (chains, pendants, bracelets, etc.)

Individual product photos live in `public/images/products/` — see the
README in that folder for the exact filenames each product expects.

## Notes

- Keep filenames lowercase, no spaces (use hyphens) — this matches what's
  already wired up in the code.
- JPG or WebP both work fine; if you switch formats, just update the file
  extension referenced in the relevant component.
- This is a Vite project, so anything in `public/` is served from the site
  root — `public/images/hero-banner.jpg` becomes `/images/hero-banner.jpg`
  in the browser, which is exactly what the components reference.
