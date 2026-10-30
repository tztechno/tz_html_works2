// 入力要素のID一覧（UIとCSV出力で共有）
const INPUT_IDS = [
  'loanTotal','loanYears','rate','rateType','rateScenario','wifeShare',
  'kanri','kanriUp','parking','parkingUp','shuzen','shuzenUp',
  'shuzenStepYear','shuzenStepRate',
  'husbandIncome','husbandRaise','husbandEvent','husbandEventYear','husbandDrop',
  'wifeIncome','wifeRaise','wifeLeave','wifeLeaveYear','wifeLeaveRate','wifeCare','wifeCareYear',
  'baseLiving','kids','kidCost','inflation','savings',
  'tempMoneyMode','tempMoneyAmount','tempMoneyYear','tempMoneyMaxCount'
];

// 教育費の年齢係数
function eduFactor(childAge){
  if (childAge < 0) return 0;
  if (childAge < 6) return 0.5;
  if (childAge < 12) return 0.7;
  if (childAge < 15) return 1.0;
  if (childAge < 18) return 1.6;
  if (childAge < 22) return 3.0;
  return 0;
}