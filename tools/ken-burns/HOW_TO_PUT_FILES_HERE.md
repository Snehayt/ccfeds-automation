# How to put your video and images in `input` (Windows)

## If Cursor says “Unable to open `input`” / “Unable to resolve resource”

That usually happens when you **click a path or link inside chat**. Cursor is not File Explorer — those links are often broken. **Ignore that dialog.**

You are **not** pasting into Cursor’s chat. You copy files on disk like any other folder.

---

## Easiest: File Explorer

1. Press **Win + E** to open **File Explorer**.
2. Click the address bar, paste this path, press **Enter**:

   `C:\Users\syt\cc-feds\ccfeds-automation\tools\ken-burns\input`

3. Copy your files from wherever they are (**Ctrl+C**).
4. Click inside that `input` folder window and **Ctrl+V** to paste.

Rename if needed to match `local-render.ps1`:

- `video.mp4`
- `slide-01.png`, `slide-02.png`, `slide-03.png`

(Or edit the names at the top of `local-render.ps1`.)

---

## From Cursor’s sidebar

1. In the left **Explorer** tree, open **`ccfeds-automation`** → **`tools`** → **`ken-burns`** → **`input`**.
2. **Right‑click** the **`input`** folder → **Reveal in File Explorer**.
3. In the Explorer window that opens, **Ctrl+V** your files.

---

## Then render

In **PowerShell** (Terminal in Cursor is fine):

```powershell
cd C:\Users\syt\cc-feds\ccfeds-automation\tools\ken-burns
.\local-render.ps1
```

Output: `output\montage.mp4`
