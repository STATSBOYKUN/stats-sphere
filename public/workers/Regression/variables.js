// variables.js

self.onmessage = function(e) {
  const { dependent, independent, dependentName, independentNames } = e.data;
  
  // Validasi input
  if (!dependent || !independent) {
    self.postMessage({ error: "Data dependent dan independent harus disediakan." });
    return;
  }
  if (!Array.isArray(dependent) || !Array.isArray(independent[0])) {
    self.postMessage({ error: "Data dependent dan independent harus berupa array." });
    return;
  }
  
  // Dapatkan nama variabel
  const depVarName = dependentName || "VAR00001";
  const indepVars = [];
  
  // Buat nama variabel untuk setiap array independent
  for (let i = 0; i < independent.length; i++) {
    const varName = independentNames && independentNames[i] 
      ? independentNames[i] 
      : `VAR${String(i + 2).padStart(5, '0')}`;
    indepVars.push(varName);
  }
  
  // Bangun objek JSON hasil sesuai struktur yang diinginkan
  const result = {
    tables: [
      {
        title: "Variables Entered/Removed",
        columnHeaders: [
          { header: "Model" },
          { header: "Variables Entered", key: "variablesEntered" },
          { header: "Variables Removed", key: "variablesRemoved" },
          { header: "Method", key: "method" }
        ],
        rows: [
          {
            rowHeader: ["1"],
            variablesEntered: indepVars.join(", "),
            variablesRemoved: ".",
            method: "Enter"
          }
        ],
        footnote: {
          "a": `Dependent Variable: ${depVarName}`,
          "b": "All requested variables entered."
        }
      }
    ]
  };
  
  // Kirim hasil ke thread utama
  self.postMessage(result);
};