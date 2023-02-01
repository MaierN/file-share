dev

```bash
npm run dev
```

build

```bash
docker build -t hermes .
```

upload

```bash
docker save -o hermes.tar hermes
scp hermes.tar ...@...:workspace/
```

deploy

```bash
ssh ...@...
docker load -i workspace/hermes.tar
docker run -d --restart unless-stopped -p 21001:21001 --name hermes hermes
```
