// computeWorker.js
importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/mathjs/10.0.0/math.min.js"
);

self.onmessage = function (event) {
  const { data, variables, numericExpression, variableType } = event.data;

  try {
    // Proses hanya komputasi nilai
    const computedValues = data.map((row) => {
      const context = {};
      variables.forEach((variable) => {
        const colIndex = variable.columnIndex;
        const cellValue = row[colIndex];
        context[variable.name] =
          variable.type === "Numeric" ? parseFloat(cellValue) : cellValue;
      });

      // Hitung nilai ekspresi
      let computedValue = math.evaluate(numericExpression, context);
      computedValue =
        variableType === "Numeric"
          ? computedValue.toString()
          : String(computedValue);

      return computedValue; // Kembalikan hanya nilai hasil komputasi
    });

    // Siapkan data tabel dalam format yang diinginkan
    const tableData = {
      title: "Computed Values",
      columns: ["variabel target"],
      rows: computedValues.map((value) => ({
        "variabel target": value,
      })),
    };

    // Kirim hasil komputasi dan data tabel kembali ke main thread
    self.postMessage({ success: true, computedValues, tableData });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
