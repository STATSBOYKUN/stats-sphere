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

  function mean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  function sampleStdDev(arr) {
    const m = mean(arr);
    const sumSq = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0);
    return Math.sqrt(sumSq / (arr.length - 1));
  }

  const rows = [];

  const statsDependent = {
    variable: "VAR00001",
    mean: parseFloat(mean(dependent).toFixed(2)),
    stdDeviation: parseFloat(sampleStdDev(dependent).toFixed(5)),
    n: dependent.length
  };

  rows.push(Object.assign({ rowHeader: ["VAR00001"] }, statsDependent));

  for (let i = 0; i < independent.length; i++) {
    const varName = `VAR0000${i+2}`;
    const statsIndependent = {
      variable: varName,
      mean: parseFloat(mean(independent[i]).toFixed(2)),
      stdDeviation: parseFloat(sampleStdDev(independent[i]).toFixed(5)),
      n: independent[i].length
    };

    rows.push(Object.assign({ rowHeader: [varName] }, statsIndependent));
  }

  const result = {
    tables: [
      {
        title: "Descriptive Statistics",
        columnHeaders: [
          { header: "Variable", key: "variable" },
          { header: "Mean", key: "mean" },
          { header: "Std. Deviation", key: "stdDeviation" },
          { header: "N", key: "n" }
        ],
        rows: rows
      }
    ]
  };

  self.postMessage(result);
};