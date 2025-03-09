// public/workers/coefficients.js

self.onmessage = function(e) {
    const { regressionResult, independentVarNames } = e.data;
    
    if (!regressionResult || !regressionResult.coefficients) {
      self.postMessage({ success: false, error: "Hasil regresi tidak valid." });
      return;
    }
    if (!independentVarNames || !Array.isArray(independentVarNames)) {
      self.postMessage({ success: false, error: "Nama variabel independen tidak valid." });
      return;
    }
    
    const coefficientsData = regressionResult.coefficients.map((coef, idx) => {
      return {
        rowHeader: [idx === 0 ? "1" : null],
        children: [
          {
            rowHeader: [null, idx === 0 ? "(Constant)" : independentVarNames[idx - 1]],
            "B": parseFloat(coef.coefficient.toFixed(3)),
            "stdError": parseFloat(coef.stdError.toFixed(3)),
            "Beta": coef.standardizedCoefficient !== null ? parseFloat(coef.standardizedCoefficient.toFixed(3)) : "",
            "t": parseFloat(coef.tValue.toFixed(3)),
            "Sig.": parseFloat(coef.pValue.toFixed(3))
          }
        ]
      };
    });
    
    const coefficientsTable = {
      tables: [
        {
          title: "Coefficients",
          columnHeaders: [
            { header: "Model" },
            { header: "" },
            {
              header: "Unstandardized Coefficients",
              children: [
                { header: "B", key: "B" },
                { header: "Std. Error", key: "stdError" }
              ]
            },
            {
              header: "Standardized Coefficients",
              children: [
                { header: "Beta", key: "Beta" }
              ]
            },
            { header: "t" },
            { header: "Sig." }
          ],
          rows: coefficientsData
        }
      ]
    };
    
    self.postMessage({ success: true, result: coefficientsTable });
  };
  