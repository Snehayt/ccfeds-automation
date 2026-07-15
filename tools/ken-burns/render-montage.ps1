#requires -version 5.1
<#
.SYNOPSIS
  Build one MP4 from a video + still images using FFmpeg (no screen recording).

.DESCRIPTION
  Encodes each asset to the same resolution and frame rate, then concatenates.
  Video fills the frame (crop edges if needed). Stills use scale-to-fit + centered letterbox, **no zoom**.

  Requires ffmpeg (and ffprobe) on PATH: https://ffmpeg.org/download.html

.EXAMPLE
  cd tools/ken-burns
  .\render-montage.ps1 -Video "C:\work\intro.mp4" -Images @("C:\work\a.png","C:\work\b.png","C:\work\c.png") -Output "C:\work\demo.mp4"

.EXAMPLE
  .\render-montage.ps1 -Video ".\clips\open.mp4" -Images ".\shots\ui1.png",".\shots\ui2.png" -Output ".\out\montage.mp4" -Width 2560 -Height 1440 -ImageSeconds 8 -Crf 16
#>
param(
  [Parameter(Mandatory, HelpMessage = "Video file (plays first in the output)")]
  [string] $Video,

  [Parameter(Mandatory, HelpMessage = "Still image paths, in order, after the video")]
  [string[]] $Images,

  [Parameter(Mandatory, HelpMessage = "Output .mp4 path")]
  [string] $Output,

  [int] $Width = 1920,
  [int] $Height = 1080,
  [int] $Fps = 30,
  [ValidateRange(0.5, 120)]
  [double] $ImageSeconds = 11,

  # Lower = higher quality / larger file (typical 14–22 for h264)
  [ValidateRange(10, 28)]
  [int] $Crf = 18,

  [switch] $KeepTemp
)

$ErrorActionPreference = "Stop"

function Assert-Tool([string]$name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "$name not found on PATH. Install FFmpeg (includes ffprobe) and reopen the terminal."
  }
}
Assert-Tool ffmpeg
Assert-Tool ffprobe

foreach ($p in @($Video) + $Images) {
  if (-not (Test-Path -LiteralPath $p)) { throw "File not found: $p" }
}

$outDir = Split-Path -Parent $Output
if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

function Test-MediaHasAudio([string] $path) {
  $out = & ffprobe -v error -select_streams a:0 -show_entries stream=index -of csv=p=0 $path 2>$null
  return ($null -ne $out -and $out.Trim().Length -gt 0)
}

function Invoke-FFmpeg([string[]] $ArgumentList) {
  & ffmpeg @ArgumentList
  if ($LASTEXITCODE -ne 0) {
    throw "ffmpeg failed (exit $LASTEXITCODE). Command: ffmpeg $($ArgumentList -join ' ')"
  }
}

$vfVideo = "scale=${Width}:${Height}:force_original_aspect_ratio=increase,crop=${Width}:${Height},format=yuv420p,setsar=1"
$vfImage = "scale=${Width}:${Height}:force_original_aspect_ratio=decrease,pad=${Width}:${Height}:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p,setsar=1"
$encVideo = @("-c:v", "libx264", "-preset", "medium", "-crf", "$Crf", "-pix_fmt", "yuv420p")
$encAudio = @("-c:a", "aac", "-b:a", "192k", "-ar", "48000")

$temp = Join-Path $env:TEMP ("ken-burns-render-" + [guid]::NewGuid().ToString("n"))
New-Item -ItemType Directory -Path $temp | Out-Null

$parts = @()
try {
  $p0 = Join-Path $temp "part-0000.mp4"
  if (Test-MediaHasAudio $Video) {
    Invoke-FFmpeg (@(
        "-y", "-i", $Video,
        "-vf", $vfVideo,
        "-r", "$Fps",
        "-map", "0:v:0", "-map", "0:a:0"
      ) + $encVideo + $encAudio + @("-movflags", "+faststart", $p0))
  }
  else {
    Invoke-FFmpeg (@(
        "-y",
        "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
        "-i", $Video,
        "-vf", $vfVideo,
        "-r", "$Fps",
        "-map", "1:v:0", "-map", "0:a:0",
        "-shortest"
      ) + $encVideo + $encAudio + @("-movflags", "+faststart", $p0))
  }
  $parts += $p0

  $idx = 1
  foreach ($img in $Images) {
    $pn = Join-Path $temp ("part-{0:D4}.mp4" -f $idx)
    Invoke-FFmpeg (@(
        "-y",
        "-loop", "1", "-framerate", "1", "-i", $img,
        "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
        "-vf", $vfImage,
        "-r", "$Fps",
        "-t", "$ImageSeconds",
        "-map", "0:v:0", "-map", "1:a:0",
        "-shortest"
      ) + $encVideo + $encAudio + @("-movflags", "+faststart", $pn))
    $parts += $pn
    $idx++
  }

  $listPath = Join-Path $temp "concat.txt"
  $lines = foreach ($f in $parts) {
    $escaped = ($f.Replace("\", "/")).Replace("'", "'\''")
    "file '$escaped'"
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllLines($listPath, $lines, $utf8NoBom)

  Invoke-FFmpeg (@(
      "-y", "-f", "concat", "-safe", "0", "-i", $listPath
    ) + $encVideo + $encAudio + @("-movflags", "+faststart", $Output))

  Write-Host "Done: $Output"
}
finally {
  if (-not $KeepTemp) {
    Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
  }
  else {
    Write-Host "Temp files kept at: $temp"
  }
}
