// public/workers/ChartBuilder/ChartBuilder.js

self.onmessage = function (event) {
  const {
    chartType,
    chartVariables,
    chartMetadata,
    data,
    variables,
    chartConfig,
  } = event.data;
  console.log("data di worker");
  const xVariables = chartVariables.x;
  const yVariables = chartVariables.y;
  try {
    // Misalnya, untuk chart type "bar"
    if (chartType === "Vertical Bar Chart") {
      const xVariable = xVariables[0];
      const yVariable = yVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (xIndex === -1 || yIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      const frequencyMap = data.reduce((acc, row) => {
        const key = row[xIndex];
        const yValue = parseFloat(row[yIndex]);

        if (!isNaN(yValue)) {
          acc[key] = (acc[key] || 0) + yValue;
        }

        return acc;
      }, {});

      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                value: yVariable,
              },
              description: `Total ${yVariable} per ${xVariable} in the dataset`,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap).map((key) => ({
              category: key,
              value: frequencyMap[key],
            })),
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title ?? "Title",
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Horizontal Bar Chart") {
      const xVariable = xVariables[0];
      const yVariable = yVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (xIndex === -1 || yIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      const frequencyMap = data.reduce((acc, row) => {
        const key = row[xIndex];
        const yValue = parseFloat(row[yIndex]);

        if (!isNaN(yValue)) {
          acc[key] = (acc[key] || 0) + yValue;
        }

        return acc;
      }, {});

      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                value: yVariable,
              },
              description: `Total ${yVariable} per ${xVariable} in the dataset`,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap).map((key) => ({
              category: key,
              value: frequencyMap[key],
            })),
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title || `${yVariable} Distribution`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Pie Chart") {
      const xVariable = xVariables[0];
      const yVariable = yVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (xIndex === -1 || yIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      const frequencyMap = data.reduce((acc, row) => {
        const key = row[xIndex];
        const yValue = parseFloat(row[yIndex]);

        if (!isNaN(yValue)) {
          acc[key] = (acc[key] || 0) + yValue;
        }

        return acc;
      }, {});

      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                value: yVariable,
              },
              description: `Total ${yVariable} per ${xVariable} in the dataset`,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap).map((key) => ({
              category: key,
              value: frequencyMap[key],
            })),
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title || `${yVariable} Distribution`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Scatter Plot") {
      const xVariable = xVariables[0];
      const yVariable = yVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (xIndex === -1 || yIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      const frequencyMap = data.reduce((acc, row) => {
        const key = row[xIndex];
        const yValue = parseFloat(row[yIndex]);

        if (!isNaN(yValue)) {
          acc[key] = (acc[key] || 0) + yValue;
        }

        return acc;
      }, {});

      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                x: xVariable,
                y: yVariable,
              },
              description: `Total ${yVariable} per ${xVariable} in the dataset`,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap).map((key) => ({
              x: Number(key),
              y: frequencyMap[key],
            })),
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              useLegend: chartConfig.useLegend ?? true,
              useAxis: chartConfig.useAxis ?? true,
              title: chartConfig.title || `${yVariable} Distribution`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Scatter Plot With Fit Line") {
      const xVariable = xVariables[0];
      const yVariable = yVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (xIndex === -1 || yIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      const frequencyMap = data.reduce((acc, row) => {
        const key = row[xIndex];
        const yValue = parseFloat(row[yIndex]);

        if (!isNaN(yValue)) {
          acc[key] = (acc[key] || 0) + yValue;
        }

        return acc;
      }, {});

      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                x: xVariable,
                y: yVariable,
              },
              description: `Total ${yVariable} per ${xVariable} in the dataset`,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap).map((key) => ({
              x: Number(key),
              y: frequencyMap[key],
            })),
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title ?? `${yVariable} Distribution`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Line Chart") {
      const xVariable = xVariables[0];
      const yVariable = yVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (xIndex === -1 || yIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      const frequencyMap = data.reduce((acc, row) => {
        const key = row[xIndex];
        const yValue = parseFloat(row[yIndex]);

        if (!isNaN(yValue)) {
          acc[key] = (acc[key] || 0) + yValue;
        }

        return acc;
      }, {});

      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                value: yVariable,
              },
              description: `Total ${yVariable} per ${xVariable} in the dataset`,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap).map((key) => ({
              category: key,
              value: frequencyMap[key],
            })),
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              useLegend: chartConfig.useLegend ?? true,
              useAxis: chartConfig.useAxis ?? true,
              title: chartConfig.title ?? `${yVariable} Distribution`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Area Chart") {
      const xVariable = xVariables[0];
      const yVariable = yVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (xIndex === -1 || yIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      const frequencyMap = data.reduce((acc, row) => {
        const key = row[xIndex];
        const yValue = parseFloat(row[yIndex]);

        if (!isNaN(yValue)) {
          acc[key] = (acc[key] || 0) + yValue;
        }

        return acc;
      }, {});

      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                value: yVariable,
              },
              description: `Total ${yVariable} per ${xVariable} in the dataset`,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap).map((key) => ({
              category: key,
              value: frequencyMap[key],
            })),
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              useLegend: chartConfig.useLegend ?? true,
              useAxis: chartConfig.useAxis ?? true,
              title: chartConfig.title ?? `${yVariable} Distribution`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Vertical Stacked Bar Chart") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const yVariablesList = yVariables;
      console.log("Requested xVariable:", xVariable);
      console.log("Requested yVariables:", yVariablesList);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndexes = yVariablesList.map((v) =>
        variables.findIndex((varObj) => varObj.name.trim() === v.trim())
      );
      console.log("yIndexes:", yIndexes);

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }

      // Mengecek jika ada variabel Y yang tidak ditemukan
      const missingYVariables = yVariablesList.filter(
        (v, index) => yIndexes[index] === -1
      );
      if (missingYVariables.length > 0) {
        throw new Error(
          `Variabel Y '${missingYVariables.join(", ")}' tidak ditemukan.`
        );
      }

      // Kelompokkan data berdasarkan kategori X dan jumlahkan nilai Y untuk setiap variabel Y
      const frequencyMap = data.reduce((acc, row) => {
        const xKey = row[xIndex]; // Ambil nilai X
        yVariablesList.forEach((yVariable, i) => {
          const yIndex = yIndexes[i];
          const yValue = parseFloat(row[yIndex]);
          if (!isNaN(yValue)) {
            if (!acc[xKey]) {
              acc[xKey] = [];
            }
            acc[xKey].push({
              subcategory: yVariable,
              value: yValue,
            });
          }
        });
        return acc;
      }, {});

      // Konversi ke format data yang bisa digunakan oleh chart
      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                subcategory: yVariablesList,
              },
              description: `Total per ${xVariable} for each variable in ${yVariablesList.join(
                ", "
              )}.`,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap)
              .map((key) => {
                return frequencyMap[key].map((entry) => ({
                  category: key,
                  subcategory: entry.subcategory,
                  value: entry.value,
                }));
              })
              .flat(), // `flat()` untuk meratakan array yang berbentuk array of arrays
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.color || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title:
                chartConfig.title ??
                `Distribution of ${yVariablesList.join(", ")} by ${xVariable}`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Horizontal Stacked Bar Chart") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const yVariablesList = yVariables;
      console.log("Requested xVariable:", xVariable);
      console.log("Requested yVariables:", yVariablesList);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndexes = yVariablesList.map((v) =>
        variables.findIndex((varObj) => varObj.name.trim() === v.trim())
      );
      console.log("yIndexes:", yIndexes);

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }

      // Mengecek jika ada variabel Y yang tidak ditemukan
      const missingYVariables = yVariablesList.filter(
        (v, index) => yIndexes[index] === -1
      );
      if (missingYVariables.length > 0) {
        throw new Error(
          `Variabel Y '${missingYVariables.join(", ")}' tidak ditemukan.`
        );
      }

      // Kelompokkan data berdasarkan kategori X dan jumlahkan nilai Y untuk setiap variabel Y
      const frequencyMap = data.reduce((acc, row) => {
        const xKey = row[xIndex]; // Ambil nilai X
        yVariablesList.forEach((yVariable, i) => {
          const yIndex = yIndexes[i];
          const yValue = parseFloat(row[yIndex]);
          if (!isNaN(yValue)) {
            if (!acc[xKey]) {
              acc[xKey] = [];
            }
            acc[xKey].push({
              subcategory: yVariable,
              value: yValue,
            });
          }
        });
        return acc;
      }, {});

      // Konversi ke format data yang bisa digunakan oleh chart
      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                subcategory: yVariablesList,
              },
              description: `Total per ${xVariable} for each variable in ${yVariablesList.join(
                ", "
              )}.`,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap)
              .map((key) => {
                return frequencyMap[key].map((entry) => ({
                  category: key,
                  subcategory: entry.subcategory,
                  value: entry.value,
                }));
              })
              .flat(), // `flat()` untuk meratakan array yang berbentuk array of arrays
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title:
                chartConfig.title ??
                `Distribution of ${yVariablesList.join(", ")} by ${xVariable}`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Grouped Bar Chart") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const yVariablesList = yVariables;
      console.log("Requested xVariable:", xVariable);
      console.log("Requested yVariables:", yVariablesList);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndexes = yVariablesList.map((v) =>
        variables.findIndex((varObj) => varObj.name.trim() === v.trim())
      );
      console.log("yIndexes:", yIndexes);

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }

      // Mengecek jika ada variabel Y yang tidak ditemukan
      const missingYVariables = yVariablesList.filter(
        (v, index) => yIndexes[index] === -1
      );
      if (missingYVariables.length > 0) {
        throw new Error(
          `Variabel Y '${missingYVariables.join(", ")}' tidak ditemukan.`
        );
      }

      // Kelompokkan data berdasarkan kategori X dan jumlahkan nilai Y untuk setiap variabel Y
      const frequencyMap = data.reduce((acc, row) => {
        const xKey = row[xIndex]; // Ambil nilai X
        yVariablesList.forEach((yVariable, i) => {
          const yIndex = yIndexes[i];
          const yValue = parseFloat(row[yIndex]);
          if (!isNaN(yValue)) {
            if (!acc[xKey]) {
              acc[xKey] = [];
            }
            acc[xKey].push({
              subcategory: yVariable,
              value: yValue,
            });
          }
        });
        return acc;
      }, {});

      // Konversi ke format data yang bisa digunakan oleh chart
      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                subcategory: yVariablesList,
              },
              description: `Total per ${xVariable} for each variable in ${yVariablesList.join(
                ", "
              )}.`,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap)
              .map((key) => {
                return frequencyMap[key].map((entry) => ({
                  category: key,
                  subcategory: entry.subcategory,
                  value: entry.value,
                }));
              })
              .flat(), // `flat()` untuk meratakan array yang berbentuk array of arrays
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              useLegend: chartConfig.useLegend ?? true,
              title:
                chartConfig.title ??
                `Distribution of ${yVariablesList.join(", ")} by ${xVariable}`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Histogram") {
      const yVariable = yVariables[0]; // Y variable untuk histogram

      // Cari indeks variabel Y dalam array variables
      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (yIndex === -1) {
        throw new Error("Variabel Y tidak ditemukan.");
      }

      // Ambil data untuk variabel Y
      const validData = data.reduce((acc, row) => {
        const yValue = parseFloat(row[yIndex]); // Nilai untuk Y (misalnya 20, 40, dst.)

        // Validasi apakah yValue adalah angka dan tidak NaN
        if (!isNaN(yValue) && yValue !== 0) {
          acc.push(yValue); // Tambahkan nilai Y yang valid
        }

        return acc;
      }, []);

      // Output data untuk histogram
      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                value: yVariable, // Nama variabel Y
              },
              description: `Histogram for ${yVariable} values in the dataset`,
              notes: chartMetadata.note || null,
            },
            chartData: validData, // Data valid yang akan digunakan untuk histogram
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              uselegend: chartConfig.legend ?? true,
              useAxis: chartConfig.useAxis ?? true,
              title: chartConfig.title ?? `${yVariable} Distribution`,
            },
          },
        ],
      };

      // Kirim hasil ke main thread
      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Multiple Line Chart") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const yVariablesList = yVariables;
      console.log("Requested xVariable:", xVariable);
      console.log("Requested yVariables:", yVariablesList);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndexes = yVariablesList.map((v) =>
        variables.findIndex((varObj) => varObj.name.trim() === v.trim())
      );
      console.log("yIndexes:", yIndexes);

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }

      // Mengecek jika ada variabel Y yang tidak ditemukan
      const missingYVariables = yVariablesList.filter(
        (v, index) => yIndexes[index] === -1
      );
      if (missingYVariables.length > 0) {
        throw new Error(
          `Variabel Y '${missingYVariables.join(", ")}' tidak ditemukan.`
        );
      }

      // Kelompokkan data berdasarkan kategori X dan jumlahkan nilai Y untuk setiap variabel Y
      const frequencyMap = data.reduce((acc, row) => {
        const xKey = row[xIndex]; // Ambil nilai X
        yVariablesList.forEach((yVariable, i) => {
          const yIndex = yIndexes[i];
          const yValue = parseFloat(row[yIndex]);
          if (!isNaN(yValue)) {
            if (!acc[xKey]) {
              acc[xKey] = [];
            }
            acc[xKey].push({
              subcategory: yVariable,
              value: yValue,
            });
          }
        });
        return acc;
      }, {});

      // Konversi ke format data yang bisa digunakan oleh chart
      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                subcategory: yVariablesList,
              },
              description: `Total per ${xVariable} for each variable in ${yVariablesList.join(
                ", "
              )}.`,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap)
              .map((key) => {
                return frequencyMap[key].map((entry) => ({
                  category: key,
                  subcategory: entry.subcategory,
                  value: entry.value,
                }));
              })
              .flat(), // `flat()` untuk meratakan array yang berbentuk array of arrays
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              legend: chartConfig.legend ?? true,
              title:
                chartConfig.title ??
                `Distribution of ${yVariablesList.join(", ")} by ${xVariable}`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Boxplot") {
      const xVariable = xVariables[0];
      const yVariable = yVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (xIndex === -1 || yIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      const frequencyMap = data.reduce((acc, row) => {
        let key = row[xIndex]; // Kategori (misalnya "A" atau "B")
        const yValue = parseFloat(row[yIndex]); // Nilai (misalnya 20, 40, dst.)

        if (key === null || key === undefined || key === "") {
          key = "unknown"; // Ganti kategori kosong dengan 'unknown'
        }

        if (!isNaN(yValue)) {
          // Pastikan format data yang benar
          acc.push({ category: key, value: yValue });
        }

        return acc;
      }, []);

      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                value: yVariable,
              },
              description: `Total ${yVariable} per ${xVariable} in the dataset`,
              notes: chartMetadata.note || null,
            },
            chartData: frequencyMap,
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title || `${yVariable} Distribution`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Error Bar Chart") {
      const xVariable = xVariables[0]; // Variabel kategori
      const yVariable = yVariables[0]; // Variabel nilai

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (xIndex === -1 || yIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      // Ambil seluruh data untuk y (value)
      const allValues = data
        .map((row) => parseFloat(row[yIndex]))
        .filter((value) => !isNaN(value));

      // Fungsi untuk menghitung deviasi standar (error) dari seluruh data
      const calculateError = (values) => {
        if (values.length <= 1) return 0; // Jika hanya ada satu nilai, error dianggap 0

        const mean =
          values.reduce((sum, value) => sum + value, 0) / values.length; // Rata-rata seluruh nilai
        const variance =
          values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
          (values.length - 1); // Variansi
        return Math.sqrt(variance); // Deviasi standar (error)
      };

      // Menghitung error berdasarkan seluruh data untuk setiap titik
      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                value: yVariable,
              },
              description: `Total ${yVariable} per ${xVariable} with error calculated from all data points`,
              notes: chartMetadata.note || null,
            },
            chartData: data.map((row) => {
              const yValue = parseFloat(row[yIndex]); // Nilai untuk titik tersebut
              const error = calculateError(allValues); // Menghitung error berdasarkan seluruh data

              return {
                category: row[xIndex], // Kategori (misalnya "A", "B", dst.)
                value: yValue, // Nilai (misalnya 30, 40, dst.)
                error: Number(error.toFixed(2)), // Error berdasarkan seluruh data
              };
            }),
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.color || ["#4682B4"], // Warna untuk tiap variabel di `side`
              useLegend: chartConfig.useLegend ?? true,
              useAxis: chartConfig.useAxis ?? true,
              title: chartConfig.title || `${yVariable} Distribution`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else {
      // Implementasi untuk jenis chart lain
      self.postMessage({ success: false, error: "Unsupported chart type." });
    }
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
