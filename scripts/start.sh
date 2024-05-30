current_path=$(dirname $(pwd))
main_path=$current_path"/app"
uvicorn --app-dir $main_path "main:app"
