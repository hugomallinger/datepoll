# Datepoll

A Chrome extension for creating date polls on WhatsApp Web without typing every option by hand.

<img src="icons/icon-128.png" width="64" alt="Datepoll icon">

Click the calendar button next to Attach (+) in any chat, pick the days, and Datepoll fills in WhatsApp's own **Create poll** dialog. You review the poll and press Send yourself. Datepoll never sends anything.

## Features

- **Calendar:** click days, or shift-click to select a range.
- **Filters:** all days, weekdays or weekends.
- **Time slots:** add times like `18:00`, `9.30` or `20h30`. Each day gets one option per time.
- **Group by week:** one option per week ("Mon 2 – Fri 6 Nov"), for rough planning.
- **12-option limit:** WhatsApp polls allow at most 12 options. Datepoll shows the count and suggests ways to get under the limit.
- **Labels in English, German or French.** "Auto" follows WhatsApp's language.
- **Remembers your settings:** time slots, filter, label language, question and "multiple answers". Selected days are not remembered.
- Matches WhatsApp's light and dark theme.

## Install

Datepoll isn't in the Chrome Web Store. To load it from source:

1. Download or clone this repository.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the repository folder.
4. Reload WhatsApp Web and open a chat. The calendar button appears next to the + button.

It works in other Chromium browsers too (Edge, Brave, Arc).

## How it works

Datepoll runs only on `web.whatsapp.com`. When you click **Create poll**, it opens WhatsApp's Attach → Poll dialog and types the question and options into it, the same as you would. Then it checks that every field holds the right text. It doesn't use any of WhatsApp's internal functions, read your messages or contact any server. Its only permission, `storage`, is for remembering your settings.

When WhatsApp changes its page, the button or the filling can stop working. All lookups into WhatsApp's page are in [`selectors.js`](selectors.js), so that's the place to fix it.

## Development

| File | What it does |
| --- | --- |
| `selectors.js` | Every lookup into WhatsApp's page |
| `fill-poll.js` | Opens Attach → Poll and fills the dialog |
| `dates.js` | Days + filter + times → option labels, week grouping, 12-option fixes. No DOM. |
| `panel.js`, `panel.css` | The date picker panel, in a shadow root |
| `content.js` | Adds the button and opens the panel |

There's no build step. After changing code, click the reload icon on the extension card in `chrome://extensions`, then reload WhatsApp Web.

Run the unit tests for the date logic (Node 18+):

```
npm test
```

The icon source is [`icons/icon.svg`](icons/icon.svg). The PNGs (16/32/48/128) are rendered from it.

## License

[MIT](LICENSE)

Datepoll is not affiliated with, endorsed by or connected to WhatsApp or Meta. WhatsApp is a trademark of WhatsApp LLC.
