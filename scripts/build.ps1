# Determine the containing directory of this script
$currentPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$parentPath = Split-Path -Parent $currentPath

$webPath = Join-Path -Path $parentPath -ChildPath `web`

npm.ps1 --prefix $webPath run build