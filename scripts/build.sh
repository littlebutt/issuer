current_path=$(dirname $(pwd))
web_path=$current_path"/issuer/web"

npm --prefix $web_path run build
