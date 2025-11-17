**Render.com Deployment**

This document explains how to deploy this frontend-only project to Render. It covers two common approaches:

- **Static Site**: simple, recommended for most cases (use Render's Static Site service).
- **Web Service (Node)**: optional, if you want to serve precompressed `.br`/`.gz` files yourself or need server logic.

**Prerequisites**

- A Render account (https://render.com) and your code pushed to GitHub/GitLab.
- The project builds to the `dist/` directory (this project uses `npm run build`).
- `package.json` already includes `build` and `preview` scripts.

1) Deploy as a Static Site (recommended)

- In the Render dashboard click **New** → **Static Site**.
- Connect your repository and choose the branch to deploy (e.g., `main`).
- Set the **Build Command** to:

  ```pwsh
  npm ci && npm run build
  ```

- Set the **Publish Directory** to:

  ```text
  dist
  ```

- (Optional) Set an Environment Variable `NODE_ENV=production` in the Render UI.
- Save and deploy. Render will install dependencies, run the build, and serve the contents of `dist/` as a static site.

Notes for Static Site:

- Most managed static hosts (including Render) automatically compress responses at the edge. Uploading precompressed `.br`/`.gz` files is usually not necessary for static site hosts.
- If you keep the `.br`/`.gz` files in `dist/`, they will be uploaded — but Render's static server will typically recompress on-the-fly. There is no guarantee Render will serve the precompressed file instead of compressing dynamically.

2) Deploy as a Node Web Service to serve precompressed files (optional)

Use this option if you specifically want to serve the precompressed `.br`/`.gz` files produced by `vite-plugin-compression` (for lower CPU at runtime or custom caching behavior).

- Add a small server file `server.js` (example below) and a `start` script in `package.json`.

  Example `server.js` (Express + express-static-gzip):

  ```js
  import express from 'express'
  import expressStaticGzip from 'express-static-gzip'

  const app = express()

  // Serve files from dist/, prefer brotli then gzip
  app.use('/', expressStaticGzip('dist', {
    enableBrotli: true,
    orderPreference: ['br', 'gz'],
    serveStatic: { maxAge: '1y' }
  }))

  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`Listening on ${port}`))
  ```

  - Add a `start` script in `package.json`:

  ```json
  "scripts": {
    "start": "node server.js",
    "build": "tsc -b && vite build",
    ...
  }
  ```

- On Render: click **New** → **Web Service**.
- Choose your repo and branch, set the **Environment** to `Node`.
- Set the **Build Command** to:

  ```pwsh
  npm ci && npm run build
  ```

- Set the **Start Command** to:

  ```pwsh
  npm start
  ```

- Render will build the app, then run your `server.js` which serves the `dist/` files including `.br`/`.gz`.

Notes for Web Service approach:

- You must include the `express` and `express-static-gzip` packages in your `dependencies` (not devDependencies) so Render installs them in production.

  ```pwsh
  npm install express express-static-gzip
  ```

- This approach consumes more runtime resources (a Node process) compared to the Static Site option, but gives you full control over how precompressed assets are served.

3) Quick verification after deploy

- Test response headers for an asset to confirm compression is used:

  ```bash
  # prefer brotli
  curl -H "Accept-Encoding: br" -I https://your-render-site.com/assets/index.js

  # or gzip
  curl -H "Accept-Encoding: gzip" -I https://your-render-site.com/assets/index.js
  ```

- Look for `Content-Encoding: br` or `Content-Encoding: gzip` in the response headers.

4) Tips & recommendations

- For a simple frontend-only site, use Render's **Static Site** service — easiest and cheapest.
- If you want to optimize bandwidth and avoid double compression at the edge, use a Web Service and `express-static-gzip` to serve precompressed files.
- Keep originals in `dist/` (we currently set `deleteOriginFile: false` in `vite.config.ts`) so clients that don't request compressed content can still get the assets.
- Use long `Cache-Control` for immutable assets (e.g., hashed filenames) and a small TTL for HTML to enable safe caching.

If you'd like, I can:
- Add the example `server.js` to the repo and a `start` script.
- Add a small `render.yaml` manifest for fully declarative Render configuration.

---

Generated: instructions to deploy `casino-lobby` to Render (static or Node web service).

**Uploading precompressed files to Amazon S3 (optional)**

If you host `lobby.json` (or other text assets) on S3, you can reduce bandwidth by uploading precompressed files and setting the correct `Content-Encoding` metadata. If you add a `lobby.json` to `public/`, `vite build` will copy it to `dist/` and `vite-plugin-compression` will generate `.gz` and `.br` versions. This repository keeps sample data in `src/data/lobby.sample.json` and does not include a production `lobby.json` in `public/` by default.

Example steps to upload `dist/lobby.json` and the precompressed variants to S3 using the AWS CLI (PowerShell):

```pwsh
# Ensure AWS CLI is configured (aws configure)
aws s3 cp dist/lobby.json s3://your-bucket/lobby.json --acl public-read --content-type application/json

# Upload gzip (set Content-Encoding: gzip)
aws s3 cp dist/lobby.json.gz s3://your-bucket/lobby.json --acl public-read --content-type application/json --content-encoding gzip

# Upload brotli (set Content-Encoding: br)
aws s3 cp dist/lobby.json.br s3://your-bucket/lobby.json --acl public-read --content-type application/json --content-encoding br
```

Notes:
- Uploading multiple objects to the same key (`lobby.json`) will overwrite the previous object. Choose the appropriate command depending on whether you want S3 to store the compressed object as the canonical object for that key.
- A safer approach is to upload the compressed file to the same key and ensure `Content-Encoding` is set — CloudFront or the client will then interpret the encoding correctly.
- If you use CloudFront in front of S3, configure CloudFront to forward `Accept-Encoding` to origin or serve precompressed objects. Alternatively, configure CloudFront to compress on-the-fly and prefer brotli when available.
- If you cannot set `Content-Encoding` on S3 objects, you can store precompressed files with different keys (e.g., `lobby.json.br`) and configure your CDN or origin to serve them when the client supports brotli.

Verification:

```pwsh
# Request brotli
curl -H "Accept-Encoding: br" -I https://your-bucket.s3.amazonaws.com/lobby.json

# Request gzip
curl -H "Accept-Encoding: gzip" -I https://your-bucket.s3.amazonaws.com/lobby.json
```

Look for `Content-Encoding: br` or `Content-Encoding: gzip` in the response headers.
