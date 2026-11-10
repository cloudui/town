# Switching echen.io to the town

## How it works today (checked 2026-11-10)

| Domain | Repo | How it's served |
| --- | --- | --- |
| `echen.io` | `cloudui/homepage` (Hugo) | GitHub Pages, `gh-pages` branch built by Actions; `static/CNAME` = `echen.io` |
| `blog.echen.io` | `cloudui/blogstack` (Hugo) | GitHub Pages, its own `gh-pages` branch and CNAME |
| `dev.echen.io` | `cloudui/blog` | GitHub Pages |
| `booboo.echen.io` | `cloudui/gf` | GitHub Pages |

DNS already points everything at GitHub: `echen.io` has the four GitHub Pages A records (185.199.108–111.153), and `www` / `blog` are CNAMEs to `cloudui.github.io`. On GitHub Pages each custom domain belongs to exactly one repo, so **the switch is a settings change on GitHub, with no DNS edits**. `blog.echen.io` lives in a different repo with its own domain, so it isn't touched.

## Proposal

Use a new repo (e.g. `cloudui/town`) deployed with the included Actions workflow. Keep `cloudui/homepage` as is, move it to `old.echen.io` so its pages stay reachable.

1. **Verify the domain** (if not done already): GitHub → Settings → Pages → Verified domains → add `echen.io`. This stops anyone else claiming it during the swap.
2. **Push this project** to `cloudui/town`. In that repo: Settings → Pages → Source: **GitHub Actions**. The first push to `main` builds it and it's live at `https://cloudui.github.io/town/`. The workflow reads the URL and base path from GitHub Pages, so it adapts when you add a custom domain (no code edits).
3. **Free the domain**: `cloudui/homepage` → Settings → Pages → Custom domain: clear `echen.io`, save. Also delete or change `static/CNAME`, or the next Hugo deploy will try to reclaim it.
4. **Claim it**: `cloudui/town` → Settings → Pages → Custom domain: `echen.io`, save. When the certificate is ready (usually minutes), tick **Enforce HTTPS**. `www.echen.io` keeps redirecting to the apex automatically.
5. **Check**: `https://echen.io` shows the town, `https://blog.echen.io` is unchanged, the link preview works (paste the URL into a Slack/iMessage draft or use opengraph.xyz).

Expect a few minutes of downtime between steps 3 and 4. Rollback is the same steps in reverse.

## Optional: a temporary subdomain first

To try it on `temp.echen.io` before touching `echen.io`: at your DNS provider add `CNAME temp → cloudui.github.io`, then set `temp.echen.io` as the custom domain in `cloudui/town` → Settings → Pages and re-run the workflow (Actions → Deploy to GitHub Pages → Run workflow) so links and the preview image use the new address.

## Decisions for you

- **Old pages will 404.** The Hugo site has `/shorts/…` (57 posts), `/lists`, `/gallery`, `/about`, `/emily`, and project pages. Options:
  - **(Recommended)** Keep them at `old.echen.io`: add DNS `CNAME old → cloudui.github.io`, set `cloudui/homepage`'s custom domain to `old.echen.io` (and its `static/CNAME` + `baseURL`). Then add a `404.astro` here that sends `/shorts/*`, `/lists`, etc. to the same path on `old.echen.io` (GitHub Pages has no server redirects, so it's a tiny script on the 404 page).
  - Move the shorts into the blog and redirect there.
  - Let them go.
- **Analytics.** The Hugo site uses Google Analytics (`G-8HBZE4Q212`). The town has none. Add GA back, use something lighter (GoatCounter, Plausible), or skip it.
- **Resume.** The old hero linked a resume PDF. The town doesn't; add it to the directory or the about panel if you want it.
