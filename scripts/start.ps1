# Determine the containing directory of this script
$currentPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$parentPath = Split-Path -Parent $currentPath

uvicorn.exe --app-dir $parentPath "issuer.main:app"