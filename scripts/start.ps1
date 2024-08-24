# Determine the containing directory of this script
$currentPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$parentPath = Split-Path -Parent $currentPath
$issuerPath = Join-Path -Path $parentPath -ChildPath "issuer"
$mainPath = Join-Path -Path $issuerPath -ChildPath "main.py"

python.exe $mainPath