# Super Mario Web — Build & Deploy

Very short guide for running locally and deploying to an Apache site at `/super-mario`.

Local development

- Install and run the dev server (Vite). Opens at `http://localhost:5173` by default.

```bash
npm install
npm run dev
# open http://localhost:5173
```

- Preview the production build locally (build then preview):

```bash
npm install
npm run build
npm run preview
# open the printed preview URL (usually http://localhost:5173)
```

Production build & deploy

1. Install deps and build:

```bash
npm install
npm run build
```

2. Copy the produced `dist` to your Apache web root (example for Debian/Ubuntu):

```bash
sudo mkdir -p /var/www/html/super-mario
sudo cp -r dist/* /var/www/html/super-mario/
sudo chown -R www-data:www-data /var/www/html/super-mario
sudo systemctl restart apache2
```

If your server uses a different Apache user/group or service name (e.g. `apache` or `httpd`), adjust the `chown` and `systemctl` commands accordingly.

Notes:
- `vite.config.ts` is set to `base: './'` so built HTML uses relative asset paths (`./assets/...`). This avoids root-absolute `/assets/...` references and makes the site portable when deployed under different paths.
- If you prefer a fixed subpath (recommended when serving from `/super-mario/` specifically), set `base: '/super-mario/'` in `vite.config.ts` and rebuild.
- If you prefer not to place files under the document root, create an Apache `Alias` for `/super-mario` pointing to the deployed directory and allow access in the site config.

Troubleshooting:
- If you see 404s after a deploy, force a hard reload in the browser (Shift+Reload) or clear cache — browsers may have cached an older `index.html` with absolute paths.

Quick deploy & requirements:

- **Node**: this project requires Node >= 20.19.0 (or Node >= 22.12.0). Verify with:

```bash
node -v
npm -v
```

- Build and deploy using the included script `scripts/deploy.sh` (it copies `dist` to `/var/www/html/super-mario`):

```bash
npm install
npm run build
chmod +x scripts/deploy.sh   # make executable if needed
bash scripts/deploy.sh       # or ./scripts/deploy.sh
```

- The deploy script targets `/var/www/html/super-mario` by default — edit the script if your Apache document root or permissions differ.

After making code changes

- When you edit source files, rebuild the production bundle before deploying or running `npm run preview` so your changes are included in `dist/`:

```bash
npm run build
```
