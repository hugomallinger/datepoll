# Chrome Web Store submission

Everything to paste into the Chrome Web Store Developer Dashboard, tab by tab.
Upload: `dist/datepoll-<version>.zip`, built with `scripts/package.sh`.

## Store listing

Name and summary come from `_locales/<lang>/messages.json` (name max. 75 characters, summary max. 132). The store shows the matching language to each user and indexes each language for search separately. The description and screenshots are set per language in the dashboard: pick the language in the dropdown at the top of the Store listing tab.

| | Name | Summary |
|---|---|---|
| en | Datepoll – Date Polls for WhatsApp Web | Find a date with your group: pick days and times in a calendar and turn them into a WhatsApp Web poll in one click. |
| de | Datepoll – Terminumfrage für WhatsApp Web | Termin in der Gruppe finden: Tage und Uhrzeiten im Kalender wählen und mit einem Klick eine Umfrage in WhatsApp Web erstellen. |
| fr | Datepoll – Sondage de dates pour WhatsApp Web | Trouvez une date avec votre groupe : choisissez jours et horaires dans un calendrier, Datepoll crée le sondage WhatsApp Web. |

### Description: English

```
Find a date with your group without leaving WhatsApp. Planning a dinner, a trip, a meeting or a game night? Datepoll turns "which day works for everyone?" into a WhatsApp poll in seconds, without typing every date by hand. Like a Doodle-style scheduling poll, but inside the group chat where everyone already is.

How it works: click the calendar button next to + in any chat on WhatsApp Web, pick your days and times, and press Create poll. Datepoll fills in WhatsApp's own poll dialog. You check it and press Send yourself.

• Calendar: click days, or shift-click to select a date range
• Filter: all days, weekdays only or weekends only
• Time slots: add times like 18:00 or 20:30; each day gets one option per time
• Group by week: one option per week for rough planning
• Stays within WhatsApp's 12-option limit, with suggestions when you go over
• Date labels in English, German or French
• Remembers your usual time slots and settings
• Works with WhatsApp's light and dark theme

Good for: group dinners, weekend trips, team meetings, sports and game nights, family visits, club and class schedules.

Privacy: Datepoll runs only on web.whatsapp.com. It doesn't read your messages, has no server and collects no data. It never sends anything: you always press Send yourself.

Free and open source: https://github.com/hugomallinger/datepoll

Datepoll is not affiliated with, endorsed by or connected to WhatsApp or Meta.
```

### Description: German

```
Einen Termin mit der Gruppe finden, ohne WhatsApp zu verlassen. Ein Abendessen, einen Ausflug, ein Meeting oder einen Spieleabend planen? Datepoll macht aus „Wann habt ihr Zeit?" in Sekunden eine WhatsApp-Umfrage, ohne jedes Datum von Hand einzutippen. Eine Terminumfrage wie bei Doodle, aber direkt im Gruppenchat, in dem sowieso alle sind.

So geht's: In einem Chat auf WhatsApp Web neben dem + auf den Kalender-Button klicken, Tage und Uhrzeiten wählen und auf „Create poll" klicken. Datepoll füllt das Umfrage-Fenster von WhatsApp aus. Du prüfst die Umfrage und klickst selbst auf Senden.

• Kalender: Tage anklicken oder mit Shift-Klick einen Zeitraum wählen
• Filter: alle Tage, nur Werktage oder nur Wochenenden
• Uhrzeiten: z. B. 18:00 oder 20:30 hinzufügen; jeder Tag bekommt eine Option pro Uhrzeit
• Nach Woche gruppieren: eine Option pro Woche für die grobe Planung
• Hält das Limit von 12 Optionen ein und macht Vorschläge, wenn es mehr werden
• Datumsangaben auf Deutsch, Englisch oder Französisch
• Merkt sich deine üblichen Uhrzeiten und Einstellungen
• Funktioniert mit dem hellen und dunklen Design von WhatsApp

Geeignet für: Essen mit Freunden, Wochenendausflüge, Team-Meetings, Sport- und Spieleabende, Familienbesuche, Vereins- und Kurstermine.

Datenschutz: Datepoll läuft nur auf web.whatsapp.com. Es liest keine Nachrichten, hat keinen Server und sammelt keine Daten. Es sendet nie etwas: Auf Senden klickst immer du selbst.

Kostenlos und Open Source: https://github.com/hugomallinger/datepoll

Datepoll steht in keiner Verbindung zu WhatsApp oder Meta und wird nicht von ihnen unterstützt.
```

### Description: French

```
Trouvez une date avec votre groupe sans quitter WhatsApp. Un dîner, un week-end, une réunion ou une soirée jeux à organiser ? Datepoll transforme « Quel jour vous arrange ? » en sondage WhatsApp en quelques secondes, sans taper chaque date à la main. Comme un sondage de dates façon Doodle, mais directement dans le groupe où tout le monde se trouve déjà.

Comment ça marche : dans une discussion sur WhatsApp Web, cliquez sur le bouton calendrier à côté du +, choisissez les jours et les horaires, puis cliquez sur « Create poll ». Datepoll remplit la fenêtre de sondage de WhatsApp. Vous vérifiez le sondage et cliquez vous-même sur Envoyer.

• Calendrier : cliquez sur des jours, ou Maj-clic pour choisir une période
• Filtre : tous les jours, jours de semaine ou week-ends uniquement
• Horaires : ajoutez par ex. 18:00 ou 20:30 ; chaque jour reçoit une option par horaire
• Regrouper par semaine : une option par semaine pour une première planification
• Respecte la limite de 12 options de WhatsApp et propose des solutions si vous la dépassez
• Dates en français, anglais ou allemand
• Garde en mémoire vos horaires et réglages habituels
• Compatible avec les thèmes clair et sombre de WhatsApp

Idéal pour : dîners entre amis, week-ends, réunions d'équipe, soirées sport ou jeux, visites en famille, planning d'associations et de cours.

Confidentialité : Datepoll fonctionne uniquement sur web.whatsapp.com. Il ne lit pas vos messages, n'a pas de serveur et ne collecte aucune donnée. Il n'envoie jamais rien : c'est toujours vous qui cliquez sur Envoyer.

Gratuit et open source : https://github.com/hugomallinger/datepoll

Datepoll n'est ni affilié à WhatsApp ou Meta, ni approuvé par eux.
```

**Category:** Communication

**Graphic assets** (in `store/`, same images for all languages):
- Store icon (128×128): `icons/icon-128.png`
- Screenshots (1280×800), in this order: `store/screenshot-1.png` (pick dates), `store/screenshot-3.png` (time slots), `store/screenshot-4.png` (12-option limit), `store/screenshot-5.png` (date labels in 3 languages), `store/screenshot-2.png` (sent poll)
- Small promo tile (440×280): `store/promo-small.png`
- Marquee promo tile (1400×560, optional): `store/promo-marquee.png`
- Promo video: upload `store/promo-video.mp4` to YouTube (unlisted is fine), paste the YouTube URL

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

## Publishing an update

1. Bump `version` in `manifest.json`, then run `scripts/package.sh`.
2. Developer Dashboard → Datepoll → **Package** → **Upload new package** → choose `dist/datepoll-<version>.zip`.
3. **Store listing** tab: the language dropdown at the top lists English, German and French once the zip with `_locales/` is uploaded. Fill each language's description and upload the screenshots (and promo video URL) per language.
4. Check the **Privacy practices** tab still matches (no change needed if permissions didn't change).
5. **Submit for review**. The current version stays live until the new one is approved.
