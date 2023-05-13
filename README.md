
# P2P file sharing

Available here: https://share.seiber.ch/

### How to

dev

```bash
npm run dev
```

deploy

```bash
docker build -t hermes .
docker run -d --restart unless-stopped -p 21001:21001 --name hermes hermes
```
