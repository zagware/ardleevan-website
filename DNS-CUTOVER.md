# Pointing ardleevandogfood.co.uk at the new website

Instructions for the domain owner. Everything happens in the **Big Wet Fish** control panel
(where the domain's DNS is managed). The whole job is **two web records**. Nothing here touches
email.

**Preview the new site first:** <https://zagware.github.io/ardleevan-website/>
That is the exact site that will appear on the domain.

---

## Read this before you start

Your email and your website live on **two different servers**:

| What | Server | Changing? |
| --- | --- | --- |
| Website (WordPress) | `152.89.64.67` | **Yes** — this is what we are replacing |
| Email, webmail, Outlook setup | `152.89.64.9` | **No** — do not touch |

So `info@ardleevandogfood.co.uk` keeps working exactly as it does today. You will **not** need to
change anything on your phone or in Outlook.

**Do not cancel the Big Wet Fish account.** It still runs your email and your DNS. If you want to
save money, ask them to move you to their cheapest email-only plan — but ask them in writing to
confirm the mailbox and the DNS zone survive the change *before* they do it.

---

## Step 1 — the day before (2 minutes)

This makes the switch take 5 minutes instead of 4 hours.

1. Log in to Big Wet Fish and open **DNS / Zone Editor** for `ardleevandogfood.co.uk`.
2. Find the record named `ardleevandogfood.co.uk` of type **A**, and the one named `www`.
3. Change the **TTL** on both to **300** (this may be shown as "300" or "5 minutes"). Change nothing
   else.
4. Save, and leave it overnight.

---

## Step 2 — switch-over day

### 2a. Keep a link to the old site (optional but recommended)

**Add** a new record so the old WordPress site is still reachable afterwards at
`http://old.ardleevandogfood.co.uk`:

| Type | Name / Host | Value / Points to | TTL |
| --- | --- | --- | --- |
| A | `old` | `152.89.64.67` | 300 |

### 2b. Delete the old website record

Delete the **A** record for `ardleevandogfood.co.uk` (the blank/`@` name) that points to
`152.89.64.67`.

### 2c. Add the four new website records

Add these **A** records, all with the name `@` (some panels show this as blank, or want the full
`ardleevandogfood.co.uk`):

| Type | Name / Host | Value / Points to | TTL |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | 300 |
| A | `@` | `185.199.109.153` | 300 |
| A | `@` | `185.199.110.153` | 300 |
| A | `@` | `185.199.111.153` | 300 |

Yes — all four, same name, four different addresses. That is correct and intentional. If the control
panel will not let you add more than one, email Big Wet Fish support and ask them to add all four.

**One question worth asking Big Wet Fish support first:** *"Does your DNS support an `ALIAS` or
`ANAME` record on the apex domain?"* If it does, use a single `ALIAS`/`ANAME` record with the name
`@` pointing to `zagware.github.io` **instead of** the four `A` records above — it does the same job
but keeps tracking GitHub automatically if they ever change their addresses. Most control panels do
not offer it, in which case the four `A` records are the correct approach.

Optionally also add these four **AAAA** records (same name `@`) so the site works on IPv6 networks:

| Type | Name / Host | Value / Points to | TTL |
| --- | --- | --- | --- |
| AAAA | `@` | `2606:50c0:8000::153` | 300 |
| AAAA | `@` | `2606:50c0:8001::153` | 300 |
| AAAA | `@` | `2606:50c0:8002::153` | 300 |
| AAAA | `@` | `2606:50c0:8003::153` | 300 |

### 2d. Repoint www

There is currently a **CNAME** for `www` pointing at `ardleevandogfood.co.uk`. Change its value to:

| Type | Name / Host | Value / Points to | TTL |
| --- | --- | --- | --- |
| CNAME | `www` | `zagware.github.io` | 300 |

If the panel rejects it, delete the existing `www` record first, then add it fresh. Some panels
require a trailing dot: `zagware.github.io.`

### 2e. Save, then tell the developer

Save the zone and send a message saying it's done. Within about 5 minutes the domain will be
serving the new site.

---

## Do NOT touch these records

Leave every one of these exactly as it is — they are your email:

| Type | Name | Value |
| --- | --- | --- |
| MX | `@` | `mail.ardleevandogfood.co.uk` (priority 0) |
| A | `mail` | `152.89.64.9` |
| A | `webmail` | `152.89.64.9` |
| A | `autodiscover` | `152.89.64.9` |
| TXT | `@` | `v=spf1 ...` |
| TXT | anything containing `_domainkey` | (DKIM signing key) |
| TXT | `_dmarc` | if present |
| SRV / CNAME | `_autodiscover`, `_imaps`, `_submission` etc. | if present |

Rule of thumb: **if the value contains `152.89.64.9`, or the name mentions mail, leave it alone.**
The only address you are removing is `152.89.64.67`.

---

## Step 3 — developer finishes off

Not your job, but for the record:

1. Add a `CNAME` file containing `ardleevandogfood.co.uk` to the repository and push.
2. GitHub → repo **Settings → Pages → Custom domain** = `ardleevandogfood.co.uk`, Save.
3. Wait for the HTTPS certificate to be issued (usually minutes, up to an hour), then tick
   **Enforce HTTPS**.

Between steps 2 and 3 the site is briefly reachable over plain `http://` only. That is normal.

---

## Step 4 — email housekeeping (recommended, later)

Two small improvements to help your email reach inboxes rather than spam folders. Ask Big Wet Fish
support to do these if you'd rather not.

1. **Tighten SPF.** The current record is:

   ```
   v=spf1 ip4:152.89.64.9 ip4:87.117.230.215 +a +mx ~all
   ```

   The `+a` part means "whatever the website address is, is also allowed to send email". After the
   switch that would be GitHub's servers, which never send your email. Change it to:

   ```
   v=spf1 ip4:152.89.64.9 ip4:87.117.230.215 +mx ~all
   ```

2. **Add DMARC.** There is no DMARC record at present. Add:

   | Type | Name | Value |
   | --- | --- | --- |
   | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@ardleevandogfood.co.uk` |

   `p=none` is monitor-only — it cannot block any of your mail.

---

## Checking it worked

- Visit <https://ardleevandogfood.co.uk> — you should see the new green-and-cream site.
  If you still see the old one, your computer is remembering the old address: try a private/
  incognito window, or your phone on mobile data.
- Independent check: <https://dnschecker.org/#A/ardleevandogfood.co.uk> should list the four
  `185.199.x.153` addresses.
- **Send yourself a test email** to `info@ardleevandogfood.co.uk` from a personal account, and send
  one out from it. Both should work immediately — nothing about mail has changed.

## If something goes wrong

Undo is instant. In the zone editor:

1. Delete the four `185.199.x.153` A records (and the AAAA records, if added).
2. Add back a single A record: `@` → `152.89.64.67`.
3. Set `www` CNAME back to `ardleevandogfood.co.uk`.

With TTL at 300 the old site is back within five minutes.

Leave the old WordPress installation in place for at least a month before deleting anything.
