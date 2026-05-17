(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const els = {
    origin: $("#origin"),
    stats: $("#stats"),
    search: $("#search"),
    sort: $("#sort"),
    entryList: $("#entry-list"),
    entryCount: $("#entry-count"),
    emptyState: $("#empty-state"),
    noResults: $("#no-results"),
    detailPlaceholder: $("#detail-placeholder"),
    detail: $("#detail"),
    detailKey: $("#detail-key"),
    detailSize: $("#detail-size"),
    detailType: $("#detail-type"),
    detailValue: $("#detail-value"),
    detailRaw: $("#detail-raw"),
    confirmDialog: $("#confirm-dialog"),
    confirmMessage: $("#confirm-message"),
  };

  let entries = [];
  let selectedKey = null;

  function byteSize(str) {
    return new Blob([str]).size;
  }

  function formatBytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  }

  function detectType(value) {
    if (value === "true" || value === "false") return "boolean";
    if (value === "null") return "null";
    if (/^-?\d+(\.\d+)?$/.test(value)) return "number";
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return "array";
      if (parsed !== null && typeof parsed === "object") return "object";
    } catch {
      /* not JSON */
    }
    return "string";
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlightJson(json) {
    const str =
      typeof json === "string" ? json : JSON.stringify(json, null, 2);
    return escapeHtml(str).replace(
      /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      (match, quoted, colon, bool, nil, num) => {
        if (colon) {
          const key = quoted.slice(1, -1);
          return `<span class="json-key">"${escapeHtml(key)}"</span>:`;
        }
        if (quoted) return `<span class="json-string">${quoted}</span>`;
        if (bool) return `<span class="json-bool">${bool}</span>`;
        if (nil) return `<span class="json-null">${nil}</span>`;
        if (num) return `<span class="json-number">${num}</span>`;
        return match;
      }
    );
  }

  function formatDisplayValue(value) {
    const type = detectType(value);
    if (type === "object" || type === "array") {
      try {
        return highlightJson(JSON.parse(value));
      } catch {
        return escapeHtml(value);
      }
    }
    if (type === "boolean" || type === "null" || type === "number") {
      const cls =
        type === "boolean"
          ? "json-bool"
          : type === "null"
            ? "json-null"
            : "json-number";
      return `<span class="${cls}">${escapeHtml(value)}</span>`;
    }
    return `<span class="json-string">"${escapeHtml(value)}"</span>`;
  }

  function readStorage() {
    const list = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      list.push({
        key,
        value,
        size: byteSize(key) + byteSize(value ?? ""),
      });
    }
    return list;
  }

  function totalSize(items) {
    return items.reduce((sum, e) => sum + e.size, 0);
  }

  function sortEntries(list, mode) {
    const copy = [...list];
    switch (mode) {
      case "key-desc":
        return copy.sort((a, b) => b.key.localeCompare(a.key));
      case "size-desc":
        return copy.sort((a, b) => b.size - a.size);
      case "size-asc":
        return copy.sort((a, b) => a.size - b.size);
      default:
        return copy.sort((a, b) => a.key.localeCompare(b.key));
    }
  }

  function filterEntries(list, query) {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (e) =>
        e.key.toLowerCase().includes(q) ||
        e.value.toLowerCase().includes(q)
    );
  }

  function renderStats(all) {
    const total = totalSize(all);
    els.stats.innerHTML = `
      <dl class="stat-card">
        <dt>エントリ数</dt>
        <dd>${all.length}</dd>
      </dl>
      <dl class="stat-card">
        <dt>合計サイズ</dt>
        <dd>${formatBytes(total)}</dd>
      </dl>
      <dl class="stat-card">
        <dt>オリジン</dt>
        <dd style="font-size:0.75rem;font-weight:400;font-family:var(--mono)">${location.hostname || "file"}</dd>
      </dl>
    `;

    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.quota) {
          const used = est.usage ?? total;
          const pct = ((used / est.quota) * 100).toFixed(1);
          const card = document.createElement("dl");
          card.className = "stat-card";
          card.innerHTML = `
            <dt>ストレージ使用量</dt>
            <dd style="font-size:0.9rem">${formatBytes(used)} / ${formatBytes(est.quota)} (${pct}%)</dd>
          `;
          els.stats.appendChild(card);
        }
      });
    }
  }

  function renderList(filtered) {
    els.entryList.innerHTML = "";
    els.entryCount.textContent = String(filtered.length);

    const hasAny = entries.length > 0;
    const hasFiltered = filtered.length > 0;

    els.emptyState.classList.toggle("hidden", hasAny);
    els.noResults.classList.toggle(
      "hidden",
      !hasAny || hasFiltered || !els.search.value.trim()
    );

    filtered.forEach((entry) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "entry-item";
      btn.setAttribute("aria-selected", entry.key === selectedKey);
      btn.dataset.key = entry.key;

      const preview =
        entry.value.length > 60
          ? entry.value.slice(0, 60) + "…"
          : entry.value;

      btn.innerHTML = `
        <span class="entry-size">${formatBytes(entry.size)}</span>
        <span class="entry-key">${escapeHtml(entry.key)}</span>
        <span class="entry-preview">${escapeHtml(preview)}</span>
      `;

      btn.addEventListener("click", () => selectEntry(entry.key));
      li.appendChild(btn);
      els.entryList.appendChild(li);
    });
  }

  function selectEntry(key) {
    selectedKey = key;
    const entry = entries.find((e) => e.key === key);
    if (!entry) return;

    els.detailPlaceholder.classList.add("hidden");
    els.detail.classList.remove("hidden");

    els.detailKey.textContent = entry.key;
    els.detailSize.textContent = formatBytes(entry.size);
    els.detailType.textContent = detectType(entry.value);
    els.detailValue.innerHTML = formatDisplayValue(entry.value);
    els.detailRaw.textContent = entry.value;

    els.entryList.querySelectorAll(".entry-item").forEach((btn) => {
      btn.setAttribute("aria-selected", btn.dataset.key === key);
    });
  }

  function clearDetail() {
    selectedKey = null;
    els.detail.classList.add("hidden");
    els.detailPlaceholder.classList.remove("hidden");
  }

  function refresh() {
    entries = readStorage();
    renderStats(entries);
    applyFilters();
  }

  function applyFilters() {
    const query = els.search.value;
    const mode = els.sort.value;
    const filtered = sortEntries(filterEntries(entries, query), mode);
    renderList(filtered);

    if (selectedKey && !filtered.some((e) => e.key === selectedKey)) {
      if (filtered.length) selectEntry(filtered[0].key);
      else clearDetail();
    } else if (selectedKey) {
      selectEntry(selectedKey);
    }
  }

  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2000);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("クリップボードにコピーしました");
    } catch {
      showToast("コピーに失敗しました");
    }
  }

  function confirm(message) {
    return new Promise((resolve) => {
      els.confirmMessage.textContent = message;
      els.confirmDialog.showModal();
      const form = els.confirmDialog.querySelector("form");
      const onClose = () => {
        form.removeEventListener("close", onClose);
        resolve(els.confirmDialog.returnValue === "confirm");
      };
      form.addEventListener("close", onClose);
    });
  }

  function exportJson() {
    const data = {};
    entries.forEach((e) => {
      data[e.key] = e.value;
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `localstorage-${location.hostname || "export"}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("エクスポートしました");
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        if (typeof data !== "object" || data === null || Array.isArray(data)) {
          throw new Error("オブジェクト形式の JSON が必要です");
        }
        const keys = Object.keys(data);
        if (
          keys.length &&
          !(await confirm(`${keys.length} 件をインポートします。既存のキーは上書きされます。続行しますか？`))
        ) {
          return;
        }
        keys.forEach((key) => {
          const val = data[key];
          localStorage.setItem(
            key,
            typeof val === "string" ? val : JSON.stringify(val)
          );
        });
        refresh();
        showToast(`${keys.length} 件をインポートしました`);
      } catch (err) {
        showToast(`インポート失敗: ${err.message}`);
      }
    };
    reader.readAsText(file);
  }

  async function deleteKey(key) {
    if (!(await confirm(`「${key}」を削除しますか？`))) return;
    localStorage.removeItem(key);
    if (selectedKey === key) clearDetail();
    refresh();
    showToast("削除しました");
  }

  async function clearAll() {
    if (!entries.length) {
      showToast("削除するデータがありません");
      return;
    }
    if (
      !(await confirm(
        `すべての localStorage データ（${entries.length} 件）を削除しますか？この操作は元に戻せません。`
      ))
    ) {
      return;
    }
    localStorage.clear();
    clearDetail();
    refresh();
    showToast("すべて削除しました");
  }

  function init() {
    els.origin.textContent = location.origin;

    $("#btn-refresh").addEventListener("click", refresh);
    $("#btn-export").addEventListener("click", exportJson);
    $("#import-file").addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) importJson(file);
      e.target.value = "";
    });
    $("#btn-clear-all").addEventListener("click", clearAll);

    els.search.addEventListener("input", applyFilters);
    els.sort.addEventListener("change", applyFilters);

    $("#btn-copy-key").addEventListener("click", () => {
      if (selectedKey) copyText(selectedKey);
    });
    $("#btn-copy-value").addEventListener("click", () => {
      const entry = entries.find((e) => e.key === selectedKey);
      if (entry) copyText(entry.value);
    });
    $("#btn-delete").addEventListener("click", () => {
      if (selectedKey) deleteKey(selectedKey);
    });

    els.confirmDialog.querySelector('[value="cancel"]').addEventListener(
      "click",
      () => els.confirmDialog.close("cancel")
    );

    refresh();
  }

  init();
})();
