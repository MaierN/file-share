dev

```bash
npm run dev
```

deploy

```bash
docker build -t hermes .
docker run -d --restart unless-stopped -p 21001:21001 --name hermes hermes
```

TODO add "close" button
TODO avoid reconnect to already done connection
