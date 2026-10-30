function csvEscape(v){
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function toCsvLine(arr){ return arr.map(csvEscape).join(','); }

/**
 * CSVを生成してダウンロード
 * @param {Array} rows シミュレーション結果
 * @param {number|null} failYear
 * @param {object} params パラメータ表示用
 * @param {object} labels セレクト表示名
 * @param {object} meta 追加メタ（tempMoneyCount, tempMoneyTotal）
 */
function downloadCsv(rows, failYear, params, labels, meta){
  if (!rows.length) return;

  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const lines = [];
  lines.push(toCsvLine(['ペアローン返済シミュレーション結果']));
  lines.push(toCsvLine(['出力日時', `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`]));
  lines.push(toCsvLine(['判定', failYear !== null ? `${failYear+1}年目（${failYear}年後）に破綻` : '完済まで破綻なし']));
  if (meta){
    lines.push(toCsvLine(['一時金 使用回数', meta.tempMoneyCount]));
    lines.push(toCsvLine(['一時金 合計額（円）', Math.round(meta.tempMoneyTotal)]));
    lines.push(toCsvLine(['満期時 残債（円）', Math.round(meta.residual)]));
  }
  lines.push('');

  lines.push(toCsvLine(['【設定パラメータ】','値']));
  const paramLines = [
    ['借入額（万円）', params.loanTotal],
    ['返済期間（年）', params.loanYears],
    ['現在の金利（%）', params.rate],
    ['金利タイプ', labels.rateType],
    ['金利変動シナリオ', labels.rateScenario],
    ['妻の返済負担割合（%）', params.wifeShare],
    ['管理費（円/月）', params.kanri],
    ['管理費 年間上昇率（%）', params.kanriUp],
    ['駐車場代（円/月）', params.parking],
    ['駐車場 年間上昇率（%）', params.parkingUp],
    ['修繕積立金（円/月）', params.shuzen],
    ['修繕積立 年間上昇率（%）', params.shuzenUp],
    ['段階値上げ（何年ごと）', params.shuzenStepYear],
    ['段階値上げ率（%/回）', params.shuzenStepRate],
    ['夫 現在の月収（円）', params.husbandIncome],
    ['夫 昇給率（%/年）', params.husbandRaise],
    ['夫 収入減少イベント', labels.husbandEvent],
    ['夫 減少開始（年後）', params.husbandEventYear],
    ['夫 減少率（%）', params.husbandDrop],
    ['妻 現在の月収（円）', params.wifeIncome],
    ['妻 昇給率（%/年）', params.wifeRaise],
    ['妻 産休・育休イベント', labels.wifeLeave],
    ['妻 休業開始（年後）', params.wifeLeaveYear],
    ['妻 休業中の収入率（%）', params.wifeLeaveRate],
    ['妻 介護離職イベント', labels.wifeCare],
    ['妻 介護開始（年後）', params.wifeCareYear],
    ['基本生活費（円/月）', params.baseLiving],
    ['子供の人数', params.kids],
    ['子供1人あたり教育費（円/月・平均）', params.kidCost],
    ['物価上昇率（%/年）', params.inflation],
    ['現在の預貯金（円）', params.savings],
    ['一時金モード', labels.tempMoneyMode],
    ['一時金額（円）', params.tempMoneyAmount],
    ['一時金 開始（年後）', params.tempMoneyYear],
    ['一時金 上限回数', params.tempMoneyMaxCount],
  ];
  for (const [k, v] of paramLines) lines.push(toCsvLine([k, v]));
  lines.push('');

  lines.push(toCsvLine(['【年次シミュレーション】']));
  lines.push(toCsvLine([
    '年','金利(%)','ローン返済(円/月)','夫返済(円/月)','妻返済(円/月)','年末ローン残高(円)','管理費(円/月)','駐車場(円/月)','修繕積立(円/月)',
    '住宅関連費計(円/月)','生活費(円/月)','夫収入(円/月)','妻収入(円/月)','収入計(円/月)',
    '月収支(円)','一時金(円)','一時金注入前貯金(円)','貯金残高(円)'
  ]));
  for (const r of rows){
    lines.push(toCsvLine([
      r.y, r.rate.toFixed(2),
      Math.round(r.loan), Math.round(r.hLoan), Math.round(r.wLoan), Math.round(r.remaining), Math.round(r.kanri), Math.round(r.parking), Math.round(r.shuzen),
      Math.round(r.housing), Math.round(r.living),
      Math.round(r.hIncome), Math.round(r.wIncome), Math.round(r.income),
      Math.round(r.balance),
      Math.round(r.tempMoney),
      Math.round(r.savingsBeforeTemp),
      Math.round(r.savings)
    ]));
  }

  const bom = '\uFEFF';
  const csv = bom + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `pairloan_simulation_${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}