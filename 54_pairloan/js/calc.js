/** 元利均等返済の月額 */
function monthlyPayment(principal, annualRate, months){
  if (principal <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return principal * r * pow / (pow - 1);
}

/**
 * シミュレーション本体
 * @param {object} p パラメータ（ui.js で入力から構築）
 * @returns {{rows: Array, failYear: number|null, tempMoneyCount: number, tempMoneyTotal: number, residual: number}}
 */
function simulate(p){
  const {
    loanTotal, loanYears, baseRate, rateType, rateScenario, wifeShare,
    kanri0, kanriUp, parking0, parkingUp, shuzen0, shuzenUp,
    shuzenStepYear, shuzenStepRate,
    hIncome0, hRaise, hEvent, hEventYear, hDrop,
    wIncome0, wRaise, wLeave, wLeaveYear, wLeaveRate, wCare, wCareYear,
    baseLiving0, kids, kidCost, inflation, savings: initialSavings,
    tempMoneyMode, tempMoneyAmount, tempMoneyYear, tempMoneyMaxCount
  } = p;

  let savings = initialSavings;

  const kidAges = [];
  for (let i = 0; i < kids; i++) kidAges.push(-i * 2);

  const totalMonths = loanYears * 12;
  let remaining = loanTotal;
  let monthlyPay = monthlyPayment(loanTotal, baseRate, totalMonths);

  // 上昇シナリオの上限は金利3%（現在の金利が3%超ならその水準で据え置き）
  const rateCap = Math.max(baseRate, 0.03);

  function rateAtYear(y){
    if (rateType === 'fixed') return baseRate;
    let r = baseRate;
    if (rateScenario === 'up') r = Math.min(baseRate + y * 0.0025, rateCap);
    else if (rateScenario === 'down') r = Math.max(baseRate - y * 0.001, 0.003);
    else if (rateScenario === 'updown') {
      r = baseRate + Math.sin(y / 3) * 0.005 + (y % 5 === 0 ? 0.002 : 0);
      r = Math.max(r, 0.003);
    }
    else if (rateScenario === 'step') {
      r = Math.min(baseRate + Math.floor(y / 5) * 0.002, rateCap);
    }
    return r;
  }

  const rows = [];
  let failYear = null;
  let tempMoneyCount = 0;
  let tempMoneyTotal = 0;
  let residual = 0;

  for (let y = 0; y < loanYears; y++){
    // 5年ルール：5年ごとに返済額を見直し、125%ルール：直前の返済額の1.25倍が上限
    if (rateType === 'variable' && y > 0 && y % 5 === 0){
      const newRate = rateAtYear(y);
      const newPay = monthlyPayment(remaining, newRate, totalMonths - y * 12);
      monthlyPay = Math.min(newPay, monthlyPay * 1.25);
    }
    const curRate = rateAtYear(y);

    let yearPay = 0;
    let tmpRemaining = remaining;
    for (let m = 0; m < 12; m++){
      const interest = tmpRemaining * curRate / 12;
      let principalPart = monthlyPay - interest;
      if (principalPart < 0) principalPart = 0;
      if (principalPart > tmpRemaining) principalPart = tmpRemaining;
      tmpRemaining -= principalPart;
      yearPay += monthlyPay;
      if (tmpRemaining <= 0) break;
    }
    remaining = Math.max(0, tmpRemaining);
    const monthLoan = yearPay / 12;
    const hLoan = monthLoan * (1 - wifeShare);
    const wLoan = monthLoan * wifeShare;

    // 満期時の残債（125%ルールで返しきれなかった分）は最終年に一括精算する
    if (y + 1 >= loanYears && remaining >= 1) residual = remaining;

    const kanri = kanri0 * Math.pow(1 + kanriUp, y);
    const parking = parking0 * Math.pow(1 + parkingUp, y);

    // 修繕積立金：連続上昇 × 段階的上昇
    const stepCount = shuzenStepYear > 0 ? Math.floor(y / shuzenStepYear) : 0;
    const shuzen = shuzen0
      * Math.pow(1 + shuzenUp, y)
      * Math.pow(1 + shuzenStepRate, stepCount);

    const housing = monthLoan + kanri + parking + shuzen;

    let living = baseLiving0;
    for (const a0 of kidAges){
      living += kidCost * eduFactor(a0 + y);
    }
    living *= Math.pow(1 + inflation, y);

    let hIncome = hIncome0 * Math.pow(1 + hRaise, y);
    if (hEvent !== 'none' && y >= hEventYear){
      if (hEvent === 'perm') hIncome *= (1 - hDrop);
      else if (hEvent === 'temp' && y < hEventYear + 3) hIncome *= (1 - hDrop);
    }

    let wIncome = wIncome0 * Math.pow(1 + wRaise, y);
    const inLeave = (leaveYear) => y >= leaveYear && y < leaveYear + 1;
    if (wLeave === 'one'){
      if (inLeave(wLeaveYear)) wIncome *= wLeaveRate;
    } else if (wLeave === 'two'){
      if (inLeave(wLeaveYear) || inLeave(wLeaveYear + 2)) wIncome *= wLeaveRate;
    }
    if (wCare !== 'none' && y >= wCareYear){
      if (wCare === 'perm') wIncome = 0;
      else if (wCare === 'temp' && y < wCareYear + 1) wIncome = 0;
    }

    const income = hIncome + wIncome;
    const expense = housing + living;
    const balance = income - expense;
    savings += balance * 12;
    if (y + 1 >= loanYears) savings -= residual;

    // --- 一時金ロジック ---
    let tempMoney = 0;
    const savingsBeforeTemp = savings;

    if (savings < 0 && tempMoneyMode !== 'none'){
      const withinLimit = tempMoneyMaxCount === 0 || tempMoneyCount < tempMoneyMaxCount;
      if (withinLimit){
        let inject = 0;
        if (tempMoneyMode === 'auto'){
          inject = -savings;
        } else if (tempMoneyMode === 'fixed'){
          if (y >= tempMoneyYear) inject = Math.min(tempMoneyAmount, -savings);
        }
        if (inject > 0){
          savings += inject;
          tempMoney = inject;
          tempMoneyCount += 1;
          tempMoneyTotal += inject;
        }
      }
    }

    // 破綻判定は「一時金を入れてもマイナス」の場合のみ
    if (savings < 0 && failYear === null) failYear = y;

    rows.push({
      y: y + 1, rate: curRate * 100, loan: monthLoan, hLoan, wLoan, remaining,
      kanri, parking, shuzen, housing, living,
      hIncome, wIncome, income, balance,
      tempMoney, savingsBeforeTemp,
      savings
    });
  }

  return { rows, failYear, tempMoneyCount, tempMoneyTotal, residual };
}