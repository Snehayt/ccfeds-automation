#requires -version 5.1
<#
  Run this from anywhere. All paths are under the ken-burns folder only.

  1. Put your video + 3 images in .\input\ (exact names optional — see below).
  2. Run: .\local-render.ps1
  3. Get: .\output\montage.mp4

  Requires FFmpeg on PATH (see README.md in this folder).
#>
$Here = $PSScriptRoot
$InputDir = Join-Path $Here "input"
$OutDir = Join-Path $Here "output"
$Output = Join-Path $OutDir "montage.mp4"

if (-not (Test-Path -LiteralPath $InputDir)) {
  throw "Missing folder: $InputDir"
}

# Prefer fixed names; otherwise pick the first video / first three images in input\
$Video = Join-Path $InputDir "video.mp4"
if (-not (Test-Path -LiteralPath $Video)) {
  $vidPick = Get-ChildItem -LiteralPath $InputDir -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -match '^\.(mp4|mov|webm|mkv|m4v)$' } |
    Sort-Object Name |
    Select-Object -First 1
  if (-not $vidPick) {
    throw "No video found in $InputDir — add video.mp4 or any .mp4 / .mov / .webm / .mkv file."
  }
  $Video = $vidPick.FullName
}

$Images = @(
  (Join-Path $InputDir "slide-01.png")
  (Join-Path $InputDir "slide-02.png")
  (Join-Path $InputDir "slide-03.png")
)
$allNamed = ($Images | ForEach-Object { Test-Path -LiteralPath $_ }) -notcontains $false
if (-not $allNamed) {
  $imgPick = Get-ChildItem -LiteralPath $InputDir -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -match '^\.(png|jpg|jpeg|webp)$' } |
    Sort-Object Name |
    Select-Object -First 3
  if ($imgPick.Count -lt 3) {
    throw "Need 3 images in $InputDir — found $($imgPick.Count). Add slide-01.png … slide-03.png or any three .png/.jpg/.webp files."
  }
  $Images = @($imgPick | ForEach-Object FullName)
}

if (-not (Test-Path -LiteralPath $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

Write-Host "Video:  $Video"
Write-Host "Images: $($Images -join "`n        ")"
Write-Host "Output: $Output"

& (Join-Path $Here "render-montage.ps1") -Video $Video -Images $Images -Output $Output
