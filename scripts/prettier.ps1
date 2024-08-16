# Determine the containing directory of this script
$currentPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$parentPath = Split-Path -Parent $currentPath

$webPath = Join-Path -Path $parentPath -ChildPath `web`

npx.ps1 --prefix $webPath prettier --write .

Set-Location $parentPath && ruff.exe format 