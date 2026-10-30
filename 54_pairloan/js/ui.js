const el = {};
INPUT_IDS.forEach(id => el[id] = document.getElementById(id));

let latestRows = [];
let latestMeta = null;
let latestParams = null;
let latestLabels = null;

function readParams(){
  return {
    loanTotal: +el.loanTotal.value * 10000,
    loanYears: Math.max(1, +el.loanYears.value),
    baseRate: +el.rate.value / 100,
    rateType: el.rateType.value,
    rateScenario: el.rateScenario.value,
    wifeShare: Math.min(1, Math.max(0, +el.wifeShare.value / 100)),

    kanri0: +el.kanri.value, kanriUp: +el.kanriUp.value / 100,
    parking0: +el.parking.value, parkingUp: +el.parkingUp.value / 100,
    shuzen0: +el.shuzen.value, shuzenUp: +el.shuzenUp.value / 100,
    shuzenStepYear: +el.shuzenStepYear.value,
    shuzenStepRate: +el.shuzenStepRate.value / 100,

    hIncome0: +el.husbandIncome.value,
    hRaise: +el.husbandRaise.value / 100,
    hEvent: el.husbandEvent.value,
    hEventYear: +el.husbandEventYear.value,
    hDrop: +el.husbandDrop.value / 100,

    wIncome0: +el.wifeIncome.value,
    wRaise: +el.wifeRaise.value / 100,
    wLeave: el.wifeLeave.value,
    wLeaveYear: +el.wifeLeaveYear.value,
    wLeaveRate: +el.wifeLeaveRate.value / 100,
    wCare: el.wifeCare.value,
    wCareYear: +el.wifeCareYear.value,

    baseLiving0: +el.baseLiving.value,
    kids: +el.kids.value,
    kidCost: +el.kidCost.value,
    inflation: +el.inflation.value / 100,
    savings: +el.savings.value,

    tempMoneyMode: el.tempMoneyMode.value,
    tempMoneyAmount: +el.tempMoneyAmount.value,
    tempMoneyYear: +el.tempMoneyYear.value,
    tempMoneyMaxCount: +el.tempMoneyMaxCount.value,
  };
}

function readRawParams(){
  const p = {};
  INPUT_IDS.forEach(id => p[id] = el[id].value);
  return p;
}

function readLabels(){
  return {
    rateType: el.rateType.options[el.rateType.selectedIndex].text,
    rateScenario: el.rateScenario.options[el.rateScenario.selectedIndex].text,
    husbandEvent: el.husbandEvent.options[el.husbandEvent.selectedIndex].text,
    wifeLeave: el.wifeLeave.options[el.wifeLeave.selectedIndex].text,
    wifeCare: el.wifeCare.options[el.wifeCare.selectedIndex].text,
    tempMoneyMode: el.tempMoneyMode.options[el.tempMoneyMode.selectedIndex].text,
  };
}

// 個人ごとの最大返済比率（返済÷本人収入）。収入ゼロで返済がある期間は「収入ゼロ期間あり」
function maxLoanRatio(rows, loanKey, incomeKey){
  let max = 0;
  for (const r of rows){
    if (r[loanKey] <= 0) continue;
    if (r[incomeKey] <= 0) return '収入ゼロ期間あり';
    max = Math.max(max, r[loanKey] / r[incomeKey]);
  }
  return `${(max * 100).toFixed(1)}%`;
}

