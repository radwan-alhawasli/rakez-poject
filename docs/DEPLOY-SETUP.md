# Deploy setup (step by step)

## How it works now

- **Build** runs on GitHub Actions (fast, no OOM).
- Only the **built files** (`dist/`) are uploaded to your server.
- The server does **not** run Node, npm, or the build.

---

## Step 1: GitHub secrets

In your repo: **Settings → Secrets and variables → Actions** → New repository secret.

Add:

| Name             | Value                    |
|------------------|--------------------------|
| `REMOTE_HOST`    | Your server IP or domain |
| `REMOTE_USER`    | SSH user (e.g. `root`)   |
| `SSH_PRIVATE_KEY`| Full contents of your SSH private key |
| `REMOTE_PORT`    | (optional) SSH port, default `22`     |

---

## Step 2: One-time server setup

SSH into the server and run:

### 2.1 Create directory

```bash
sudo mkdir -p /var/www/rakez-poject
sudo chown $USER:$USER /var/www/rakez-poject
```

### 2.2 Point your web server to `dist/`

**If you use Nginx**, add or edit a server block:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/rakez-poject/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**If you use Apache**, set `DocumentRoot` to `/var/www/rakez-poject/dist` and enable `mod_rewrite` / fallback to `index.html` for SPA routing.

---

## Step 3: Deploy

- Push to the `master` branch → workflow runs and deploys.
- Or: **Actions** tab → **Deploy to Production** → **Run workflow**.

---

## Summary

1. Add GitHub secrets (host, user, SSH key, optional port).
2. On server: create `/var/www/rakez-poject` and point the web server root to `/var/www/rakez-poject/dist`.
3. Push to `master` (or run the workflow manually).

No Node or npm needed on the server.
