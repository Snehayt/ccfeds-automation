# Ken Burns studio (images + video)

**Pasting files / “Unable to open input” in Cursor:** use Windows File Explorer or **Reveal in File Explorer** — see **`HOW_TO_PUT_FILES_HERE.md`** in this folder.

## Quick use

1. Open **`ken-burns-studio.html`** in **Chrome** or **Edge** (double-click the file, or drag it into a browser tab).
2. Click **Add images / video** (or drag files onto the dashed area).
3. Put **videos** first if you want the **6s cap** on the opening clip; add **images** after (default **4s** each via **Seconds per image**). Each **other** video plays until it ends, then the show continues.
4. Click **Play**. With **Vertical scroll (images)** on (default), **videos never drift**; the **first three images after the first video** in the list wait **1s** then pan; the **last three images** stay **static** (unless they’re in that opener trio). With scroll off, each **image** uses the **demo preset** when **Crisp UI** is off. Default **Seconds per image** is **4**. The **first video** in the playlist advances at **6s** if the file is longer than that.

**Motion:** **Videos** are **static** (no drift). By default they use **contain** like stills so the full frame is visible; **Fill frame** switches them to **cover**. The **first video** in the list is **capped at 6 seconds** (longer files advance early); shorter files play to the end. With **Vertical scroll** on, **images** follow the rules in step 4; slides **crossfade** with a touch of **brightness**; **stills** pan over **Seconds per image** (opener images get **+1s** on the timer). **Reduce motion** in the OS/browser disables pan.

**Stage layout:** Every slide is shown in the same **16:9 “card”** in the center (images and video scale inside it). Turn **Layered backdrop** off for a plain dark stage; when on, you get a **warm maroon mesh** and **soft overlapping color plates** behind the card (portfolio-style depth).

**Playlist row:** Under the buttons, a strip lists each clip in order (`1. filename.jpg`, …). Hover a chip for the full name if truncated. Click a chip to jump to that clip. The counter at the bottom-right also shows the current file name.

**Crisp UI + Fill frame:** By default stills and **video** use **`object-fit: contain`** so the **entire frame** fits (letterboxing if the aspect ratio does not match the stage). Turn on **Fill frame** when you want **images and video** **cropped edge-to-edge** (can clip titles like in a bad crop). **Crisp UI** still means no Ken Burns / drift zoom on stills when scroll is off. **Videos** follow the same contain/cover rules as stills.

**Record a demo:** **F11** (browser fullscreen), then **Win+Alt+R** to start/stop recording (Xbox Game Bar). Clips usually save under **`Videos\Captures`**. For a cleaner frame, hide the Windows taskbar before recording if you can. Use **Hide slide # / names on stage** (on by default) so the corner text (`1/4 · image · …`) and the filename strip under the toolbar are not in the capture.

**Sharpness:** Ken Burns zooms in on the image, so low-resolution photos will look soft — use the largest originals you have. If a **screen recording** of the slideshow looks blurry, increase capture quality (OBS output resolution / bitrate, or Game Bar settings) and run the browser **fullscreen** (`F11`).

## Export a real `.mp4` file (optional)

### Best quality (no screen capture): FFmpeg offline render

This avoids recording the monitor, so there is **no “second generation” blur** from Game Bar / OBS. You need **[FFmpeg](https://ffmpeg.org/download.html)** on your `PATH` (Windows: install *ffmpeg* build, unzip, add the `bin` folder to environment variables, then open a **new** terminal).

From PowerShell, run the helper script (video first, then images in order):

```powershell
cd C:\Users\syt\cc-feds\ccfeds-automation\tools\ken-burns
.\render-montage.ps1 `
  -Video "C:\path\to\your-clip.mp4" `
  -Images @("C:\path\to\slide1.png", "C:\path\to\slide2.png", "C:\path\to\slide3.png") `
  -Output "C:\path\to\demo-output.mp4"
```

**Everything under this folder only:** paste your video and images into **`tools/ken-burns/input\`** (see `input\PASTE_FILES_HERE.txt` for filenames). **Do not click folder links in chat** — use File Explorer or Cursor’s Explorer → right‑click `input` → **Reveal in File Explorer**; details in **`HOW_TO_PUT_FILES_HERE.md`**.

Then from `tools/ken-burns` run:

```powershell
.\local-render.ps1
```

That writes `output\montage.mp4` next to the scripts (no paths outside `ken-burns` unless you change `local-render.ps1`).

Optional knobs: `-Width 1920 -Height 1080` (default), `-Fps 30`, `-ImageSeconds 11`, `-Crf 18` (lower = sharper / larger file; try **16** for very clean UI text).

The script matches the **Crisp UI** idea: each still is **scaled to fit** with **centered** letterboxing, **no zoom**.

### Screen recording (quick but re-encodes the picture)

Recording in the browser is the fastest way to get a shareable video without installing FFmpeg:

- **Windows:** `Win + G` → Xbox Game Bar → Capture while the slideshow plays in fullscreen (`F11` on the browser window).
- **OBS Studio:** Window capture on the browser tab while **Play** runs.

### FFmpeg notes (manual)

If you prefer your own filter graph (Ken Burns `zoompan`, etc.), see [FFmpeg slideshow](https://trac.ffmpeg.org/wiki/Slideshow) patterns.

The HTML tool avoids needing FFmpeg for **preview** only.

## Adding your assets to the repo (optional)

If you want fixed slides checked into git, create `input/` next to this README and name files `slide-01.png`, … then we can wire a static `slideshow-static.html` — ask in Agent mode.