function render(){
  const params = readParams();
  const { rows, failYear, tempMoneyCount, tempMoneyTotal, residual } = simulate(params);

  latestRows = rows;
  latestMeta = { failYear, tempMoneyCount, tempMoneyTotal, residual };
  latestParams = readRawParams();
  latestLabels = readLabels();

  const verdict = document.getElementById('verdict');
  const summary = document.getElementById('summary');
  const tbody = document.querySelector('#tbl tbody');

  const usedTemp = params.tempMoneyMode !== 'none';
  const residualMan = Math.round(residual / 10000).toLocaleString();

  if (failYear === null){
    const minS = Math.min(...rows.map(r => r.savings));
    if (residual > 0){
      verdict.className = 'verdict warn';
      verdict.textContent = `⚠️ 破綻はしないが満期に残債${residualMan}万円の一括返済が必要`;
    } else if (minS < 1000000){
      verdict.className = 'verdict warn';
      verdict.textContent = '⚠️ 返済は可能だが貯金がほぼ底をつく（余裕なし）';
    } else {
      verdict.className = 'verdict ok';
      verdict.textContent = '✅ 完済まで破綻しません';
    }
  } else {
    verdict.className = 'verdict ng';
    verdict.textContent = `❌ ${failYear + 1}年目（${failYear}年後）に破綻`;
    if (residual > 0 && failYear + 1 >= params.loanYears){
      verdict.textContent += `（満期の残債${residualMan}万円の精算を含む）`;
    }
  }
  if (usedTemp){
    verdict.textContent += '（一時金による補填を前提）';
  }

  const lastRow = rows[rows.length - 1];
  const worstRow = rows.reduce((a, b) => a.balance < b.balance ? a : b, rows[0]);
  const minSavings = Math.min(...rows.map(r => r.savings));

  summary.innerHTML = `
    <div class="stat"><div class="k">初年度 月返済</div><div class="v">${Math.round(rows[0].loan).toLocaleString()}円</div></div>
    <div class="stat"><div class="k">初年度 夫の月返済</div><div class="v">${Math.round(rows[0].hLoan).toLocaleString()}円</div></div>
    <div class="stat"><div class="k">初年度 妻の月返済</div><div class="v">${Math.round(rows[0].wLoan).toLocaleString()}円</div></div>
    <div class="stat"><div class="k">夫 最大返済比率</div><div class="v">${maxLoanRatio(rows, 'hLoan', 'hIncome')}</div></div>
    <div class="stat"><div class="k">妻 最大返済比率</div><div class="v">${maxLoanRatio(rows, 'wLoan', 'wIncome')}</div></div>
    <div class="stat"><div class="k">満期時 残債</div><div class="v ${residual > 0 ? 'neg' : ''}">${residualMan}万円</div></div>
    <div class="stat"><div class="k">初年度 住宅関連費計</div><div class="v">${Math.round(rows[0].housing).toLocaleString()}円</div></div>
    <div class="stat"><div class="k">最悪月収支</div><div class="v ${worstRow.balance < 0 ? 'neg' : ''}">${Math.round(worstRow.balance).toLocaleString()}円</div></div>
    <div class="stat"><div class="k">最低貯金残高</div><div class="v ${minSavings < 0 ? 'neg' : ''}">${Math.round(minSavings/10000).toLocaleString()}万円</div></div>
    <div class="stat"><div class="k">最終貯金残高</div><div class="v">${Math.round(lastRow.savings/10000).toLocaleString()}万円</div></div>
    <div class="stat"><div class="k">完済時 月返済</div><div class="v">${Math.round(lastRow.loan).toLocaleString()}円</div></div>
    <div class="stat"><div class="k">一時金 使用回数</div><div class="v">${tempMoneyCount}回</div></div>
    <div class="stat"><div class="k">一時金 合計</div><div class="v">${Math.round(tempMoneyTotal/10000).toLocaleString()}万円</div></div>
  `;

  let html = '';
  for (const r of rows){
    const isFail = failYear !== null && r.y === failYear + 1;
    html += `<tr class="${isFail ? 'fail' : ''}">
      <td class="year">${r.y}</td>
      <td>${r.rate.toFixed(2)}</td>
      <td>${Math.round(r.loan).toLocaleString()}</td>
      <td>${Math.round(r.hLoan).toLocaleString()}</td>
      <td>${Math.round(r.wLoan).toLocaleString()}</td>
      <td class="${r.y === rows.length && residual > 0 ? 'neg' : ''}">${Math.round(r.remaining/10000).toLocaleString()}万</td>
      <td>${Math.round(r.kanri).toLocaleString()}</td>
      <td>${Math.round(r.parking).toLocaleString()}</td>
      <td>${Math.round(r.shuzen).toLocaleString()}</td>
      <td>${Math.round(r.housing).toLocaleString()}</td>
      <td>${Math.round(r.living).toLocaleString()}</td>
      <td>${Math.round(r.hIncome).toLocaleString()}</td>
      <td>${Math.round(r.wIncome).toLocaleString()}</td>
      <td>${Math.round(r.income).toLocaleString()}</td>
      <td class="${r.balance < 0 ? 'neg' : ''}">${Math.round(r.balance).toLocaleString()}</td>
      <td class="${r.tempMoney > 0 ? 'temp-money' : ''}">${r.tempMoney > 0 ? Math.round(r.tempMoney).toLocaleString() : '-'}</td>
      <td class="${r.savings < 0 ? 'neg' : ''}">${Math.round(r.savings/10000).toLocaleString()}万</td>
    </tr>`;
  }
  tbody.innerHTML = html;
}

// イベント登録
INPUT_IDS.forEach(id => {
  const e = el[id];
  if (e){
    e.addEventListener('input', render);
    e.addEventListener('change', render);
  }
});

document.getElementById('btnCsv').addEventListener('click', () => {
  if (!latestMeta) return;
  downloadCsv(latestRows, latestMeta.failYear, latestParams, latestLabels, latestMeta);
});

render();