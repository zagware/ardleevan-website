# ardleevandogfood.co.uk — one change needed at Big Wet Fish

This is the only thing we need you to do. It takes about five minutes.

Everything is already prepared and waiting on our side. Once you've made this change, tell us and we
will finish the rest.

---

## What this does, in plain terms

Your domain name currently asks Big Wet Fish, *"where is the website, where is the email?"* We are
changing it to ask **Cloudflare** the same question instead. Cloudflare already holds a complete copy
of your current settings, including every single email setting, so the answers stay the same.

**Your email is not moving.** It stays on the Big Wet Fish server exactly as it is today:

- `info@ardleevandogfood.co.uk` keeps working, without interruption
- nothing changes on your phone, in Outlook, or in webmail
- no passwords change, no new setup, nothing to reconfigure

**Your website stays up throughout.** The current site keeps serving while the change spreads across
the internet. We switch it over to the new site afterwards, at a time that suits you.

> **Please do not cancel or downgrade your Big Wet Fish hosting package.** Your mailboxes live on it.
> The only thing moving is the "who do I ask" setting, not the hosting itself.

---

## What to change

In your Big Wet Fish account, the domain's **nameservers** need to be replaced.

**Remove these three:**

```
ns1.bigwetfish.co.uk
ns2.bigwetfish.co.uk
ns3.bigwetfish.co.uk
```

**Add these two:**

```
braden.ns.cloudflare.com
mira.ns.cloudflare.com
```

Two is correct — you are not missing a third. When you're finished, the list must contain **only**
the two `cloudflare.com` entries. Leaving any `bigwetfish` entry in the list causes problems, so
please make sure all three are gone.

---

## How to do it

### Option A — do it yourself

1. Log in to Big Wet Fish at <https://bigwetfish.hosting> (the client area, not cPanel/webmail).
2. Go to **Domains** → **My Domains**.
3. Find `ardleevandogfood.co.uk` and click **Manage** (or the spanner/settings icon next to it).
4. Open the **Nameservers** tab.
5. Choose **Use custom nameservers** (not "use default nameservers").
6. Clear the boxes and type in:
   - Nameserver 1: `braden.ns.cloudflare.com`
   - Nameserver 2: `mira.ns.cloudflare.com`
   - Nameserver 3, 4, 5: leave **empty** (delete anything already there)
7. Click **Change Nameservers** / **Save Changes**.
8. Tell us it's done.

Type the names carefully, or copy and paste them — a single wrong character stops the domain working.

### Option B — ask Big Wet Fish to do it

If you'd rather not, open a support ticket with them and paste this in:

> Please change the nameservers for ardleevandogfood.co.uk to:
>
> braden.ns.cloudflare.com
> mira.ns.cloudflare.com
>
> Please remove ns1, ns2 and ns3.bigwetfish.co.uk so that only the two Cloudflare nameservers
> remain. Please leave my hosting and email account fully active — email is staying with you and
> must not be affected. Please also confirm DNSSEC is not enabled on the domain.

Then let us know when they confirm it.

---

## Please do not change anything else

While you're in there, leave everything else alone:

- do not edit, add or delete any DNS records
- do not switch on DNSSEC (if they offer it)
- do not cancel, downgrade or move the hosting package
- do not change any email or cPanel setting

If Big Wet Fish suggest any other change as part of this, please check with us first.

---

## What happens next

- The change normally takes effect within an hour, though `.co.uk` domains can occasionally take up
  to 24 hours.
- During that window some people see the answer from Big Wet Fish and some from Cloudflare. Both
  give the same result, so the website and email keep working either way.
- We get an automatic notification when it completes, and we then publish the new website.
- Please **send yourself a test email** in both directions the next day, just as a final check. It
  should be completely unaffected.

If anything looks wrong at any point, tell us straight away — the change can be reversed in minutes
by putting the three Big Wet Fish nameservers back, and your old settings there are untouched.
