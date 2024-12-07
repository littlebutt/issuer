FROM alpine:latest
RUN apk add --update --no-cache python3 node npm
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
COPY . /app/
WORKDIR /app
RUN cd ./web && npm install
RUN python3 -m pip install -r requirements.txt
RUN cd ./web && npm run build
EXPOSE 8000/tcp
CMD python3 ./issuer/main.py