# SONARBANGLA eDOKAN — EDGEONE MAKERS UPDATE

**Live site:** https://sonarbangla-edokan.edgeone.dev/  

## Package Contents

- `index.html` — eDokan page with a circular cursor, fading cursor trail, click ripple and size animation, and Scratch project thumbnails.
- `favicon.svg` — Bangladesh flag favicon.
- `edge-functions/api/scratch-search.js` — EdgeOne Makers Edge Function routed to `/api/scratch-search`.

## Deploy to the Existing Makers Project

1. Keep this ZIP as a backup and open the existing project's Settings page.
2. Check **Git Management**.
   - If a Git repository is connected, update that repository and push the changes. Do not use the direct-upload path for a Git-managed project.
3. If this is a direct-upload project, return to the project, open **Build & Deploy**, and click **New Deployment**.
4. Select **Production** to update the live site. **Preview** creates a test deployment only.
5. Upload the ZIP as a single file. Confirm that `index.html` is at the ZIP root, then start the deployment.
6. Once deployment succeeds, hard-refresh the live site with `Ctrl + Shift + R`.

## Verify the API Function

Open this URL in your browser:

https://sonarbangla-edokan.edgeone.dev/api/scratch-search?q=platformer

Interpret the result as follows:

- **JSON array:** The function is responding with search results.
- **404 error:** The deployed project or function routing may not have activated correctly.
- **JSON error:** The function ran, but the Scratch API query may have failed.

## Notes

- Creating this ZIP does **not** deploy the project. Upload or push the changes to the existing EdgeOne project.
- Direct Upload uses the EdgeOne Makers folder convention: `edge-functions/api/scratch-search.js`. The expected route is `/api/scratch-search`.
- Scratch thumbnails depend on public Scratch image endpoints being reachable.
- Scratch projects must be public and shared to be playable in TurboWarp.
- The CORS allowlist includes:
  - `https://sonarbangla-edokan.edgeone.dev`
  - `https://sonarbangla-bhor-os.edgeone.dev`
