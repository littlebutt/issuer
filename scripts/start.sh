current_path=$(dirname $(pwd))
main_path=$current_path"/issuer"
uvicorn --app-dir $main_path "main:app"
