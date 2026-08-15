(function(){
  "use strict";
  var DEFAULT_RAW = [{"date": "2026-04-23", "o": 59880.01, "h": 60298.44, "l": 58393.43, "c": 58940.94, "v": 181894}, {"date": "2026-04-24", "o": 58940.94, "h": 60182.44, "l": 58902.95, "c": 60062.46, "v": 75951}, {"date": "2026-04-27", "o": 60062.46, "h": 61005.52, "l": 59706.02, "c": 60241.04, "v": 55069}, {"date": "2026-04-28", "o": 60241.04, "h": 60546.31, "l": 58933.8, "c": 59073.8, "v": 74072}, {"date": "2026-04-29", "o": 59073.8, "h": 59576.02, "l": 58633.51, "c": 58686.0, "v": 72919}, {"date": "2026-04-30", "o": 58686.0, "h": 59942.17, "l": 58670.18, "c": 59792.19, "v": 173328}, {"date": "2026-05-01", "o": 59792.19, "h": 59957.23, "l": 59142.72, "c": 59352.71, "v": 40760}, {"date": "2026-05-04", "o": 59352.71, "h": 60085.58, "l": 59170.59, "c": 59530.58, "v": 74432}, {"date": "2026-05-05", "o": 59530.58, "h": 60796.76, "l": 59357.26, "c": 60786.76, "v": 40162}, {"date": "2026-05-06", "o": 60786.76, "h": 62420.48, "l": 60703.49, "c": 62172.99, "v": 74856}, {"date": "2026-05-07", "o": 62172.99, "h": 63431.66, "l": 61779.66, "c": 62181.68, "v": 89955}, {"date": "2026-05-08", "o": 62181.68, "h": 63783.55, "l": 62029.04, "c": 63709.06, "v": 76551}, {"date": "2026-05-11", "o": 63709.06, "h": 63882.43, "l": 62417.42, "c": 62962.42, "v": 62877}, {"date": "2026-05-12", "o": 62962.42, "h": 63313.89, "l": 61838.87, "c": 62571.38, "v": 93687}, {"date": "2026-05-13", "o": 62571.38, "h": 63554.92, "l": 62300.42, "c": 63545.42, "v": 59243}, {"date": "2026-05-14", "o": 63545.42, "h": 63910.89, "l": 62601.37, "c": 63103.38, "v": 65853}, {"date": "2026-05-15", "o": 63103.38, "h": 63342.4, "l": 61042.89, "c": 61729.89, "v": 115406}, {"date": "2026-05-18", "o": 61729.89, "h": 61916.74, "l": 60467.24, "c": 61544.25, "v": 152862}, {"date": "2026-05-19", "o": 61544.25, "h": 61715.73, "l": 60015.72, "c": 60628.24, "v": 143199}, {"date": "2026-05-20", "o": 60628.24, "h": 61614.72, "l": 59385.2, "c": 61304.72, "v": 139242}, {"date": "2026-05-21", "o": 61304.72, "h": 62406.24, "l": 61066.25, "c": 62138.73, "v": 103295}, {"date": "2026-05-22", "o": 62138.73, "h": 63851.65, "l": 62107.13, "c": 63381.64, "v": 74964}, {"date": "2026-05-25", "o": 63381.64, "h": 65739.75, "l": 63381.64, "c": 65550.24, "v": 45089}, {"date": "2026-05-26", "o": 65550.24, "h": 65730.41, "l": 64695.92, "c": 65585.41, "v": 76073}, {"date": "2026-05-27", "o": 65585.41, "h": 66571.76, "l": 64822.24, "c": 65331.76, "v": 81871}, {"date": "2026-05-28", "o": 65331.76, "h": 65970.52, "l": 63953.53, "c": 65855.53, "v": 174608}, {"date": "2026-05-29", "o": 65855.53, "h": 66724.39, "l": 65614.89, "c": 66284.9, "v": 73419}, {"date": "2026-06-01", "o": 66284.9, "h": 67685.46, "l": 66113.44, "c": 67305.44, "v": 81518}, {"date": "2026-06-02", "o": 67305.44, "h": 67669.16, "l": 65639.65, "c": 67569.14, "v": 79528}, {"date": "2026-06-03", "o": 67569.14, "h": 68853.02, "l": 66916.03, "c": 68175.51, "v": 86565}, {"date": "2026-06-04", "o": 68175.51, "h": 68175.51, "l": 66986.59, "c": 67686.58, "v": 208226}, {"date": "2026-06-05", "o": 67686.58, "h": 67728.57, "l": 63548.56, "c": 63778.07, "v": 168189}, {"date": "2026-06-08", "o": 63778.07, "h": 65977.19, "l": 63462.69, "c": 65529.7, "v": 232895}, {"date": "2026-06-09", "o": 65529.7, "h": 66176.18, "l": 63164.17, "c": 64513.67, "v": 277991}, {"date": "2026-06-10", "o": 64513.67, "h": 65159.78, "l": 63180.28, "c": 63274.76, "v": 277298}, {"date": "2026-06-11", "o": 63274.76, "h": 66667.99, "l": 62403.01, "c": 66452.49, "v": 512630}, {"date": "2026-06-12", "o": 66452.49, "h": 67487.51, "l": 65913.0, "c": 67335.0, "v": 223712}, {"date": "2026-06-15", "o": 67335.0, "h": 69857.51, "l": 67335.0, "c": 69727.51, "v": 123292}, {"date": "2026-06-16", "o": 69727.51, "h": 70107.51, "l": 69077.99, "c": 69102.49, "v": 120014}, {"date": "2026-06-17", "o": 69102.49, "h": 71002.51, "l": 68857.99, "c": 69962.5, "v": 148777}, {"date": "2026-06-18", "o": 69962.5, "h": 72220.01, "l": 69782.99, "c": 71975.0, "v": 302558}, {"date": "2026-06-19", "o": 71975.0, "h": 72323.0, "l": 70808.01, "c": 72003.0, "v": 89534}, {"date": "2026-06-22", "o": 72003.0, "h": 73792.49, "l": 71233.0, "c": 73122.99, "v": 115281}, {"date": "2026-06-23", "o": 73122.99, "h": 73262.99, "l": 68472.99, "c": 69360.0, "v": 249246}, {"date": "2026-06-24", "o": 69360.0, "h": 71169.99, "l": 68642.99, "c": 71150.01, "v": 295776}, {"date": "2026-06-25", "o": 71150.01, "h": 72782.51, "l": 70837.99, "c": 71325.0, "v": 496532}, {"date": "2026-06-26", "o": 71325.0, "h": 71788.01, "l": 68852.99, "c": 69619.99, "v": 315216}, {"date": "2026-06-29", "o": 69619.99, "h": 70924.39, "l": 68257.38, "c": 70721.88, "v": 219371}, {"date": "2026-06-30", "o": 70721.88, "h": 71461.25, "l": 69534.24, "c": 71073.75, "v": 128460}, {"date": "2026-07-01", "o": 71073.75, "h": 72184.28, "l": 69589.29, "c": 69694.27, "v": 158814}, {"date": "2026-07-02", "o": 69694.27, "h": 70125.39, "l": 67665.87, "c": 68400.39, "v": 539868}, {"date": "2026-07-03", "o": 68400.39, "h": 70095.7, "l": 67826.18, "c": 69900.68, "v": 122414}, {"date": "2026-07-06", "o": 69900.68, "h": 70579.92, "l": 69014.9, "c": 70321.91, "v": 139222}, {"date": "2026-07-07", "o": 70321.91, "h": 70368.98, "l": 67466.96, "c": 67646.98, "v": 170861}, {"date": "2026-07-08", "o": 67646.98, "h": 68625.82, "l": 65493.31, "c": 67733.31, "v": 252139}, {"date": "2026-07-09", "o": 67733.31, "h": 69147.67, "l": 67537.65, "c": 69112.67, "v": 266670}, {"date": "2026-07-10", "o": 69112.67, "h": 69560.39, "l": 68275.87, "c": 69360.38, "v": 101944}, {"date": "2026-07-13", "o": 69360.38, "h": 69360.38, "l": 66802.2, "c": 67154.19, "v": 158038}, {"date": "2026-07-14", "o": 67154.19, "h": 68808.96, "l": 66413.95, "c": 68285.95, "v": 175382}, {"date": "2026-07-15", "o": 68285.95, "h": 68979.48, "l": 67149.46, "c": 67736.96, "v": 103041}, {"date": "2026-07-16", "o": 67736.96, "h": 67972.38, "l": 65785.36, "c": 66007.37, "v": 295402}, {"date": "2026-07-17", "o": 66007.37, "h": 66015.26, "l": 62865.25, "c": 65175.25, "v": 212762}, {"date": "2026-07-20", "o": 65175.25, "h": 66056.59, "l": 64679.57, "c": 65179.08, "v": 152959}, {"date": "2026-07-21", "o": 65179.08, "h": 67403.31, "l": 64386.3, "c": 67290.81, "v": 147186}, {"date": "2026-07-22", "o": 67290.81, "h": 67732.22, "l": 65675.24, "c": 66392.24, "v": 147477}, {"date": "2026-07-23", "o": 66392.24, "h": 67156.63, "l": 65076.11, "c": 65521.12, "v": 333876}, {"date": "2026-07-24", "o": 65521.12, "h": 65787.51, "l": 64288.01, "c": 64435.01, "v": 230359}, {"date": "2026-07-27", "o": 64435.01, "h": 65790.07, "l": 63460.55, "c": 63975.06, "v": 223704}, {"date": "2026-07-28", "o": 63975.06, "h": 64046.88, "l": 61996.87, "c": 62491.39, "v": 253315}, {"date": "2026-07-29", "o": 62491.39, "h": 63351.4, "l": 60596.9, "c": 61081.9, "v": 369589}, {"date": "2026-07-30", "o": 61081.9, "h": 63929.62, "l": 61079.61, "c": 63759.12, "v": 289695}, {"date": "2026-07-31", "o": 63759.12, "h": 65587.4, "l": 63607.88, "c": 64037.88, "v": 80943}];
  var DEFAULT_NAME = "JPN225_3d.csv";
  var SVGNS = "http://www.w3.org/2000/svg";
  var ROWS = [], STATS = null, N = 0;
  var REQUIRED_COLS = ['datetime','open','high','low','close','volume'];

  function nf(v, d){ if(v===null||v===undefined||isNaN(v)) return "–"; return v.toLocaleString('ja-JP',{minimumFractionDigits:d||0, maximumFractionDigits:d||0}); }
  function sf(v, d){ if(v===null||v===undefined||isNaN(v)) return "–"; var s = v.toLocaleString('ja-JP',{minimumFractionDigits:d||0, maximumFractionDigits:d||0}); return (v>0?"+":"") + s; }
  function fmtDate(iso){ var p = iso.split('-'); return p[1]+"/"+p[2]; }
  function fmtDateLong(iso){ var p = iso.split('-'); return p[0]+"年"+parseInt(p[1],10)+"月"+parseInt(p[2],10)+"日"; }

  function el(tag, attrs, parent){
    var e = document.createElementNS(SVGNS, tag);
    if(attrs){ for(var k in attrs){ e.setAttribute(k, attrs[k]); } }
    if(parent) parent.appendChild(e);
    return e;
  }

  function niceStep(rough){
    var pow = Math.pow(10, Math.floor(Math.log10(rough)));
    var n = rough/pow;
    var step;
    if(n<1.5) step=1; else if(n<3) step=2; else if(n<7) step=5; else step=10;
    return step*pow;
  }
  function niceTicks(min, max, count){
    if(min===max){ min-=1; max+=1; }
    var step = niceStep((max-min)/Math.max(1,count-1));
    var start = Math.ceil(min/step)*step;
    var ticks = [];
    for(var v=start; v<=max+1e-9; v+=step){ ticks.push(Math.round(v*1000)/1000); }
    if(ticks.length===0) ticks.push(min);
    return {ticks:ticks, step:step};
  }
  function round(v,d){ var p=Math.pow(10,d); return Math.round(v*p)/p; }

  /* ---------------- CSV parsing (same schema as JPN225_3d.csv) ---------------- */
  function parseCSV(text){
    var lines = String(text).replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').filter(function(l){ return l.trim().length>0; });
    if(lines.length < 3) throw new Error('データ行が不足しています(ヘッダー行 + 2行以上が必要です)');
    var header = lines[0].split(',').map(function(s){ return s.trim().toLowerCase(); });
    var idx = {};
    REQUIRED_COLS.forEach(function(k){ idx[k] = header.indexOf(k); });
    var missing = REQUIRED_COLS.filter(function(k){ return idx[k]===-1; });
    if(missing.length) throw new Error('必要な列が見つかりません: ' + missing.join(', ') + '(見つかった列: ' + header.join(', ') + ')');
    var raw = [];
    for(var i=1;i<lines.length;i++){
      var cols = lines[i].split(',');
      if(cols.length < header.length) continue;
      var dt = (cols[idx.datetime]||'').trim();
      var o = parseFloat(cols[idx.open]), h = parseFloat(cols[idx.high]), l = parseFloat(cols[idx.low]), c = parseFloat(cols[idx.close]), v = parseFloat(cols[idx.volume]);
      if(!dt || [o,h,l,c,v].some(function(x){ return isNaN(x); })) continue;
      raw.push({date: dt.slice(0,10), o:o, h:h, l:l, c:c, v: Math.round(v)});
    }
    if(raw.length < 2) throw new Error('数値として読み取れる有効なデータ行が2行未満です');
    raw.sort(function(a,b){ return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    return raw;
  }

  /* ---------------- Derived EDA fields (ported from the original Python pass) ---------------- */
  function computeDerived(raw){
    var closes = raw.map(function(r){ return r.c; });
    function sma(period, i){
      if(i+1 < period) return null;
      var sum = 0;
      for(var k=i+1-period; k<=i; k++) sum += closes[k];
      return sum/period;
    }
    var peak = closes[0];
    var rows = raw.map(function(r, i){
      var ret = i===0 ? null : (r.c - closes[i-1]) / closes[i-1] * 100;
      var cumret = (r.c/closes[0] - 1) * 100;
      if(r.c > peak) peak = r.c;
      var dd = (r.c - peak) / peak * 100;
      var range_pct = (r.h - r.l) / r.o * 100;
      var ma5 = sma(5,i), ma10 = sma(10,i);
      return {
        date: r.date, o:r.o, h:r.h, l:r.l, c:r.c, v:r.v,
        ret: ret===null ? null : round(ret,4),
        cumret: round(cumret,4),
        ma5: ma5===null ? null : round(ma5,2),
        ma10: ma10===null ? null : round(ma10,2),
        dd: round(dd,4),
        range_pct: round(range_pct,4)
      };
    });
    var rets = rows.map(function(r){ return r.ret; }).filter(function(v){ return v!==null; });
    var vols = rows.map(function(r){ return r.v; });
    function mean(arr){ return arr.reduce(function(a,b){ return a+b; },0)/arr.length; }
    function std(arr){ var m=mean(arr); return Math.sqrt(arr.reduce(function(a,b){ return a+(b-m)*(b-m); },0)/(arr.length-1)); }
    function median(arr){ var s=arr.slice().sort(function(a,b){ return a-b; }); var n=s.length; return n%2 ? s[(n-1)/2] : (s[n/2-1]+s[n/2])/2; }
    var stats = {
      n: rows.length,
      date_start: rows[0].date,
      date_end: rows[rows.length-1].date,
      price_start: rows[0].c,
      price_end: rows[rows.length-1].c,
      price_min: Math.min.apply(null, rows.map(function(r){ return r.l; })),
      price_max: Math.max.apply(null, rows.map(function(r){ return r.h; })),
      total_return_pct: round((rows[rows.length-1].c/rows[0].c - 1)*100, 2),
      mean_ret_pct: round(mean(rets),4),
      std_ret_pct: round(std(rets),4),
      max_ret_pct: round(Math.max.apply(null, rets),4),
      min_ret_pct: round(Math.min.apply(null, rets),4),
      up_days: rets.filter(function(x){ return x>0; }).length,
      down_days: rets.filter(function(x){ return x<0; }).length,
      max_drawdown_pct: round(Math.min.apply(null, rows.map(function(r){ return r.dd; })), 2),
      avg_volume: Math.round(mean(vols)),
      median_volume: Math.round(median(vols)),
      max_volume: Math.max.apply(null, vols),
      min_volume: Math.min.apply(null, vols),
      avg_range_pct: round(mean(rows.map(function(r){ return r.range_pct; })), 4)
    };
    return {rows: rows, stats: stats};
  }

  function deriveTicker(filename){
    var base = String(filename).replace(/\.[^.]+$/, '');
    var first = base.split(/[_\-\s]+/)[0];
    return (first && first.length>=2 && first.length<=12) ? first.toUpperCase() : base;
  }
  function inferIntervalLabel(rows){
    if(rows.length<2) return 'OHLCV';
    var diffs = [];
    for(var i=1;i<rows.length;i++){
      var d0 = new Date(rows[i-1].date), d1 = new Date(rows[i].date);
      var diff = Math.round((d1-d0)/86400000);
      if(diff>0) diffs.push(diff);
    }
    if(!diffs.length) return 'OHLCV';
    diffs.sort(function(a,b){ return a-b; });
    var med = diffs[Math.floor(diffs.length/2)];
    if(med<=1) return '日足 OHLCV';
    if(med>=6 && med<=9) return '週足 OHLCV';
    if(med>=27 && med<=32) return '月足 OHLCV';
    return med + '日足 OHLCV';
  }

  /* ---------------- Tooltip ---------------- */
  var tip = document.getElementById('tooltip');
  function showTip(clientX, clientY, title, rows){
    while(tip.firstChild) tip.removeChild(tip.firstChild);
    var t = document.createElement('div'); t.className='t-title'; t.textContent = title; tip.appendChild(t);
    rows.forEach(function(r){
      var row = document.createElement('div'); row.className='t-row';
      var k = document.createElement('span'); k.className='k'; k.textContent = r[0];
      var v = document.createElement('span'); v.className='v'; v.textContent = r[1];
      if(r[2]) v.style.color = r[2];
      row.appendChild(k); row.appendChild(v);
      tip.appendChild(row);
    });
    tip.style.opacity = '1';
    positionTip(clientX, clientY);
  }
  function positionTip(clientX, clientY){
    var pad = 14;
    var vw = window.innerWidth, vh = window.innerHeight;
    var tw = tip.offsetWidth || 180, th = tip.offsetHeight || 60;
    var x = clientX + pad, y = clientY + pad;
    if(x + tw > vw - 8) x = clientX - tw - pad;
    if(y + th > vh - 8) y = clientY - th - pad;
    tip.style.transform = 'translate(' + Math.max(8,x) + 'px,' + Math.max(8,y) + 'px)';
  }
  function hideTip(){ tip.style.opacity = '0'; tip.style.transform = 'translate(-9999px,-9999px)'; }

  function svgPointX(svg, clientX, vbw){
    var rect = svg.getBoundingClientRect();
    var ratio = (clientX - rect.left) / rect.width;
    return ratio * vbw;
  }

  /* ================= KPI row ================= */
  function buildKPI(){
    var host = document.getElementById('kpi-row');
    var upRate = STATS.up_days/(STATS.up_days+STATS.down_days)*100;
    var items = [
      { label:'終値(直近)', value: nf(STATS.price_end,2), delta: sf(STATS.total_return_pct,2)+'%', dir: STATS.total_return_pct>=0?'up':'down', foot:'期間開始比' },
      { label:'期間騰落率', value: sf(STATS.total_return_pct,2)+'%', delta: nf(STATS.price_start,0)+' → '+nf(STATS.price_end,0), dir: STATS.total_return_pct>=0?'up':'down', foot:'始値→終値', plain:true },
      { label:'最大ドローダウン', value: nf(STATS.max_drawdown_pct,2)+'%', delta:'高値からの最大下落', dir:'down', foot:'期間内ピークからの下落率' },
      { label:'ボラティリティ', value: nf(STATS.std_ret_pct,2)+'%', delta:'平均 '+sf(STATS.mean_ret_pct,2)+'%', dir:'flat', foot:'1本あたりリターンの標準偏差' },
      { label:'上昇/下落', value: STATS.up_days+' / '+STATS.down_days, delta: nf(upRate,0)+'% が上昇', dir: upRate>=50?'up':'down', foot:'バー単位の本数' },
      { label:'平均出来高', value: nf(STATS.avg_volume,0), delta:'中央値 '+nf(STATS.median_volume,0), dir:'flat', foot:'1本あたり出来高' }
    ];
    items.forEach(function(it){
      var card = document.createElement('div'); card.className='kpi';
      var l = document.createElement('div'); l.className='label'; l.textContent = it.label;
      var v = document.createElement('div'); v.className='value num'; v.textContent = it.value;
      var d = document.createElement('div'); d.className='delta '+it.dir; d.textContent = (it.plain?'':(it.dir==='up'?'▲ ':it.dir==='down'?'▼ ':'')) + it.delta;
      var f = document.createElement('div'); f.className='foot'; f.textContent = it.foot;
      card.appendChild(l); card.appendChild(v); card.appendChild(d); card.appendChild(f);
      host.appendChild(card);
    });
  }

  /* ================= Price + Volume (linked) ================= */
  function buildPriceVolume(){
    var svgP = document.getElementById('price-svg');
    var svgV = document.getElementById('vol-svg');
    var VBW = 1000;
    var mP = {top:14, right:14, bottom:10, left:60};
    var mV = {top:8, right:14, bottom:30, left:60};
    var Hp = 380, Hv = 150;
    var plotWp = VBW - mP.left - mP.right, plotHp = Hp - mP.top - mP.bottom;
    var plotWv = VBW - mV.left - mV.right, plotHv = Hv - mV.top - mV.bottom;

    var lo = Math.min.apply(null, ROWS.map(function(r){return r.l;}));
    var hi = Math.max.apply(null, ROWS.map(function(r){return r.h;}));
    var pad = (hi-lo)*0.06;
    var yMin = lo-pad, yMax = hi+pad;
    var volMax = Math.max.apply(null, ROWS.map(function(r){return r.v;}));

    function xAt(i){ return mP.left + (N===1?0:(i/(N-1))*plotWp); }
    function yP(v){ return mP.top + (1-(v-yMin)/(yMax-yMin))*plotHp; }
    function yV(v){ return mV.top + (1-(v/volMax))*plotHv; }

    var spacing = plotWp/N;
    var candleW = Math.max(2, Math.min(9, spacing*0.62));

    /* --- grid + y axis (price) --- */
    var ty = niceTicks(yMin, yMax, 5);
    ty.ticks.forEach(function(t){
      el('line', {x1:mP.left, x2:VBW-mP.right, y1:yP(t), y2:yP(t), class:'grid-line'}, svgP);
      var lab = el('text', {x:mP.left-8, y:yP(t)+3.5, class:'axis-label num', 'text-anchor':'end'}, svgP);
      lab.textContent = nf(t,0);
    });
    el('line', {x1:mP.left, x2:VBW-mP.right, y1:mP.top, y2:mP.top, class:'grid-line', opacity:0}, svgP);

    /* --- MA lines --- */
    function pathFor(key, color){
      var d = "";
      var started = false;
      for(var i=0;i<N;i++){
        var v = ROWS[i][key];
        if(v===null||v===undefined){ started=false; continue; }
        var x = xAt(i), y = yP(v);
        d += (started ? "L" : "M") + x.toFixed(2) + "," + y.toFixed(2) + " ";
        started = true;
      }
      return d;
    }
    el('path', {d: pathFor('ma10','var(--series-3)'), fill:'none', stroke:'var(--series-3)', 'stroke-width':2, 'stroke-linejoin':'round', 'stroke-linecap':'round'}, svgP);
    el('path', {d: pathFor('ma5','var(--series-2)'), fill:'none', stroke:'var(--series-2)', 'stroke-width':2, 'stroke-linejoin':'round', 'stroke-linecap':'round'}, svgP);

    /* --- candles --- */
    ROWS.forEach(function(r,i){
      var x = xAt(i);
      var up = r.c >= r.o;
      var color = up ? 'var(--good)' : 'var(--critical)';
      el('line', {x1:x, x2:x, y1:yP(r.h), y2:yP(r.l), stroke:color, 'stroke-width':1.4}, svgP);
      var yOpen = yP(r.o), yClose = yP(r.c);
      var bodyY = Math.min(yOpen,yClose), bodyH = Math.max(1, Math.abs(yOpen-yClose));
      el('rect', {x:x-candleW/2, y:bodyY, width:candleW, height:bodyH, fill:color}, svgP);
    });

    /* extreme labels */
    var hiIdx = ROWS.reduce(function(b,r,i){return r.h>ROWS[b].h?i:b;},0);
    var loIdx = ROWS.reduce(function(b,r,i){return r.l<ROWS[b].l?i:b;},0);
    var hiLab = el('text', {x:xAt(hiIdx), y:yP(ROWS[hiIdx].h)-8, class:'axis-label num', 'text-anchor':'middle', fill:'var(--ink-soft)'}, svgP);
    hiLab.textContent = '高 '+nf(ROWS[hiIdx].h,0);
    var loLab = el('text', {x:xAt(loIdx), y:yP(ROWS[loIdx].l)+16, class:'axis-label num', 'text-anchor':'middle', fill:'var(--ink-soft)'}, svgP);
    loLab.textContent = '安 '+nf(ROWS[loIdx].l,0);

    /* --- volume bars --- */
    var tv = niceTicks(0, volMax, 3);
    tv.ticks.forEach(function(t){
      el('line', {x1:mV.left, x2:VBW-mV.right, y1:yV(t), y2:yV(t), class:'grid-line'}, svgV);
      var lab = el('text', {x:mV.left-8, y:yV(t)+3.5, class:'axis-label num', 'text-anchor':'end'}, svgV);
      lab.textContent = t>=1000 ? Math.round(t/1000)+'k' : nf(t,0);
    });
    ROWS.forEach(function(r,i){
      var x = xAt(i);
      var up = r.c >= r.o;
      var color = up ? 'var(--good)' : 'var(--critical)';
      var h = plotHv - (yV(r.v) - mV.top);
      el('rect', {x:x-candleW/2, y:yV(r.v), width:candleW, height:Math.max(1,h), fill:color, opacity:0.72}, svgV);
    });
    /* x-axis dates on volume panel */
    var step = Math.max(1, Math.round(N/7));
    for(var i=0;i<N;i+=step){
      var lab = el('text', {x:xAt(i), y:Hv-10, class:'axis-label', 'text-anchor':'middle'}, svgV);
      lab.textContent = fmtDate(ROWS[i].date);
    }
    var lastLab = el('text', {x:xAt(N-1), y:Hv-10, class:'axis-label', 'text-anchor':'middle'}, svgV);
    lastLab.textContent = fmtDate(ROWS[N-1].date);

    /* --- crosshairs --- */
    var chP = el('line', {x1:0,x2:0,y1:mP.top,y2:Hp-mP.bottom, class:'crosshair'}, svgP);
    var chV = el('line', {x1:0,x2:0,y1:mV.top,y2:Hv-mV.bottom, class:'crosshair'}, svgV);

    function nearestIndex(svgX){
      var i = Math.round((svgX - mP.left) / plotWp * (N-1));
      return Math.max(0, Math.min(N-1, i));
    }
    function onHover(clientX, clientY, svg){
      var svgX = svgPointX(svg, clientX, VBW);
      var i = nearestIndex(svgX);
      var x = xAt(i);
      chP.setAttribute('x1',x); chP.setAttribute('x2',x); chP.style.opacity=1;
      chV.setAttribute('x1',x); chV.setAttribute('x2',x); chV.style.opacity=1;
      var r = ROWS[i];
      var up = r.ret===null ? null : r.ret>=0;
      showTip(clientX, clientY, fmtDateLong(r.date), [
        ['始値', nf(r.o,1)],
        ['高値', nf(r.h,1)],
        ['安値', nf(r.l,1)],
        ['終値', nf(r.c,1)],
        ['騰落率', r.ret===null?'–':sf(r.ret,2)+'%', up===null?null:(up?'var(--good)':'var(--critical)')],
        ['出来高', nf(r.v,0)],
        ['MA5', r.ma5?nf(r.ma5,1):'–'],
        ['MA10', r.ma10?nf(r.ma10,1):'–']
      ]);
    }
    function onLeave(){ chP.style.opacity=0; chV.style.opacity=0; hideTip(); }

    var hitP = el('rect', {x:mP.left, y:0, width:plotWp, height:Hp, class:'hit-rect'}, svgP);
    var hitV = el('rect', {x:mV.left, y:0, width:plotWv, height:Hv, class:'hit-rect'}, svgV);
    [[hitP,svgP],[hitV,svgV]].forEach(function(pair){
      var hit=pair[0], svg=pair[1];
      hit.addEventListener('pointermove', function(e){ onHover(e.clientX, e.clientY, svg); });
      hit.addEventListener('pointerleave', onLeave);
    });
  }

  /* ================= generic single-series line/area chart w/ own crosshair ================= */
  function buildLineChart(opts){
    var svg = document.getElementById(opts.id);
    var VBW = 480, VBH = opts.h;
    var m = {top:14, right:14, bottom:26, left:56};
    var plotW = VBW-m.left-m.right, plotH = VBH-m.top-m.bottom;
    var vals = ROWS.map(function(r){return r[opts.key];});
    var lo = Math.min.apply(null, vals.concat([opts.includeZero?0:vals[0]]));
    var hi = Math.max.apply(null, vals.concat([opts.includeZero?0:vals[0]]));
    var padV = (hi-lo)*0.12 || 1;
    var yMin=lo-padV, yMax=hi+padV;
    function xAt(i){ return m.left + (N===1?0:(i/(N-1))*plotW); }
    function y(v){ return m.top + (1-(v-yMin)/(yMax-yMin))*plotH; }

    var ticks = niceTicks(yMin,yMax,4);
    ticks.ticks.forEach(function(t){
      el('line',{x1:m.left,x2:VBW-m.right,y1:y(t),y2:y(t),class:'grid-line'},svg);
      var lab = el('text',{x:m.left-8,y:y(t)+3.5,class:'axis-label num','text-anchor':'end'},svg);
      lab.textContent = nf(t,1)+'%';
    });
    if(yMin<0 && yMax>0){
      el('line',{x1:m.left,x2:VBW-m.right,y1:y(0),y2:y(0),class:'baseline'},svg);
    }
    var stepX = Math.max(1, Math.round(N/6));
    for(var i=0;i<N;i+=stepX){
      var lab = el('text',{x:xAt(i),y:VBH-8,class:'axis-label','text-anchor':'middle'},svg);
      lab.textContent = fmtDate(ROWS[i].date);
    }
    el('text',{x:xAt(N-1),y:VBH-8,class:'axis-label','text-anchor':'middle'},svg).textContent = fmtDate(ROWS[N-1].date);

    var top = opts.top!==undefined ? opts.top : 0;
    var areaD = "M"+xAt(0).toFixed(2)+","+y(top).toFixed(2)+" ";
    var lineD = "M"+xAt(0).toFixed(2)+","+y(vals[0]).toFixed(2)+" ";
    for(var i=0;i<N;i++){
      areaD += "L"+xAt(i).toFixed(2)+","+y(vals[i]).toFixed(2)+" ";
      if(i>0) lineD += "L"+xAt(i).toFixed(2)+","+y(vals[i]).toFixed(2)+" ";
    }
    areaD += "L"+xAt(N-1).toFixed(2)+","+y(top).toFixed(2)+" Z";
    el('path',{d:areaD, fill:opts.color, opacity:0.10}, svg);
    el('path',{d:lineD, fill:'none', stroke:opts.color, 'stroke-width':2, 'stroke-linejoin':'round','stroke-linecap':'round'}, svg);

    var last = vals[N-1];
    var endColor = last>=0 ? 'var(--good)' : 'var(--critical)';
    el('circle',{cx:xAt(N-1),cy:y(last),r:4.5,fill:endColor,stroke:'var(--surface)','stroke-width':2}, svg);
    var endLab = el('text',{x:xAt(N-1)-8,y:y(last)-10,class:'axis-label num','text-anchor':'end',fill:'var(--ink)'},svg);
    endLab.setAttribute('font-weight','600');
    endLab.textContent = sf(last,2)+'%';

    var ch = el('line',{x1:0,x2:0,y1:m.top,y2:VBH-m.bottom,class:'crosshair'},svg);
    var dot = el('circle',{r:4,fill:opts.color,stroke:'var(--surface)','stroke-width':2,opacity:0},svg);
    function nearestIndex(svgX){
      var i = Math.round((svgX - m.left)/plotW*(N-1));
      return Math.max(0, Math.min(N-1,i));
    }
    var hit = el('rect',{x:m.left,y:0,width:plotW,height:VBH,class:'hit-rect'},svg);
    hit.addEventListener('pointermove', function(e){
      var svgX = svgPointX(svg, e.clientX, VBW);
      var i = nearestIndex(svgX);
      var x = xAt(i);
      ch.setAttribute('x1',x); ch.setAttribute('x2',x); ch.style.opacity=1;
      dot.setAttribute('cx',x); dot.setAttribute('cy',y(vals[i])); dot.style.opacity=1;
      showTip(e.clientX, e.clientY, fmtDateLong(ROWS[i].date), [[opts.label, sf(vals[i],2)+'%']]);
    });
    hit.addEventListener('pointerleave', function(){ ch.style.opacity=0; dot.style.opacity=0; hideTip(); });
  }

  /* ================= Histogram ================= */
  function buildHist(){
    var svg = document.getElementById('hist-svg');
    var VBW=480, VBH=250;
    var m = {top:14, right:14, bottom:34, left:40};
    var plotW=VBW-m.left-m.right, plotH=VBH-m.top-m.bottom;
    var rets = ROWS.map(function(r){return r.ret;}).filter(function(v){return v!==null;});
    var lo = Math.min.apply(null, rets), hi = Math.max.apply(null, rets);
    var bins = 12;
    var span = hi-lo;
    var binW = span/bins;
    var counts = new Array(bins).fill(0);
    rets.forEach(function(v){
      var idx = Math.min(bins-1, Math.floor((v-lo)/binW));
      counts[idx]++;
    });
    var maxCount = Math.max.apply(null, counts);
    function x(i){ return m.left + (i/bins)*plotW; }
    function y(v){ return m.top + (1-v/maxCount)*plotH; }
    var ticksY = niceTicks(0,maxCount,4);
    ticksY.ticks.forEach(function(t){
      el('line',{x1:m.left,x2:VBW-m.right,y1:y(t),y2:y(t),class:'grid-line'},svg);
      el('text',{x:m.left-8,y:y(t)+3.5,class:'axis-label num','text-anchor':'end'},svg).textContent = nf(t,0);
    });
    var gap = 2;
    var zeroX = m.left + ((0-lo)/span)*plotW;
    if(lo<0 && hi>0){
      el('line',{x1:zeroX,x2:zeroX,y1:m.top,y2:VBH-m.bottom,class:'baseline'},svg);
    }
    counts.forEach(function(c,i){
      var binCenter = lo + (i+0.5)*binW;
      var color = binCenter>=0 ? 'var(--good)' : 'var(--critical)';
      var bx = x(i)+gap/2, bw = Math.max(1,(x(i+1)-x(i))-gap);
      var by = y(c), bh = plotH-(y(c)-m.top);
      var rect = el('rect',{x:bx,y:by,width:bw,height:Math.max(0,bh),fill:color,opacity:0.82},svg);
      var hit = el('rect',{x:bx-2,y:m.top,width:bw+4,height:plotH,fill:'transparent',tabindex:0},svg);
      function show(clientX, clientY){
        showTip(clientX, clientY, nf(lo+i*binW,1)+'% 〜 '+nf(lo+(i+1)*binW,1)+'%', [['本数', c+' 本']]);
      }
      hit.addEventListener('pointermove', function(e){ show(e.clientX, e.clientY); });
      hit.addEventListener('pointerleave', hideTip);
      hit.addEventListener('focus', function(){ var r2=hit.getBoundingClientRect(); show(r2.left+r2.width/2, r2.top); });
      hit.addEventListener('blur', hideTip);
    });
    for(var i=0;i<=bins;i+=3){
      el('text',{x:x(i),y:VBH-10,class:'axis-label num','text-anchor':'middle'},svg).textContent = nf(lo+i*binW,0);
    }
  }

  /* ================= Scatter: volume vs |return| ================= */
  function buildScatter(){
    var svg = document.getElementById('scatter-svg');
    var VBW=480, VBH=250;
    var m = {top:14, right:16, bottom:34, left:56};
    var plotW=VBW-m.left-m.right, plotH=VBH-m.top-m.bottom;
    var pts = ROWS.filter(function(r){return r.ret!==null;}).map(function(r){return {v:r.v, ar:Math.abs(r.ret), date:r.date, ret:r.ret};});
    var vMax = Math.max.apply(null, pts.map(function(p){return p.v;}));
    var arMax = Math.max.apply(null, pts.map(function(p){return p.ar;}));
    function x(v){ return m.left + (v/vMax)*plotW; }
    function y(v){ return m.top + (1-v/arMax)*plotH; }
    var tx = niceTicks(0,vMax,4);
    tx.ticks.forEach(function(t){
      el('line',{x1:x(t),x2:x(t),y1:m.top,y2:VBH-m.bottom,class:'grid-line'},svg);
      el('text',{x:x(t),y:VBH-10,class:'axis-label num','text-anchor':'middle'},svg).textContent = t>=1000?Math.round(t/1000)+'k':nf(t,0);
    });
    var ty = niceTicks(0,arMax,4);
    ty.ticks.forEach(function(t){
      el('line',{x1:m.left,x2:VBW-m.right,y1:y(t),y2:y(t),class:'grid-line'},svg);
      el('text',{x:m.left-8,y:y(t)+3.5,class:'axis-label num','text-anchor':'end'},svg).textContent = nf(t,1)+'%';
    });
    pts.forEach(function(p){
      var cx=x(p.v), cy=y(p.ar);
      el('circle',{cx:cx,cy:cy,r:4.5,fill:'var(--accent)',opacity:0.68,stroke:'var(--surface)','stroke-width':1.5},svg);
      var hit = el('circle',{cx:cx,cy:cy,r:12,fill:'transparent',tabindex:0},svg);
      function show(clientX, clientY){
        showTip(clientX, clientY, fmtDateLong(p.date), [
          ['出来高', nf(p.v,0)],
          ['騰落率', sf(p.ret,2)+'%', p.ret>=0?'var(--good)':'var(--critical)']
        ]);
      }
      hit.addEventListener('pointermove', function(e){ show(e.clientX, e.clientY); });
      hit.addEventListener('pointerleave', hideTip);
      hit.addEventListener('focus', function(){ var r2=hit.getBoundingClientRect(); show(r2.left+r2.width/2, r2.top); });
      hit.addEventListener('blur', hideTip);
    });
  }

  /* ================= Bollinger Bands ================= */
  function buildBollinger(){
    var svg = document.getElementById('bb-svg');
    var VBW=1000, VBH=260;
    var m = {top:14, right:16, bottom:28, left:64};
    var plotW=VBW-m.left-m.right, plotH=VBH-m.top-m.bottom;
    var period = Math.min(20, Math.max(2, Math.floor(N/2)));
    var closes = ROWS.map(function(r){ return r.c; });
    var mid=[], upper=[], lower=[];
    for(var i=0;i<N;i++){
      if(i+1<period){ mid.push(null); upper.push(null); lower.push(null); continue; }
      var win = closes.slice(i+1-period, i+1);
      var m0 = win.reduce(function(a,b){ return a+b; },0)/period;
      var sd = Math.sqrt(win.reduce(function(a,b){ return a+(b-m0)*(b-m0); },0)/Math.max(1,period-1));
      mid.push(m0); upper.push(m0+2*sd); lower.push(m0-2*sd);
    }
    var validIdx = []; for(var i=0;i<N;i++){ if(mid[i]!==null) validIdx.push(i); }
    var allVals = closes.slice();
    validIdx.forEach(function(i){ allVals.push(upper[i], lower[i]); });
    var yMin = Math.min.apply(null, allVals), yMax = Math.max.apply(null, allVals);
    var pad = (yMax-yMin)*0.06 || 1;
    yMin -= pad; yMax += pad;
    function xAt(i){ return m.left + (N===1?0:(i/(N-1))*plotW); }
    function y(v){ return m.top + (1-(v-yMin)/(yMax-yMin))*plotH; }

    var ty = niceTicks(yMin,yMax,5);
    ty.ticks.forEach(function(t){
      el('line',{x1:m.left,x2:VBW-m.right,y1:y(t),y2:y(t),class:'grid-line'},svg);
      el('text',{x:m.left-8,y:y(t)+3.5,class:'axis-label num','text-anchor':'end'},svg).textContent = nf(t,0);
    });
    var stepX = Math.max(1, Math.round(N/8));
    for(var i=0;i<N;i+=stepX){ el('text',{x:xAt(i),y:VBH-8,class:'axis-label','text-anchor':'middle'},svg).textContent = fmtDate(ROWS[i].date); }
    el('text',{x:xAt(N-1),y:VBH-8,class:'axis-label','text-anchor':'middle'},svg).textContent = fmtDate(ROWS[N-1].date);

    if(validIdx.length){
      var bandD = "M"+xAt(validIdx[0]).toFixed(2)+","+y(upper[validIdx[0]]).toFixed(2)+" ";
      validIdx.forEach(function(i){ bandD += "L"+xAt(i).toFixed(2)+","+y(upper[i]).toFixed(2)+" "; });
      for(var k2=validIdx.length-1;k2>=0;k2--){ var i2=validIdx[k2]; bandD += "L"+xAt(i2).toFixed(2)+","+y(lower[i2]).toFixed(2)+" "; }
      bandD += "Z";
      el('path',{d:bandD, fill:'var(--series-2)', opacity:0.16}, svg);
      var midD = ""; var started=false;
      validIdx.forEach(function(i){ midD += (started?"L":"M")+xAt(i).toFixed(2)+","+y(mid[i]).toFixed(2)+" "; started=true; });
      el('path',{d:midD, fill:'none', stroke:'var(--series-2)', 'stroke-width':1.6, 'stroke-linejoin':'round'}, svg);
    }
    var closeD = "";
    for(var i=0;i<N;i++){ closeD += (i===0?"M":"L")+xAt(i).toFixed(2)+","+y(closes[i]).toFixed(2)+" "; }
    el('path',{d:closeD, fill:'none', stroke:'var(--accent)', 'stroke-width':2, 'stroke-linejoin':'round', 'stroke-linecap':'round'}, svg);

    var ch = el('line',{x1:0,x2:0,y1:m.top,y2:VBH-m.bottom,class:'crosshair'},svg);
    var hit = el('rect',{x:m.left,y:0,width:plotW,height:VBH,class:'hit-rect'},svg);
    function nearestIndex(svgX){ var i=Math.round((svgX-m.left)/plotW*(N-1)); return Math.max(0,Math.min(N-1,i)); }
    hit.addEventListener('pointermove', function(e){
      var i = nearestIndex(svgPointX(svg, e.clientX, VBW));
      var x = xAt(i);
      ch.setAttribute('x1',x); ch.setAttribute('x2',x); ch.style.opacity=1;
      var rows = [['終値', nf(closes[i],1)]];
      if(mid[i]!==null){ rows.push(['MA'+period, nf(mid[i],1)]); rows.push(['+2σ', nf(upper[i],1)]); rows.push(['-2σ', nf(lower[i],1)]); }
      showTip(e.clientX, e.clientY, fmtDateLong(ROWS[i].date), rows);
    });
    hit.addEventListener('pointerleave', function(){ ch.style.opacity=0; hideTip(); });
  }

  /* ================= Rolling volatility ================= */
  function buildRollingVol(){
    var svg = document.getElementById('rvol-svg');
    var VBW=480, VBH=230;
    var m = {top:14, right:14, bottom:26, left:52};
    var plotW=VBW-m.left-m.right, plotH=VBH-m.top-m.bottom;
    var period = Math.min(10, Math.max(2, Math.floor(N/3)));
    var rets = ROWS.map(function(r){ return r.ret; });
    var rvol = new Array(N).fill(null);
    for(var i=0;i<N;i++){
      if(i+1<period) continue;
      var win = rets.slice(i-period+1, i+1);
      if(win.some(function(v){ return v===null; })) continue;
      var mean = win.reduce(function(a,b){ return a+b; },0)/period;
      var sd = Math.sqrt(win.reduce(function(a,b){ return a+(b-mean)*(b-mean); },0)/Math.max(1,period-1));
      rvol[i]=sd;
    }
    var validIdx=[]; for(var i=0;i<N;i++){ if(rvol[i]!==null) validIdx.push(i); }
    var vals = validIdx.map(function(i){ return rvol[i]; });
    var yMax = vals.length ? Math.max.apply(null, vals)*1.15 : 1;
    function xAt(i){ return m.left+(N===1?0:(i/(N-1))*plotW); }
    function y(v){ return m.top+(1-v/yMax)*plotH; }
    var ty = niceTicks(0,yMax,4);
    ty.ticks.forEach(function(t){
      el('line',{x1:m.left,x2:VBW-m.right,y1:y(t),y2:y(t),class:'grid-line'},svg);
      el('text',{x:m.left-8,y:y(t)+3.5,class:'axis-label num','text-anchor':'end'},svg).textContent = nf(t,1)+'%';
    });
    var stepX = Math.max(1, Math.round(N/6));
    for(var i=0;i<N;i+=stepX){ el('text',{x:xAt(i),y:VBH-8,class:'axis-label','text-anchor':'middle'},svg).textContent = fmtDate(ROWS[i].date); }
    el('text',{x:xAt(N-1),y:VBH-8,class:'axis-label','text-anchor':'middle'},svg).textContent = fmtDate(ROWS[N-1].date);

    if(validIdx.length){
      var areaD = "M"+xAt(validIdx[0]).toFixed(2)+","+y(0).toFixed(2)+" ";
      validIdx.forEach(function(i){ areaD += "L"+xAt(i).toFixed(2)+","+y(rvol[i]).toFixed(2)+" "; });
      areaD += "L"+xAt(validIdx[validIdx.length-1]).toFixed(2)+","+y(0).toFixed(2)+" Z";
      el('path',{d:areaD, fill:'var(--accent)', opacity:0.10}, svg);
      var lineD=""; var started=false;
      validIdx.forEach(function(i){ lineD += (started?"L":"M")+xAt(i).toFixed(2)+","+y(rvol[i]).toFixed(2)+" "; started=true; });
      el('path',{d:lineD, fill:'none', stroke:'var(--accent)', 'stroke-width':2, 'stroke-linejoin':'round', 'stroke-linecap':'round'}, svg);
    }
    var ch = el('line',{x1:0,x2:0,y1:m.top,y2:VBH-m.bottom,class:'crosshair'},svg);
    var hit = el('rect',{x:m.left,y:0,width:plotW,height:VBH,class:'hit-rect'},svg);
    function nearestIndex(svgX){ var i=Math.round((svgX-m.left)/plotW*(N-1)); return Math.max(0,Math.min(N-1,i)); }
    hit.addEventListener('pointermove', function(e){
      var i = nearestIndex(svgPointX(svg, e.clientX, VBW));
      var x = xAt(i);
      ch.setAttribute('x1',x); ch.setAttribute('x2',x); ch.style.opacity=1;
      showTip(e.clientX, e.clientY, fmtDateLong(ROWS[i].date), [[period+'本ボラティリティ', rvol[i]!==null ? nf(rvol[i],2)+'%' : 'データ不足']]);
    });
    hit.addEventListener('pointerleave', function(){ ch.style.opacity=0; hideTip(); });
  }

  /* ================= Autocorrelation of returns ================= */
  function buildACF(){
    var svg = document.getElementById('acf-svg');
    var VBW=480, VBH=230;
    var m = {top:16, right:14, bottom:34, left:48};
    var plotW=VBW-m.left-m.right, plotH=VBH-m.top-m.bottom;
    var rets = ROWS.map(function(r){ return r.ret; }).filter(function(v){ return v!==null; });
    var n = rets.length;
    var mean = rets.reduce(function(a,b){ return a+b; },0)/n;
    var denom = rets.reduce(function(a,b){ return a+(b-mean)*(b-mean); },0);
    var maxLag = Math.max(1, Math.min(8, Math.floor(n/4)));
    var acf = [];
    for(var k=1;k<=maxLag;k++){
      var num=0;
      for(var t=k;t<n;t++){ num += (rets[t]-mean)*(rets[t-k]-mean); }
      acf.push(denom>0 ? num/denom : 0);
    }
    var confInt = n>0 ? 1.96/Math.sqrt(n) : 0;
    var yMax = Math.max(confInt*1.3, Math.max.apply(null, acf.map(Math.abs).concat([0.05]))*1.2);
    var yMin = -yMax;
    function x(idx){ return m.left + (idx+0.5)/maxLag*plotW; }
    function y(v){ return m.top+(1-(v-yMin)/(yMax-yMin))*plotH; }
    var ty = niceTicks(yMin,yMax,4);
    ty.ticks.forEach(function(t){
      el('line',{x1:m.left,x2:VBW-m.right,y1:y(t),y2:y(t),class:'grid-line'},svg);
      el('text',{x:m.left-8,y:y(t)+3.5,class:'axis-label num','text-anchor':'end'},svg).textContent = nf(t,2);
    });
    var bandTop=y(confInt), bandBot=y(-confInt);
    el('rect',{x:m.left,y:bandTop,width:plotW,height:Math.max(0,bandBot-bandTop),fill:'var(--muted)',opacity:0.14}, svg);
    el('line',{x1:m.left,x2:VBW-m.right,y1:y(0),y2:y(0),class:'baseline'},svg);
    var barW = Math.min(34, plotW/maxLag*0.5);
    acf.forEach(function(v,idx){
      var color = v>=0 ? 'var(--accent)' : 'var(--critical)';
      var cx = x(idx);
      var y0=y(0), y1=y(v);
      var top=Math.min(y0,y1), h=Math.max(1,Math.abs(y0-y1));
      el('rect',{x:cx-barW/2,y:top,width:barW,height:h,fill:color,opacity:0.85}, svg);
      el('text',{x:cx,y:VBH-10,class:'axis-label num','text-anchor':'middle'},svg).textContent = 'k='+(idx+1);
      var hit = el('rect',{x:cx-barW/2-4,y:m.top,width:barW+8,height:plotH,fill:'transparent',tabindex:0}, svg);
      (function(lag,val){
        function show(cx2,cy2){ showTip(cx2,cy2, 'ラグ '+lag, [['自己相関', nf(val,3)], ['±95%目安', '±'+nf(confInt,3)]]); }
        hit.addEventListener('pointermove', function(e){ show(e.clientX,e.clientY); });
        hit.addEventListener('pointerleave', hideTip);
        hit.addEventListener('focus', function(){ var r2=hit.getBoundingClientRect(); show(r2.left+r2.width/2, r2.top); });
        hit.addEventListener('blur', hideTip);
      })(idx+1, v);
    });
  }

  /* ================= Weekday seasonality ================= */
  function buildWeekday(){
    var svg = document.getElementById('weekday-svg');
    var VBW=480, VBH=230;
    var m = {top:26, right:14, bottom:34, left:48};
    var plotW=VBW-m.left-m.right, plotH=VBH-m.top-m.bottom;
    var names = ['日','月','火','水','木','金','土'];
    var order = [1,2,3,4,5,6,0];
    var sums = {}, counts = {};
    order.forEach(function(d){ sums[d]=0; counts[d]=0; });
    ROWS.forEach(function(r){
      if(r.ret===null) return;
      var d = new Date(r.date+'T00:00:00Z').getUTCDay();
      if(!(d in sums)) return;
      sums[d]+=r.ret; counts[d]++;
    });
    var cats = order.filter(function(d){ return counts[d]>0; });
    var means = cats.map(function(d){ return sums[d]/counts[d]; });
    var maxAbs = Math.max.apply(null, means.map(Math.abs).concat([0.01]));
    var yMin=-maxAbs*1.25, yMax=maxAbs*1.25;
    function x(idx){ return m.left + (idx+0.5)/cats.length*plotW; }
    function y(v){ return m.top + (1-(v-yMin)/(yMax-yMin))*plotH; }
    var ty = niceTicks(yMin,yMax,4);
    ty.ticks.forEach(function(t){
      el('line',{x1:m.left,x2:VBW-m.right,y1:y(t),y2:y(t),class:'grid-line'},svg);
      el('text',{x:m.left-8,y:y(t)+3.5,class:'axis-label num','text-anchor':'end'},svg).textContent = nf(t,2)+'%';
    });
    el('line',{x1:m.left,x2:VBW-m.right,y1:y(0),y2:y(0),class:'baseline'},svg);
    var barW = Math.min(40, plotW/cats.length*0.5);
    cats.forEach(function(d,idx){
      var v = means[idx];
      var color = v>=0 ? 'var(--good)' : 'var(--critical)';
      var cx = x(idx);
      var y0=y(0), y1=y(v);
      var top=Math.min(y0,y1), h=Math.max(1,Math.abs(y0-y1));
      el('rect',{x:cx-barW/2,y:top,width:barW,height:h,fill:color,opacity:0.85}, svg);
      var lab = el('text',{x:cx,y: v>=0 ? top-6 : top+h+14, class:'axis-label num','text-anchor':'middle'}, svg);
      lab.textContent = 'n='+counts[d];
      el('text',{x:cx,y:VBH-10,class:'axis-label','text-anchor':'middle'},svg).textContent = names[d];
      var hit = el('rect',{x:cx-barW/2-4,y:m.top,width:barW+8,height:plotH,fill:'transparent',tabindex:0}, svg);
      (function(dayName,val,cnt){
        function show(cx2,cy2){ showTip(cx2,cy2, dayName+'曜日', [['平均リターン', sf(val,3)+'%'], ['本数', cnt+'本']]); }
        hit.addEventListener('pointermove', function(e){ show(e.clientX,e.clientY); });
        hit.addEventListener('pointerleave', hideTip);
        hit.addEventListener('focus', function(){ var r2=hit.getBoundingClientRect(); show(r2.left+r2.width/2, r2.top); });
        hit.addEventListener('blur', hideTip);
      })(names[d], v, counts[d]);
    });
  }

  /* ================= Monthly return ================= */
  function buildMonthly(){
    var svg = document.getElementById('monthly-svg');
    var VBW=480, VBH=230;
    var m = {top:16, right:14, bottom:34, left:56};
    var plotW=VBW-m.left-m.right, plotH=VBH-m.top-m.bottom;
    var groups = [];
    var curKey=null, cur=null;
    ROWS.forEach(function(r,i){
      var key = r.date.slice(0,7);
      if(key!==curKey){ if(cur) groups.push(cur); cur={key:key, start:i, end:i}; curKey=key; }
      else cur.end=i;
    });
    if(cur) groups.push(cur);
    var vals = groups.map(function(g){
      var baseClose = g.start>0 ? ROWS[g.start-1].c : ROWS[g.start].o;
      var endClose = ROWS[g.end].c;
      return (endClose/baseClose-1)*100;
    });
    var labels = groups.map(function(g){ var p=g.key.split('-'); return p[0].slice(2)+'/'+p[1]; });
    var maxAbs = Math.max.apply(null, vals.map(Math.abs).concat([0.01]));
    var yMin=-maxAbs*1.15, yMax=maxAbs*1.15;
    function x(idx){ return m.left+(idx+0.5)/groups.length*plotW; }
    function y(v){ return m.top+(1-(v-yMin)/(yMax-yMin))*plotH; }
    var ty=niceTicks(yMin,yMax,4);
    ty.ticks.forEach(function(t){
      el('line',{x1:m.left,x2:VBW-m.right,y1:y(t),y2:y(t),class:'grid-line'},svg);
      el('text',{x:m.left-8,y:y(t)+3.5,class:'axis-label num','text-anchor':'end'},svg).textContent = nf(t,1)+'%';
    });
    el('line',{x1:m.left,x2:VBW-m.right,y1:y(0),y2:y(0),class:'baseline'},svg);
    var barW = Math.min(48, plotW/groups.length*0.55);
    groups.forEach(function(g,idx){
      var v = vals[idx];
      var color = v>=0 ? 'var(--good)' : 'var(--critical)';
      var cx=x(idx); var y0=y(0), y1=y(v);
      var top=Math.min(y0,y1), h=Math.max(1,Math.abs(y0-y1));
      el('rect',{x:cx-barW/2,y:top,width:barW,height:h,fill:color,opacity:0.85}, svg);
      el('text',{x:cx,y:VBH-10,class:'axis-label','text-anchor':'middle'},svg).textContent = labels[idx];
      var hit = el('rect',{x:cx-barW/2-4,y:m.top,width:barW+8,height:plotH,fill:'transparent',tabindex:0}, svg);
      (function(key,val,cnt){
        function show(cx2,cy2){ showTip(cx2,cy2, key, [['月次リターン', sf(val,2)+'%'], ['本数', cnt+'本']]); }
        hit.addEventListener('pointermove', function(e){ show(e.clientX,e.clientY); });
        hit.addEventListener('pointerleave', hideTip);
        hit.addEventListener('focus', function(){ var r2=hit.getBoundingClientRect(); show(r2.left+r2.width/2, r2.top); });
        hit.addEventListener('blur', hideTip);
      })(g.key, v, g.end-g.start+1);
    });
  }

  /* ================= Up/down streak distribution ================= */
  function buildStreak(){
    var svg = document.getElementById('streak-svg');
    var VBW=480, VBH=230;
    var m = {top:20, right:14, bottom:34, left:40};
    var plotW=VBW-m.left-m.right, plotH=VBH-m.top-m.bottom;
    var streaks = [];
    var curDir=null, curLen=0;
    ROWS.forEach(function(r){
      if(r.ret===null || r.ret===0){ if(curDir){ streaks.push({dir:curDir,len:curLen}); curDir=null; curLen=0; } return; }
      var dir = r.ret>0 ? 'up' : 'down';
      if(dir===curDir){ curLen++; } else { if(curDir) streaks.push({dir:curDir,len:curLen}); curDir=dir; curLen=1; }
    });
    if(curDir) streaks.push({dir:curDir,len:curLen});
    var maxLen = Math.max.apply(null, streaks.map(function(s){ return s.len; }).concat([1]));
    var capLen = Math.max(1, Math.min(maxLen, 6));
    var buckets = [];
    for(var l=1;l<capLen;l++) buckets.push({label:String(l), up:0, down:0});
    buckets.push({label:capLen+'+', up:0, down:0});
    streaks.forEach(function(s){
      var idx = Math.min(s.len, capLen) - 1;
      buckets[idx][s.dir]++;
    });
    var maxCount = Math.max.apply(null, buckets.map(function(b){ return Math.max(b.up,b.down); }).concat([1]));
    function xg(idx){ return m.left + (idx+0.5)/buckets.length*plotW; }
    function y(v){ return m.top + (1-v/maxCount)*plotH; }
    var ty = niceTicks(0,maxCount,4);
    ty.ticks.forEach(function(t){
      el('line',{x1:m.left,x2:VBW-m.right,y1:y(t),y2:y(t),class:'grid-line'},svg);
      el('text',{x:m.left-8,y:y(t)+3.5,class:'axis-label num','text-anchor':'end'},svg).textContent = nf(t,0);
    });
    var slot = plotW/buckets.length;
    var pairW = Math.min(46, slot*0.6);
    var barW = (pairW-2)/2;
    buckets.forEach(function(b,idx){
      var cx = xg(idx);
      var xUp = cx-pairW/2, xDown = cx+2;
      var hUp = plotH-(y(b.up)-m.top), hDown = plotH-(y(b.down)-m.top);
      el('rect',{x:xUp,y:y(b.up),width:barW,height:Math.max(0,hUp),fill:'var(--good)',opacity:0.85}, svg);
      el('rect',{x:xDown,y:y(b.down),width:barW,height:Math.max(0,hDown),fill:'var(--critical)',opacity:0.85}, svg);
      el('text',{x:cx,y:VBH-10,class:'axis-label','text-anchor':'middle'},svg).textContent = b.label+'本';
      var hit = el('rect',{x:cx-pairW/2-2,y:m.top,width:pairW+4,height:plotH,fill:'transparent',tabindex:0}, svg);
      (function(label,up,down){
        function show(cx2,cy2){ showTip(cx2,cy2, label+'本連続', [['上昇継続', up+'回'], ['下落継続', down+'回']]); }
        hit.addEventListener('pointermove', function(e){ show(e.clientX,e.clientY); });
        hit.addEventListener('pointerleave', hideTip);
        hit.addEventListener('focus', function(){ var r2=hit.getBoundingClientRect(); show(r2.left+r2.width/2, r2.top); });
        hit.addEventListener('blur', hideTip);
      })(b.label, b.up, b.down);
    });
  }

  /* ================= Correlation heatmap ================= */
  function buildCorrHeatmap(){
    var svg = document.getElementById('corr-svg');
    var VBW=480, VBH=350;
    var labels = ['始値','高値','安値','終値','出来高','騰落率'];
    var keys = ['o','h','l','c','v','ret'];
    var rows = ROWS.slice(1);
    var series = keys.map(function(k){ return rows.map(function(r){ return r[k]; }); });
    function corr(a,b){
      var n=a.length;
      if(n===0) return 0;
      var ma=a.reduce(function(x,y){ return x+y; },0)/n;
      var mb=b.reduce(function(x,y){ return x+y; },0)/n;
      var num=0, da=0, db=0;
      for(var i=0;i<n;i++){ num+=(a[i]-ma)*(b[i]-mb); da+=(a[i]-ma)*(a[i]-ma); db+=(b[i]-mb)*(b[i]-mb); }
      return (da>0&&db>0) ? num/Math.sqrt(da*db) : 0;
    }
    var k = keys.length;
    var matrix = [];
    for(var i=0;i<k;i++){ matrix.push([]); for(var j=0;j<k;j++){ matrix[i].push(i===j?1:corr(series[i],series[j])); } }

    var m = {top:14, left:66, right:10, bottom:10};
    var avail = Math.min(VBW-m.left-m.right, VBH-m.top-m.bottom-26);
    var cell = avail/k;
    var gridLeft = m.left, gridTop = m.top;

    labels.forEach(function(lab,i){
      el('text',{x:gridLeft-8, y:gridTop+i*cell+cell/2+4, class:'axis-label','text-anchor':'end'},svg).textContent = lab;
    });
    labels.forEach(function(lab,j){
      el('text',{x:gridLeft+j*cell+cell/2, y:gridTop+k*cell+18, class:'axis-label','text-anchor':'middle'},svg).textContent = lab;
    });

    for(var i=0;i<k;i++){
      for(var j=0;j<k;j++){
        var v = matrix[i][j];
        var color = v>=0 ? 'var(--accent)' : 'var(--critical)';
        var op = 0.08 + 0.80*Math.abs(v);
        var cx = gridLeft+j*cell, cy = gridTop+i*cell;
        var gap=1.5;
        el('rect',{x:cx+gap/2,y:cy+gap/2,width:cell-gap,height:cell-gap,fill:color,opacity:op,rx:3}, svg);
        var txt = el('text',{x:cx+cell/2,y:cy+cell/2+4,'text-anchor':'middle','font-size':11}, svg);
        txt.setAttribute('font-family','ui-monospace, "SF Mono", Menlo, monospace');
        txt.setAttribute('fill', Math.abs(v)>0.42 ? '#ffffff' : 'var(--ink)');
        txt.textContent = (i===j ? '1.00' : (v>=0?'+':'')+v.toFixed(2));
        var hit = el('rect',{x:cx,y:cy,width:cell,height:cell,fill:'transparent',tabindex:0}, svg);
        (function(li,lj,vv){
          function show(cx2,cy2){ showTip(cx2,cy2, labels[li]+' × '+labels[lj], [['相関係数', vv.toFixed(3)]]); }
          hit.addEventListener('pointermove', function(e){ show(e.clientX,e.clientY); });
          hit.addEventListener('pointerleave', hideTip);
          hit.addEventListener('focus', function(){ var r2=hit.getBoundingClientRect(); show(r2.left+r2.width/2, r2.top); });
          hit.addEventListener('blur', hideTip);
        })(i,j,v);
      }
    }
  }

  /* ================= Volume profile (horizontal) ================= */
  function buildVolProfile(){
    var svg = document.getElementById('volprofile-svg');
    var VBW=480, VBH=320;
    var m = {top:14, right:14, bottom:10, left:74};
    var plotW=VBW-m.left-m.right, plotH=VBH-m.top-m.bottom;
    var lo = Math.min.apply(null, ROWS.map(function(r){ return r.l; }));
    var hi = Math.max.apply(null, ROWS.map(function(r){ return r.h; }));
    var buckets = 14;
    var span = (hi-lo) || 1;
    var binH = span/buckets;
    var vols = new Array(buckets).fill(0);
    ROWS.forEach(function(r){
      var tp = (r.h+r.l+r.c)/3;
      var idx = Math.min(buckets-1, Math.max(0, Math.floor((tp-lo)/binH)));
      vols[idx]+=r.v;
    });
    var maxVol = Math.max.apply(null, vols.concat([1]));
    var barH = plotH/buckets;
    function yTop(i){ return m.top + (buckets-1-i)*barH; }
    function xw(v){ return (v/maxVol)*plotW; }
    el('text',{x:m.left-8, y:m.top+4, class:'axis-label num','text-anchor':'end'},svg).textContent = nf(hi,0);
    vols.forEach(function(v,i){
      var priceLo = lo+i*binH, priceHi = lo+(i+1)*binH;
      var yy = yTop(i);
      var w = Math.max(1, xw(v));
      el('rect',{x:m.left, y:yy+1, width:w, height:Math.max(1,barH-2), fill:'var(--accent)', opacity:0.78}, svg);
      el('text',{x:m.left-8, y:yy+barH/2+4, class:'axis-label num','text-anchor':'end'},svg).textContent = nf(priceLo,0);
      var hit = el('rect',{x:m.left,y:yy,width:plotW,height:barH,fill:'transparent',tabindex:0}, svg);
      (function(pl,ph,vv){
        function show(cx2,cy2){ showTip(cx2,cy2, nf(pl,0)+' 　〜　 '+nf(ph,0), [['出来高合計', nf(vv,0)]]); }
        hit.addEventListener('pointermove', function(e){ show(e.clientX,e.clientY); });
        hit.addEventListener('pointerleave', hideTip);
        hit.addEventListener('focus', function(){ var r2=hit.getBoundingClientRect(); show(r2.left+r2.width/2, r2.top); });
        hit.addEventListener('blur', hideTip);
      })(priceLo, priceHi, v);
    });
  }

  /* ================= Return distribution stat table ================= */
  function buildStatTable(){
    var host = document.getElementById('stat-table');
    var rets = ROWS.map(function(r){ return r.ret; }).filter(function(v){ return v!==null; });
    var n = rets.length;
    var mean = rets.reduce(function(a,b){ return a+b; },0)/n;
    var variance = rets.reduce(function(a,b){ return a+(b-mean)*(b-mean); },0)/Math.max(1,n-1);
    var sd = Math.sqrt(variance);
    var skew = (n>=3 && sd>0) ? rets.reduce(function(a,b){ return a+Math.pow((b-mean)/sd,3); },0) * (n/((n-1)*(n-2))) : null;
    var kurt = (n>=4 && sd>0) ? rets.reduce(function(a,b){ return a+Math.pow((b-mean)/sd,4); },0) * (n*(n+1))/((n-1)*(n-2)*(n-3)) - 3*(n-1)*(n-1)/((n-2)*(n-3)) : null;
    var sorted = rets.slice().sort(function(a,b){ return a-b; });
    function pct(p){ var idx=(sorted.length-1)*p; var lo=Math.floor(idx), hi=Math.ceil(idx); if(lo===hi) return sorted[lo]; return sorted[lo]+(sorted[hi]-sorted[lo])*(idx-lo); }
    var rows = [
      ['本数(n)', n+' 本'],
      ['平均', sf(mean,3)+'%'],
      ['標準偏差', nf(sd,3)+'%'],
      ['歪度(Skewness)', skew===null?'–':(nf(skew,3) + (skew>0.2?' (右に裾長)':skew<-0.2?' (左に裾長)':' (ほぼ対称)'))],
      ['尖度(超過, Kurtosis)', kurt===null?'–':(nf(kurt,3) + (kurt>0.5?' (裾が厚い)':kurt<-0.5?' (裾が薄い)':' (正規分布に近い)'))],
      ['最小', sf(Math.min.apply(null,rets),3)+'%'],
      ['25%点', sf(pct(0.25),3)+'%'],
      ['中央値', sf(pct(0.5),3)+'%'],
      ['75%点', sf(pct(0.75),3)+'%'],
      ['最大', sf(Math.max.apply(null,rets),3)+'%']
    ];
    rows.forEach(function(pair){
      var row = document.createElement('div'); row.className='srow';
      var k = document.createElement('div'); k.className='sk'; k.textContent = pair[0];
      var v = document.createElement('div'); v.className='sv'; v.textContent = pair[1];
      row.appendChild(k); row.appendChild(v);
      host.appendChild(row);
    });
  }

  /* ================= Data table ================= */
  function buildTable(){
    var body = document.getElementById('tbl-body');
    ROWS.forEach(function(r){
      var tr = document.createElement('tr');
      function td(text, cls){ var d=document.createElement('td'); if(cls) d.className=cls; d.textContent=text; tr.appendChild(d); }
      td(r.date);
      td(nf(r.o,2)); td(nf(r.h,2)); td(nf(r.l,2)); td(nf(r.c,2));
      td(nf(r.v,0));
      td(r.ret===null?'–':sf(r.ret,2), r.ret===null?'':(r.ret>=0?'up':'down'));
      td(r.ma5?nf(r.ma5,2):'–');
      td(r.ma10?nf(r.ma10,2):'–');
      td(nf(r.dd,2), r.dd<0?'down':'');
      body.appendChild(tr);
    });
    document.getElementById('tbl-count').textContent = N;
  }

  /* ================= Orchestration: (re)render the whole dashboard from raw rows ================= */
  function clearNode(id){ var n = document.getElementById(id); while(n.firstChild) n.removeChild(n.firstChild); }

  function updateHeader(meta){
    var filename = meta.filename || DEFAULT_NAME;
    var interval = inferIntervalLabel(ROWS);
    document.getElementById('brand-ticker').textContent = deriveTicker(filename);
    document.getElementById('brand-sub').textContent = 'EDA ダッシュボード · ' + interval;
    document.getElementById('m-range').textContent = fmtDate(STATS.date_start) + ' – ' + fmtDate(STATS.date_end);
    document.getElementById('m-n').textContent = STATS.n;
    document.getElementById('m-source').textContent = filename;
    document.getElementById('cumret-desc').textContent = '起点(' + STATS.date_start + ' 終値)を0%とした累積騰落率の推移。';
    document.getElementById('foot-note').textContent = filename + '(' + interval + ', ' + STATS.date_start + ' 〜 ' + STATS.date_end + ')を基に算出。データソース由来の丸め誤差を含みます。';
  }

  function renderAll(raw, meta){
    var d = computeDerived(raw);
    ROWS = d.rows; STATS = d.stats; N = ROWS.length;
    ['price-svg','vol-svg','cumret-svg','dd-svg','hist-svg','scatter-svg',
     'bb-svg','rvol-svg','acf-svg','weekday-svg','monthly-svg','streak-svg','corr-svg','volprofile-svg'].forEach(clearNode);
    clearNode('kpi-row');
    clearNode('tbl-body');
    clearNode('stat-table');
    updateHeader(meta);
    buildKPI();
    buildPriceVolume();
    buildLineChart({id:'cumret-svg', h:230, key:'cumret', color:'var(--accent)', label:'累積リターン', includeZero:true});
    buildLineChart({id:'dd-svg', h:190, key:'dd', color:'var(--critical)', label:'ドローダウン', includeZero:true, top:0});
    buildHist();
    buildScatter();
    buildBollinger();
    buildRollingVol();
    buildACF();
    buildWeekday();
    buildMonthly();
    buildStreak();
    buildCorrHeatmap();
    buildVolProfile();
    buildStatTable();
    buildTable();
  }

  /* ================= File controls: swap in any CSV with the same schema ================= */
  var fileInput = document.getElementById('csv-input');
  var resetBtn = document.getElementById('reset-btn');
  var errorBanner = document.getElementById('error-banner');
  var wrapEl = document.querySelector('.wrap');

  function showError(msg){ errorBanner.textContent = msg; errorBanner.hidden = false; }
  function clearErrorBanner(){ errorBanner.hidden = true; errorBanner.textContent = ''; }

  function handleFile(file){
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      try{
        var raw = parseCSV(reader.result);
        clearErrorBanner();
        renderAll(raw, {filename: file.name});
        resetBtn.hidden = false;
      }catch(err){
        showError('CSVを読み込めませんでした: ' + err.message + '。datetime, open, high, low, close, volume の列を持つ同じ形式のCSVを選択してください。');
      }
    };
    reader.onerror = function(){ showError('ファイルの読み込みに失敗しました。'); };
    reader.readAsText(file, 'utf-8');
  }

  fileInput.addEventListener('change', function(e){
    var f = e.target.files && e.target.files[0];
    handleFile(f);
    fileInput.value = '';
  });
  resetBtn.addEventListener('click', function(){
    clearErrorBanner();
    renderAll(DEFAULT_RAW, {filename: DEFAULT_NAME});
    resetBtn.hidden = true;
  });
  wrapEl.addEventListener('dragover', function(e){ e.preventDefault(); wrapEl.classList.add('drag-over'); });
  wrapEl.addEventListener('dragleave', function(){ wrapEl.classList.remove('drag-over'); });
  wrapEl.addEventListener('drop', function(e){
    e.preventDefault();
    wrapEl.classList.remove('drag-over');
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if(f) handleFile(f);
  });

  renderAll(DEFAULT_RAW, {filename: DEFAULT_NAME});
})();