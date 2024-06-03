# Determine the containing directory of this script
$currentPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$parentPath = Split-Path -Parent $currentPath

uvicorn --app-dir $parentPath "issuer.main:app"