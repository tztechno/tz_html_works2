# Bingo Night User Manual

A number-bingo tool for parties, office events, and receptions, using the classic 01–75 range. A single HTML file holds both a Participant tab and an Organizer tab — everyone just opens it in a browser, no setup required.

## The files

- `bingo-night-jp.html` — Japanese interface
- `bingo-night-en.html` — English interface

Both files work identically. Hand out whichever language suits your guests. Just double-click the file, or drag it into a browser window — no internet connection or installation needed.

## Using the Participant tab

1. When the file opens, the Participant tab is shown by default (if not, click "Participant" in the top right).
2. A 5×5 bingo card appears automatically. The center square is FREE; the other 24 squares hold unique numbers drawn from 01–75.
3. To get a different set of numbers, press "New card" below the grid — it regenerates the card instantly.
4. As the organizer calls out (draws) numbers, tap or click the matching square on your card to mark it. Tap again to unmark it.
5. When any full row, column, or diagonal is marked, those squares light up in gold and a "BINGO!" banner appears below the card.

Your card and its marks are saved automatically on that device and browser, so reopening the file picks up where you left off. Clearing browser data, or opening the file in a different browser or device, starts you with a fresh card.

## Using the Organizer tab

1. Click "Organizer" in the top right to switch tabs.
2. To start a new game, press "Shuffle & start." This reshuffles the 01–75 pool and clears the draw history and control board from any previous game.
3. Each press of "Draw number" pulls one random number. It appears large in the center ball, and is added to the history strip below and to the "Control board" (the full 01–75 grid) on the right.
4. The "X left (of 75)" label shows how many numbers remain. Once all 75 have been drawn, the button disables and the page shows that the game is complete.

The Organizer tab is meant to be read aloud to players, or projected on a screen so everyone can see which numbers have been called.

## Tips for running a game

- Have each participant open the file on their own device (phone, tablet, laptop) — every time the file opens, it generates a fresh, unique card automatically, so there's no printing or manual card assignment needed.
- Numbers drawn in the Organizer tab are tracked only on that one device; there's no automatic syncing to participants' screens. Call the numbers aloud, use a microphone, or project the Organizer tab so players can follow along and mark their own cards.
- Numbers stay on the control board until you start a new game. Always press "Shuffle & start" before beginning a new round.

## About data storage

All card and draw data is stored locally in the browser (localStorage) on each device — nothing is sent to a server. Opening the file in a private/incognito window, or clearing that browser's stored data, will reset whatever was saved.
