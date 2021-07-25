# How to Run

```bash
docker build -t bot-kkn --no-cache .
docker run --restart unless-stopped bot-kkn
```

To retain session and logs you could run with attached volume.

```bash
docker run -v /some/folder/tokens:/app/tokens -v /some/folder/logs:/app/logs --restart unless-stopped bot-kkn
```

After that you should log in with WA web using QR that is displayed in terminal.

Then close the console.
