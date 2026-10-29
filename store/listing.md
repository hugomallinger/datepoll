# Chrome Web Store submission

Everything to paste into the Chrome Web Store Developer Dashboard, tab by tab.
Upload: `dist/datepoll-<version>.zip`, built with `scripts/package.sh`.

## Store listing

**Name** (from the manifest): Datepoll

**Summary** (from the manifest, max. 132 characters):
Create date polls on WhatsApp Web in one click.

**Description:**

```
Planning a dinner, a trip or a meeting in a WhatsApp group? Datepoll turns "which day works?" into a poll in seconds, without typing every date by hand.

Click the calendar button next to + in any chat on WhatsApp Web, pick your days and press Create poll. Datepoll fills in WhatsApp's own poll dialog. You check it and press Send yourself.

• Calendar: click days, or shift-click to select a range
• Filter: all days, weekdays only or weekends only
• Time slots: add times like 18:00 or 20:30; each day gets one option per time
• Group by week: one option per week for rough planning
• Stays within WhatsApp's 12-option limit, with suggestions when you go over
• Labels in English, German or French
• Remembers your usual time slots and settings
• Works with WhatsApp's light and dark theme

Privacy: Datepoll runs only on web.whatsapp.com. It doesn't read your messages, has no server and collects no data. It never sends anything: you always press Send yourself.

Open source: https://github.com/hugomallinger/datepoll

Datepoll is not affiliated with, endorsed by or connected to WhatsApp or Meta.
```

**Category:** Communication (if not offered: Productivity / Tools)

**Language:** English

**Graphic assets** (in `store/`):
- Store icon (128×128): `icons/icon-128.png`
- Screenshots (1280×800): `store/screenshot-1.png`, `store/screenshot-2.png`
- Small promo tile (440×280): `store/promo-small.png`

**Homepage URL:** https://github.com/hugomallinger/datepoll
**Support URL:** https://github.com/hugomallinger/datepoll/issues

## Privacy practices

**Single purpose:**

```
Datepoll helps users create date polls on WhatsApp Web: the user picks dates in a panel, and the extension fills WhatsApp's own "Create poll" dialog with those dates. The user reviews the poll and sends it themselves.
```

**Permission justification: storage**

```
Saves the user's panel settings (time slots, day filter, label language, custom question, "group by week" and "multiple answers") so they don't have to set them again for every poll. Nothing else is stored.
```

**Host permission justification** (content script on https://web.whatsapp.com/*):

```
The extension's only function is on WhatsApp Web: it adds a calendar button to the chat footer and, when the user clicks "Create poll", fills WhatsApp's poll dialog with the selected dates. It runs on no other site.
```

**Remote code:** No, I am not using remote code.

**Data usage:** tick none of the data types (Datepoll collects no user data), then certify all three statements:
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** https://github.com/hugomallinger/datepoll/blob/main/PRIVACY.md

## Distribution

**Visibility:** Public
**Regions:** All regions
**Pricing:** Free
