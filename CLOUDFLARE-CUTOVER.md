# Moving ardleevandogfood.co.uk to Cloudflare

This replaces the GitHub Pages plan in `DNS-CUTOVER.md`. The website moves to Cloudflare and **email stays exactly where it is** (Big Wet Fish, `mail.ardleevandogfood.co.uk` → 152.89.64.9).

Why Cloudflare rather than GitHub Pages:

- free hosting on a global CDN, with HTTPS certificates managed automatically;
- security headers and a `www` → apex redirect;
- room to add a contact form or a shop later without changing host.

The catch: Cloudflare must host the domain's **DNS** (nameservers). The steps below make sure every mail record comes across.

## Before switch-over (developer, about 15 min, no visible change)

1. Record the current zone so nothing is lost. Run this and save the output:
   ```sh
   for t in A AAAA CNAME MX TXT SRV; do for h in @ www mail webmail autodiscover autoconfig _dmarc default._domainkey; do
     n=$([ "$h" = "@" ] && echo ardleevandogfood.co.uk || echo $h.ardleevandogfood.co.uk)
     r=$(dig +short $t $n); [ -n "$r" ] && echo "$t $n -> $r"; done; done
   ```
   Also ask the owner for a screenshot of the Big Wet Fish DNS page. DKIM selectors can't be discovered with `dig`.
2. Cloudflare dashboard (Zagware account) → **Add a domain** → `ardleevandogfood.co.uk` → Free plan. Cloudflare scans the existing records. Compare the result with step 1 and add anything missing.
3. Set **every mail-related record to "DNS only" (grey cloud)**: MX targets, `mail`, `webmail`, `autodiscover`, `autoconfig`, `cpanel`, `webdisk`, `whm`, `ftp`, `cpcalendars`, `cpcontacts` — anything pointing at 152.89.64.9. Proxying mail hosts breaks email.
4. Set the scanned `@` A record (152.89.64.67) and the `www` CNAME to **DNS only** as well. Do *not* proxy them and do *not* delete them yet: while the nameservers propagate, these keep the existing WordPress site serving. Delete them immediately before the Worker deploy — the Worker's custom domains cannot be created while a conflicting record exists. Optionally add `old` A → 152.89.64.67 (DNS only) so the old site stays reachable afterwards.
5. **Retarget the CalDAV/CardDAV SRV records.** `_caldav._tcp`, `_caldavs._tcp`, `_carddav._tcp` and `_carddavs._tcp` currently point at `ardleevandogfood.co.uk` on ports 2079/2080. The apex becomes a proxied Worker, and Cloudflare only proxies HTTP(S) ports, so calendar/contact sync would stop. Change each SRV target to `cpanel.ardleevandogfood.co.uk` (DNS only → 152.89.64.9). Leave `_autodiscover._tcp` alone; it already points to `cpanelemaildiscovery.cpanel.net`.
6. **Verify the DKIM record survived the import.** `default._domainkey` is longer than 255 characters, so it is stored as two quoted strings and is the single most common thing an import mangles. Open the record in Cloudflare and compare it character-for-character with the `dig` output saved in step 1 — the live value ends `...JwIDAQAB;`. A truncated DKIM key means every outbound email starts failing authentication.
7. Add the missing **DMARC** record now rather than later: TXT `_dmarc` → `v=DMARC1; p=none; rua=mailto:info@ardleevandogfood.co.uk` (DNS only). `p=none` is monitor-only and cannot block mail.
8. **Fix SPF before the switch, not after.** The current value ends `+a +mx ~all`. `+a` authorises whatever the apex A record resolves to — after cutover that is Cloudflare's entire anycast range, i.e. any Cloudflare customer could pass SPF for this domain. Change it to `v=spf1 ip4:152.89.64.9 ip4:87.117.230.215 +mx ~all`.
9. Scroll to the bottom of the Cloudflare DNS list and confirm no records sit below `default._domainkey` — a second DKIM selector there would be easy to miss.
10. Note the two Cloudflare nameservers it assigns.

## Switch-over (owner, about 5 min)

The registrar is **BWF Hosting Ltd** (Nominet tag `BIGWETFISH`, `https://bigwetfish.hosting`), so the change is made in the Big Wet Fish client area — Domains → Manage → Nameservers — or by raising a support ticket with them. Keep the Big Wet Fish **hosting/email account active**: email still lives there.

Remove all three existing nameservers and replace them with exactly these two:

```
braden.ns.cloudflare.com
mira.ns.cloudflare.com
```

| Remove | Add |
| --- | --- |
| `ns1.bigwetfish.co.uk` | `braden.ns.cloudflare.com` |
| `ns2.bigwetfish.co.uk` | `mira.ns.cloudflare.com` |
| `ns3.bigwetfish.co.uk` | — |

Do **not** leave any `bigwetfish` nameserver in the list; a mixed set produces inconsistent answers.

Two notes on Cloudflare's "Recommended" panel:

- *Make sure DNSSEC is off* — already confirmed off. The `.uk` registry holds no DS record for this domain, so there is nothing to disable and no risk of a validation failure during the move.
- *Only allow Cloudflare IP addresses at your origin* — **ignore this.** The origin also serves mail, webmail and cPanel directly over DNS-only records; firewalling it to Cloudflare ranges would break all of them.

The change usually takes effect within an hour, but can take up to 24 hours for `.co.uk`. Cloudflare emails when the zone goes Active.

## After Cloudflare shows the zone "Active" (developer)

1. In `wrangler.jsonc`, uncomment the `routes` block for `ardleevandogfood.co.uk` and `www.ardleevandogfood.co.uk`.
2. Add repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The token needs Workers Scripts:Edit, Workers Routes:Edit, and Zone:Read on this zone.
3. Delete the `@` A record (152.89.64.67) and the `www` CNAME kept alive during propagation. The Worker custom domains cannot bind while they exist.
4. `git tag v1.0.0 && git push --tags` runs the **Deploy (Cloudflare)** workflow: build (`--strict`), deploy, smoke test.
5. Dashboard → Rules → Redirect Rules → template **"Redirect from WWW to root"**, and SSL/TLS → Edge Certificates → **Always Use HTTPS** on.
6. Check the following:
   - `https://ardleevandogfood.co.uk/` shows the new site;
   - `/robots.txt` allows indexing and lists the sitemap;
   - `http://` redirects to `https://`;
   - `dig TXT default._domainkey.ardleevandogfood.co.uk` still returns the full key;
   - send test emails in both directions, and check the received headers show `dkim=pass` and `spf=pass`.
7. Search Console: add the domain property and submit `https://ardleevandogfood.co.uk/sitemap.xml`.
8. Delete the stale `_acme-challenge` and `_cpanel-dcv-test-record` TXT entries — leftovers from cPanel AutoSSL validation runs.
9. **Watch cPanel AutoSSL at the next renewal (~90 days).** cPanel no longer controls this zone, so any renewal that relies on DNS validation will fail and the certificate on `webmail`/`mail` will lapse. HTTP validation still works because those hostnames still resolve to 152.89.64.9. If a renewal fails, ask Big Wet Fish to switch that domain's AutoSSL to HTTP DCV.

## Rollback

Set the nameservers back to `ns1/ns2/ns3.bigwetfish.co.uk` at Big Wet Fish. The old zone there is untouched, so WordPress and email return as they were.
