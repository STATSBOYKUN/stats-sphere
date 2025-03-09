// public/workers/variables.js

self.onmessage = function(e) {
    const { independentVarNames, method } = e.data;
    
    if (!independentVarNames || !Array.isArray(independentVarNames)) {
      self.postMessage({ success: false, error: "Data variabel independen tidak valid." });
      return;
    }
    
    const variablesEnteredRemoved = {
      tables: [
        {
          title: "Variables Entered/Removed",
          columnHeaders: [
            { header: "Model" },
            { header: "Variables Entered" },
            { header: "Variables Removed" },
            { header: "Method" }
          ],
          rows: [
            {
              rowHeader: ["1"],
              "Variables Entered": independentVarNames.join(', '),
              "Variables Removed": "",
              "Method": method
            }
          ]
        }
      ]
    };
    
    self.postMessage({ success: true, result: variablesEnteredRemoved });
  };
  