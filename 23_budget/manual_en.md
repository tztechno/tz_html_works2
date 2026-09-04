# Household Budget App — User Manual

Target file: `budget_app_en.html`

A browser-only household budget app that uses a CSV file as its database. No server or installation is required — just double-click the file to open it.

## 1. Getting Started

Double-click `budget_app_en.html` to open it in your default browser. On first launch, sample data is shown.

Recommended browsers: the latest Google Chrome or Microsoft Edge. Safari and Firefox work fine for viewing, adding/editing/deleting entries, and importing/exporting CSV, but the "Overwrite Original File" feature is Chromium-only (see section 4.3).

## 2. Layout

- **Transactions**: All recorded income and expenses in a table. Click a column header to sort by that column.
- **Filters**: Narrow the list by type (Income/Expense), category, date range (From/To), and a memo keyword search.
- **Summary**: Total income, total expense, and balance for the currently displayed (filtered) data.
- **Charts**: Expense by category (within the visible range) and the monthly income/expense trend.

## 3. Basic Operations

### 3.1 Add a Transaction

Click "+ Add Transaction", fill in the date, type (Income/Expense), category, amount, and memo, then click "Save".

### 3.2 Edit / Delete

Use the "Edit" and "Delete" buttons on each row. Deleting asks for confirmation first.

### 3.3 Search, Filter, Sort

Typing or choosing a filter value updates the list instantly. Click a column header (Date, Type, Category, Amount, Memo) to sort ascending or descending (click again to reverse).

## 4. Saving and Persistence

The app has three distinct ways of keeping your data, each with a different role.

### 4.1 Auto-save (browser localStorage)

Every time you add, edit, or delete a transaction, it is automatically saved to the browser's local storage. The next time you open **the same file in the same browser**, your data is restored — it will not revert to sample data.

However, auto-saved data will NOT be restored, and the app will start with sample data again, if you:

- open the file in a different browser
- open it in a private/incognito window
- clear your browser's site data
- open a different copy of the file (a different version, or a copy saved to another location)

Auto-save is a convenience so you don't lose work if you close the tab by accident — it is not a proper backup. For anything important, use the CSV export described next.

### 4.2 Save as CSV (export)

Click "Save as CSV" to download all current data as `budget_YYYY-MM-DD.csv`. Doing this at the end of each session guarantees your data is preserved regardless of what happens to the browser's local storage.

### 4.3 Open CSV (import) / Overwrite Original File

"Open CSV" loads an existing CSV file, replacing the current data with its contents.

In Chromium-based browsers, once you've opened a CSV this way, the "Overwrite Original File" button becomes active, letting you save changes directly back to that same file without going through your Downloads folder (this uses the File System Access API). This button does not appear in Safari or Firefox.

### 4.4 Reset to Sample Data

Discards the current data and restores the original sample dataset. A confirmation dialog appears first. This cannot be undone, so export your data to CSV beforehand if you need to keep it.

## 5. CSV File Format

| Column | Content | Example |
|---|---|---|
| date | Date in YYYY-MM-DD format | 2026-09-04 |
| type | `income` or `expense` | expense |
| category | Category name (free text) | Food |
| amount | Numeric amount | 6800 |
| memo | Memo (optional; commas/newlines are automatically quoted) | Grocery store |

The first row must be the header row (`date,type,category,amount,memo`). Files are saved with a UTF-8 byte-order mark (BOM) so they open correctly in Excel.

## 6. Default Categories

- **Income**: Salary / Side Job / Bonus / Interest/Dividends / Other Income
- **Expense**: Food / Daily Necessities / Transportation / Housing / Utilities / Communication / Entertainment / Medical / Clothing / Education / Other Expense

You can import a CSV containing category names outside this list — they'll display and filter normally, but won't appear as an option in the Add/Edit dropdown.

## 7. Troubleshooting

- **My data suddenly reverted to sample data** → See section 4.1. This usually means a different browser, a private window, or cleared site data. If you exported a CSV beforehand, restore it via "Open CSV".
- **The CSV looks garbled in Excel** → The app exports UTF-8 with a BOM, which Excel normally reads correctly. If it still looks wrong, use Excel's Import feature and explicitly select UTF-8 encoding.
- **The "Overwrite Original File" button doesn't appear** → It only shows up in browsers that support the File System Access API (Chrome, Edge). In Safari or Firefox, use "Save as CSV" instead.
