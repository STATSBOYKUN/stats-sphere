self.onmessage = function(e) {
  const { dependent, independent } = e.data;

  if (!dependent || !independent) {
    self.postMessage({ error: "Data dependent dan independent harus disediakan." });
    return;
  }
  if (!Array.isArray(dependent) || !Array.isArray(independent)) {
    self.postMessage({ error: "Data dependent dan independent harus berupa array." });
    return;
  }

  const numIndependentVars = independent.length;
  const n = dependent.length;

  function mean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  function correlation(x, y) {
    const n = x.length;
    const meanX = mean(x);
    const meanY = mean(y);
    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    return num / Math.sqrt(denX * denY);
  }

  function gammln(xx) {
    const cof = [
      76.18009172947146, -86.50532032941677,
      24.01409824083091, -1.231739572450155,
      0.1208650973866179e-2, -0.5395239384953e-5
    ];
    let x = xx - 1.0;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < cof.length; j++) {
      x += 1;
      ser += cof[j] / x;
    }
    return -tmp + Math.log(2.5066282746310005 * ser);
  }

  function betacf(a, b, x) {
    const MAXIT = 100;
    const EPS = 3e-7;
    const FPMIN = 1e-30;
    const qab = a + b;
    const qap = a + 1;
    const qam = a - 1;
    let c = 1;
    let d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }

  function betai(a, b, x) {
    if (x < 0 || x > 1) return NaN;
    const bt = (x === 0 || x === 1)
        ? 0
        : Math.exp(gammln(a + b) - gammln(a) - gammln(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) {
      return bt * betacf(a, b, x) / a;
    } else {
      return 1 - bt * betacf(b, a, 1 - x) / b;
    }
  }

  function calculatePValue(r, n) {
    const df = n - 2;
    const t = r * Math.sqrt(df / (1 - r * r));
    return 0.5 * betai(df / 2, 0.5, df / (t * t + df));
  }

  function round(num) {
    return Math.round(num * 1000) / 1000;
  }

  const allVariables = [dependent, ...independent];
  const variableNames = ["VAR00001"];
  for (let i = 0; i < numIndependentVars; i++) {
    variableNames.push(`VAR0000${i+2}`);
  }

  const numTotalVars = numIndependentVars + 1;

  const columnHeaders = [
    { header: "" },
    { header: "" }
  ];

  for (let i = 0; i < numTotalVars; i++) {
    columnHeaders.push({ header: variableNames[i] });
  }

  const correlationRows = [];
  const sigRows = [];
  const nRows = [];

  for (let i = 0; i < numTotalVars; i++) {
    const correlationChildren = {
      rowHeader: [null, variableNames[i]]
    };

    const sigChildren = {
      rowHeader: [null, variableNames[i]]
    };

    const nChildren = {
      rowHeader: [null, variableNames[i]]
    };

    for (let j = 0; j < numTotalVars; j++) {
      if (i === j) {
        correlationChildren[variableNames[j]] = 1.000;
        sigChildren[variableNames[j]] = ".";
        nChildren[variableNames[j]] = n;
      } else {
        const r = correlation(allVariables[i], allVariables[j]);
        const pValue = calculatePValue(r, n);

        correlationChildren[variableNames[j]] = round(r);
        sigChildren[variableNames[j]] = round(pValue);
        nChildren[variableNames[j]] = n;
      }
    }

    correlationRows.push(correlationChildren);
    sigRows.push(sigChildren);
    nRows.push(nChildren);
  }

  const result = {
    tables: [
      {
        title: "Correlations",
        columnHeaders: columnHeaders,
        rows: [
          {
            rowHeader: ["Pearson Correlation"],
            children: correlationRows
          },
          {
            rowHeader: ["Sig. (1-tailed)"],
            children: sigRows
          },
          {
            rowHeader: ["N"],
            children: nRows
          }
        ]
      }
    ]
  };

  self.postMessage(result);
};