param(
  [string]$BuildDir = "dist"
)

if (!(Test-Path $BuildDir)) {
  Write-Error "Build directory '$BuildDir' not found. Run npm run build first."
  exit 1
}

massa-web deploy $BuildDir