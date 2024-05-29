# Determine the containing directory of this script
$currentPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$parentPath = Split-Path -Parent $currentPath
$mainPath = Join-Path -Path $parentPath -ChildPath "app"

uvicorn --app-dir $mainPath "main:app"