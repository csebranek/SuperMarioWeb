# Super Mario Web — Build & Deploy

Very short steps to build and deploy to an Apache site at `/super-mario`.

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
