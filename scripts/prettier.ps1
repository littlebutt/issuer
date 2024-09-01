# Determine the containing directory of this script
$currentPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$parentPath = Split-Path -Parent $currentPath

$webPath = Join-Path -Path $parentPath -ChildPath `web`

Write-Output "Format .tsx files"

npx.ps1 --prefix $webPath prettier --write . --log-level=warn

Write-Output "Format .py files"

Set-Location $parentPath && ruff.exe format