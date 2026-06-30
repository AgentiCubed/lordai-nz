# LordAi.nz

A slick, self-contained static landing page for **Lord Ainz** — the Sorcerer-King
familiar. One file (`index.html`), no build step, no dependencies, no tracking.
Regal void-and-gold theme, the 🤘, links to the sibling research repos
(Petrichor, Nobody) staged but private.

> **Status: STAGED, NOT DEPLOYED.** This repo is private. DNS is not wired and
> nothing is published. Going live needs James's registrar credentials and his
> explicit go-ahead. The instructions below are the recipe for *when* he says so.

---

## Preview locally

```bash
open index.html          # macOS — opens in default browser
# or serve it:
python3 -m http.server 8080   # then visit http://localhost:8080
```

It's a single HTML file with inline CSS. Edit copy/colors directly in `index.html`
(CSS custom properties live in `:root` at the top — `--gold`, `--void`, `--ember`).

---

## When James says go: deploy on GitHub Pages

**1. Make the repo public OR keep Pages on a Pro/Org plan**
GitHub Pages serves from public repos on any plan; private-repo Pages needs
GitHub Pro/Team/Enterprise. (This repo is currently private by design.)

**2. Enable Pages**
- Repo → **Settings → Pages**
- **Source:** Deploy from a branch → `main` / `/ (root)`
- Save. GitHub builds and serves at `https://<owner>.github.io/lordai-nz/`.

**3. Add the custom domain `lordai.nz`**
- Settings → Pages → **Custom domain** → enter `lordai.nz` → Save.
- This writes a `CNAME` file to the repo. Leave it.
- Tick **Enforce HTTPS** once the certificate provisions (can take ~15 min–24h).

**4. Wire DNS at the registrar (where James bought lordai.nz)**

For an **apex** domain (`lordai.nz`), add the four GitHub Pages A records:

```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
```

(Optional AAAA / IPv6, same hosts):
```
AAAA @ 2606:50c0:8000::153
AAAA @ 2606:50c0:8001::153
AAAA @ 2606:50c0:8002::153
AAAA @ 2606:50c0:8003::153
```

For the `www` subdomain, add a CNAME:
```
CNAME  www  <owner>.github.io.
```

> ⚠️ Verify the current GitHub Pages apex IPs at deploy time —
> see *docs.github.com → Pages → Managing a custom domain*. Vendors rotate them.

**5. Verify**
```bash
dig +short lordai.nz            # should return the four A records
curl -I https://lordai.nz       # 200 OK, served by GitHub.com
```

DNS propagation: minutes to ~24h. Don't panic before then.

---

## Alternative: Cloudflare Pages / Netlify (faster TLS, free)

Either will take this repo and a custom domain in a few clicks; both provision
HTTPS automatically and proxy DNS. If James wants Cloudflare's proxy + analytics,
that's the smoother path — say the word and I'll stage that variant.

---

## Files

```
index.html    the whole site (HTML + inline CSS, zero deps)
README.md     this file
```

---

🤘 *Nazarick endures. Staged, awaiting the King's command to descend.*
