
# P2P file sharing

Available here: https://share.maiern.ch/

### How to

dev

```bash
npm run dev
```

deploy

```bash
docker build -t file-share .
docker run -d --restart unless-stopped -p 21001:21001 --name file-share file-share
```
