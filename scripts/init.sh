current_path=$(dirname $(pwd))
web_path=$current_path"/issuer/web"

npm --prefix $web_path install

requirements_file=$current_path"/issuer/requirements.txt"

python3 -m venv $current_path"/issuer/venv"

source $current_path"/issuer/venv/bin/activate"

python3 -m pip install -r $requirements_file