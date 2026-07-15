This folder is where you paste your media.

See **PASTE_FILES_HERE.txt** and **../HOW_TO_PUT_FILES_HERE.md**.

`local-render.ps1` picks:

- One video: **video.mp4** if present, else the first `.mp4` / `.mov` / `.webm` / `.mkv` (sorted by file name).
- Three images: **slide-01.png** … **slide-03.png** if all exist, else the first three `.png` / `.jpg` / `.webp` (sorted by file name). Rename with leading numbers to set order (e.g. `01_ui.png`, `02_ui.png`, `03_ui.png`).
