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
  console.log("chartVariables:", JSON.stringify(chartVariables, null, 2));

  const xVariables = chartVariables.x;
  const yVariables = chartVariables.y;
  const groupByVariables = chartVariables.groupBy;
  const lowVariables = chartVariables.low;
  const highVariables = chartVariables.high;
  const closeVariables = chartVariables.close;
  const y2Variables = chartVariables.y2;
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
    } else if (chartType === "Stacked Area Chart") {
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
    } else if (chartType === "Grouped Scatter Plot") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const yVariable = yVariables[0];
      const groupByVariable = groupByVariables[0];
      console.log("Requested xVariable:", xVariable);
      console.log("Requested yVariables:", yVariable);
      console.log("Requested groupByVariable:", groupByVariable);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);
      const groupByIndex = variables.findIndex(
        (v) => v.name === groupByVariable
      );

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }
      if (yIndex === -1) {
        throw new Error(`Variabel y '${yVariable}' tidak ditemukan.`);
      }
      if (groupByIndex === -1) {
        throw new Error(
          `Variabel group by '${groupedByVariable}' tidak ditemukan.`
        );
      }

      const chartData = data
        .map((row) => {
          const group = row[groupByIndex]; // Ambil kategori dari groupByVariable
          const xValue = parseFloat(row[xIndex]); // Ambil nilai X
          const yValue = parseFloat(row[yIndex]); // Ambil nilai Y

          // Pastikan nilai x dan y valid
          if (!isNaN(xValue) && !isNaN(yValue)) {
            return {
              category: group,
              x: xValue,
              y: yValue,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      // Konversi ke format data yang bisa digunakan oleh chart
      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                x: xVariable,
                y: yVariable,
                category: groupByVariable,
              },
              description: `Distribution of ${xVariable} and ${yVariable} based on ${groupByVariable}.`,
              notes: chartMetadata.note || null,
            },
            chartData: chartData,
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.color || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title:
                chartConfig.title ??
                `Distribution of ${yVariable} by ${xVariable}`,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Dot Plot") {
      const xVariable = xVariables[0];
      const yVariable = yVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (xIndex === -1 || yIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      const frequencyMap = data.reduce((acc, row) => {
        const key = row[xIndex]; // Menggunakan nilai dari xVariable untuk kategori
        const yValue = parseFloat(row[yIndex]); // Menggunakan nilai dari yVariable untuk nilai

        if (!isNaN(yValue)) {
          // Jika key sudah ada, push nilai yValue ke array, jika belum buat array baru
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(yValue);
        }

        return acc;
      }, {});

      // Membentuk format yang sesuai dengan output yang diinginkan
      // const chartData = Object.keys(frequencyMap).flatMap((key) => {
      //   return frequencyMap[key].map((value) => ({
      //     category: key,
      //     value: value,
      //   }));
      // });

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
            chartData: Object.keys(frequencyMap).flatMap((key) => {
              return frequencyMap[key].map((value) => ({
                category: key,
                value: value,
              }));
            }), // Menggunakan data yang sudah diformat
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
    } else if (chartType === "Frequency Polygon") {
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
    } else if (chartType === "Population Pyramid") {
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
    } else if (chartType === "Stacked Histogram") {
      const xVariable = xVariables[0];
      const groupByVariable = groupByVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const groupByIndex = variables.findIndex(
        (v) => v.name === groupByVariable
      );

      if (xIndex === -1 || groupByIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      // Kita akan menyimpan setiap entry terpisah
      const chartData = data
        .map((row) => {
          const category = row[groupByIndex];
          const xValue = parseFloat(row[xIndex]);

          if (!isNaN(xValue)) {
            return {
              value: xValue,
              category: category,
            };
          }

          return null; // Menghindari nilai yang tidak valid
        })
        .filter((item) => item !== null); // Hapus nilai yang null jika ada

      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: groupByVariable,
                value: xVariable,
              },
              description: `Data ${xVariable} per ${groupByVariable} in the dataset`,
              notes: chartMetadata.note || null,
            },
            chartData: chartData, // ChartData yang berisi entry terpisah
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
    } else if (chartType === "Clustered Error Bar Chart") {
      const xVariable = xVariables[0];
      const yVariable = yVariables[0];
      const groupByVariable = groupByVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);
      const groupByIndex = variables.findIndex(
        (v) => v.name === groupByVariable
      );

      if (xIndex === -1 || yIndex === -1 || groupByIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      // Kita akan menyimpan setiap entry terpisah
      const chartData = data
        .map((row) => {
          const category = row[xIndex]; // category dari xVariable
          const subcategory = row[groupByIndex]; // subcategory dari groupByVariable
          const value = parseFloat(row[yIndex]); // value dari yVariable

          // Assuming you have a way to calculate or fetch the error (e.g., based on some formula or data)
          const error = 2; // Placeholder for error calculation, replace it with your actual logic.

          if (!isNaN(value)) {
            return {
              category: category,
              subcategory: subcategory,
              value: value,
              error: error,
            };
          }

          return null; // Avoid invalid values
        })
        .filter((item) => item !== null); // Filter out null values

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
            chartData: chartData, // ChartData that holds individual entries
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
    } else if (chartType === "Scatter Plot Matrix") {
      const xVariable = xVariables[0];
      const xIndices = xVariables.map((v) =>
        variables.findIndex((varObj) => varObj.name === v)
      );

      if (xIndices.includes(-1)) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      // Kita akan menyimpan setiap entry terpisah sesuai dengan format Scatterplot Matrix
      const chartData = data
        .map((row) => {
          const entry = {}; // Start with an empty object for each row

          // For each xVariable, dynamically set the key to the variable name and value to the row's value
          xVariables.forEach((variable, idx) => {
            const value = parseFloat(row[xIndices[idx]]);
            if (!isNaN(value)) {
              entry[variable] = value; // Add key-value pair to entry
            }
          });

          // Only return the entry if it contains valid values
          return Object.keys(entry).length === xVariables.length ? entry : null;
        })
        .filter((item) => item !== null); // Remove any null entries

      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariables.join(", "),
                value: "Values for each variable",
              },
              description: `Scatterplot matrix for ${xVariables.join(
                ", "
              )} in the dataset`,
              notes: chartMetadata.note || null,
            },
            chartData: chartData, // ChartData that holds individual entries
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
    } else if (chartType === "Clustered Boxplot") {
      const xVariable = xVariables[0];
      const yVariable = yVariables[0];
      const groupByVariable = groupByVariables[0];

      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);
      const groupByIndex = variables.findIndex(
        (v) => v.name === groupByVariable
      );

      if (xIndex === -1 || yIndex === -1 || groupByIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      // Kita akan menyimpan setiap entry terpisah
      const chartData = data
        .map((row) => {
          const category = row[xIndex]; // category dari xVariable
          const subcategory = row[groupByIndex]; // subcategory dari groupByVariable
          const value = parseFloat(row[yIndex]); // value dari yVariable

          if (!isNaN(value)) {
            return {
              category: category,
              subcategory: subcategory,
              value: value,
            };
          }

          return null; // Avoid invalid values
        })
        .filter((item) => item !== null); // Filter out null values

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
            chartData: chartData, // ChartData that holds individual entries
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
    } else if (chartType === "1-D Boxplot") {
      const yVariable = yVariables[0];

      const yIndex = variables.findIndex((v) => v.name === yVariable);

      if (yIndex === -1) {
        throw new Error("Salah satu variabel tidak ditemukan.");
      }

      const frequencyMap = data.reduce((acc, row) => {
        const yValue = parseFloat(row[yIndex]); // Nilai (misalnya 20, 40, dst.)
        if (!isNaN(yValue)) {
          // Pastikan format data yang benar
          acc.push({ value: yValue });
        }

        return acc;
      }, []);

      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                value: yVariable,
              },
              description: ``,
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
    } else if (chartType === "Simple Range Bar") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const lowVariable = lowVariables[0];
      const highVariable = highVariables[0];
      const closeVariable = closeVariables[0];

      console.log("Requested xVariable:", xVariable);
      console.log("Requested lowVariables:", lowVariable);
      console.log("Requested highVariables:", highVariable);
      console.log("Requested closeVariables:", closeVariable);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const lowIndex = variables.findIndex((v) => v.name === lowVariable);
      const highIndex = variables.findIndex((v) => v.name === highVariable);
      const closeIndex = variables.findIndex((v) => v.name === closeVariable);

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }

      if (lowIndex === -1) {
        throw new Error(`Variabel low '${lowVariable}' tidak ditemukan.`);
      }

      if (highIndex === -1) {
        throw new Error(`Variabel high '${highVariable}' tidak ditemukan.`);
      }

      if (closeIndex === -1) {
        throw new Error(`Variabel close '${closeVariable}' tidak ditemukan.`);
      }

      // Kelompokkan data berdasarkan kategori X tanpa menjumlahkan nilai
      const frequencyMap = data.reduce((acc, row) => {
        const xKey = row[xIndex]; // Ambil nilai X
        const lowValue = parseFloat(row[lowIndex]); // Ambil nilai low
        const highValue = parseFloat(row[highIndex]); // Ambil nilai high
        const closeValue = parseFloat(row[closeIndex]); // Ambil nilai close

        // Jika kategori X belum ada dalam accumulator, inisialisasi kategori tersebut
        if (!acc[xKey]) {
          acc[xKey] = [];
        }

        // Tambahkan nilai ke dalam array untuk kategori yang sesuai
        acc[xKey].push({
          low: lowValue,
          high: highValue,
          close: closeValue,
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
                low: lowVariable,
                high: highVariable,
                close: closeVariable,
              },
              description: chartMetadata.description || null,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap)
              .map((key) => {
                const entries = frequencyMap[key];
                return entries.map((entry) => ({
                  category: key,
                  low: entry.low,
                  high: entry.high,
                  close: entry.close,
                }));
              })
              .flat(), // `flat()` untuk meratakan array yang berbentuk array of arrays
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.color || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title ?? null,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Clustered Range Bar") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const groupByVariable = groupByVariables[0];
      const lowVariable = lowVariables[0];
      const highVariable = highVariables[0];
      const closeVariable = closeVariables[0];

      console.log("Requested xVariable:", xVariable);
      console.log("Requested groupByVariable:", groupByVariable);
      console.log("Requested lowVariables:", lowVariable);
      console.log("Requested highVariables:", highVariable);
      console.log("Requested closeVariables:", closeVariable);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const groupByIndex = variables.findIndex(
        (v) => v.name === groupByVariable
      );
      const lowIndex = variables.findIndex((v) => v.name === lowVariable);
      const highIndex = variables.findIndex((v) => v.name === highVariable);
      const closeIndex = variables.findIndex((v) => v.name === closeVariable);

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }

      if (xIndex === -1) {
        throw new Error(
          `Variabel groupBy '${groupByVariable}' tidak ditemukan.`
        );
      }

      if (lowIndex === -1) {
        throw new Error(`Variabel low '${lowVariable}' tidak ditemukan.`);
      }

      if (highIndex === -1) {
        throw new Error(`Variabel high '${highVariable}' tidak ditemukan.`);
      }

      if (closeIndex === -1) {
        throw new Error(`Variabel close '${closeVariable}' tidak ditemukan.`);
      }

      // Kelompokkan data berdasarkan kategori X tanpa menjumlahkan nilai
      const frequencyMap = data.reduce((acc, row) => {
        const xKey = row[xIndex];
        const groupByValue = row[groupByIndex];
        const lowValue = parseFloat(row[lowIndex]);
        const highValue = parseFloat(row[highIndex]);
        const closeValue = parseFloat(row[closeIndex]);

        // Jika kategori X belum ada dalam accumulator, inisialisasi kategori tersebut
        if (!acc[xKey]) {
          acc[xKey] = [];
        }

        // Tambahkan nilai ke dalam array untuk kategori yang sesuai
        acc[xKey].push({
          subcategory: groupByValue,
          low: lowValue,
          high: highValue,
          close: closeValue,
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
                subcategory: groupByVariable,
                low: lowVariable,
                high: highVariable,
                close: closeVariable,
              },
              description: chartMetadata.description || null,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap)
              .map((key) => {
                const entries = frequencyMap[key];
                return entries.map((entry) => ({
                  category: key,
                  subcategory: entry.subcategory,
                  low: entry.low,
                  high: entry.high,
                  close: entry.close,
                }));
              })
              .flat(), // `flat()` untuk meratakan array yang berbentuk array of arrays
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.color || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title ?? null,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "High-Low-Close Chart") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const lowVariable = lowVariables[0];
      const highVariable = highVariables[0];
      const closeVariable = closeVariables[0];

      console.log("Requested xVariable:", xVariable);
      console.log("Requested lowVariables:", lowVariable);
      console.log("Requested highVariables:", highVariable);
      console.log("Requested closeVariables:", closeVariable);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const lowIndex = variables.findIndex((v) => v.name === lowVariable);
      const highIndex = variables.findIndex((v) => v.name === highVariable);
      const closeIndex = variables.findIndex((v) => v.name === closeVariable);

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }

      if (lowIndex === -1) {
        throw new Error(`Variabel low '${lowVariable}' tidak ditemukan.`);
      }

      if (highIndex === -1) {
        throw new Error(`Variabel high '${highVariable}' tidak ditemukan.`);
      }

      if (closeIndex === -1) {
        throw new Error(`Variabel close '${closeVariable}' tidak ditemukan.`);
      }

      // Kelompokkan data berdasarkan kategori X tanpa menjumlahkan nilai
      const frequencyMap = data.reduce((acc, row) => {
        const xKey = row[xIndex]; // Ambil nilai X
        const lowValue = parseFloat(row[lowIndex]); // Ambil nilai low
        const highValue = parseFloat(row[highIndex]); // Ambil nilai high
        const closeValue = parseFloat(row[closeIndex]); // Ambil nilai close

        // Jika kategori X belum ada dalam accumulator, inisialisasi kategori tersebut
        if (!acc[xKey]) {
          acc[xKey] = [];
        }

        // Tambahkan nilai ke dalam array untuk kategori yang sesuai
        acc[xKey].push({
          low: lowValue,
          high: highValue,
          close: closeValue,
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
                low: lowVariable,
                high: highVariable,
                close: closeVariable,
              },
              description: chartMetadata.description || null,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap)
              .map((key) => {
                const entries = frequencyMap[key];
                return entries.map((entry) => ({
                  category: key,
                  low: entry.low,
                  high: entry.high,
                  close: entry.close,
                }));
              })
              .flat(), // `flat()` untuk meratakan array yang berbentuk array of arrays
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.color || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title ?? null,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Difference Area") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const lowVariable = lowVariables[0];
      const highVariable = highVariables[0];

      console.log("Requested xVariable:", xVariable);
      console.log("Requested lowVariables:", lowVariable);
      console.log("Requested highVariables:", highVariable);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const lowIndex = variables.findIndex((v) => v.name === lowVariable);
      const highIndex = variables.findIndex((v) => v.name === highVariable);

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }

      if (lowIndex === -1) {
        throw new Error(`Variabel low '${lowVariable}' tidak ditemukan.`);
      }

      if (highIndex === -1) {
        throw new Error(`Variabel high '${highVariable}' tidak ditemukan.`);
      }

      // Kelompokkan data berdasarkan kategori X tanpa menjumlahkan nilai
      const frequencyMap = data.reduce((acc, row) => {
        const xKey = row[xIndex]; // Ambil nilai X
        const lowValue = parseFloat(row[lowIndex]); // Ambil nilai low
        const highValue = parseFloat(row[highIndex]); // Ambil nilai high

        // Jika kategori X belum ada dalam accumulator, inisialisasi kategori tersebut
        if (!acc[xKey]) {
          acc[xKey] = [];
        }

        // Tambahkan nilai ke dalam array untuk kategori yang sesuai
        acc[xKey].push({
          low: lowValue,
          high: highValue,
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
                value0: lowVariable,
                value1: highVariable,
              },
              description: chartMetadata.description || null,
              notes: chartMetadata.note || null,
            },
            chartData: Object.keys(frequencyMap)
              .map((key) => {
                const entries = frequencyMap[key];
                return entries.map((entry) => ({
                  category: key,
                  value0: entry.low,
                  value1: entry.high,
                }));
              })
              .flat(), // `flat()` untuk meratakan array yang berbentuk array of arrays
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.color || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title ?? null,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Drop Line Chart") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const yVariable = yVariables[0];
      const groupByVariable = groupByVariables[0];
      console.log("Requested xVariable:", xVariable);
      console.log("Requested yVariables:", yVariable);
      console.log("Requested groupByVariable:", groupByVariable);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);
      const groupByIndex = variables.findIndex(
        (v) => v.name === groupByVariable
      );

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }
      if (yIndex === -1) {
        throw new Error(`Variabel y '${yVariable}' tidak ditemukan.`);
      }
      if (groupByIndex === -1) {
        throw new Error(
          `Variabel group by '${groupedByVariable}' tidak ditemukan.`
        );
      }

      const chartData = data
        .map((row) => {
          const group = row[groupByIndex]; // Ambil kategori dari groupByVariable
          const xValue = row[xIndex]; // Ambil nilai X
          const yValue = parseFloat(row[yIndex]); // Ambil nilai Y

          // Pastikan nilai y valid
          if (!isNaN(yValue)) {
            return {
              category: group,
              x: xValue,
              y: yValue,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      // Konversi ke format data yang bisa digunakan oleh chart
      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                x: xVariable,
                y: yVariable,
                category: groupByVariable,
              },
              description: chartMetadata.description || null,
              notes: chartMetadata.note || null,
            },
            chartData: chartData,
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.color || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title ?? null,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Summary Point Plot") {
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
              description: chartMetadata.description || null,
              notes: chartMetadata.note || null,
            },
            chartData: frequencyMap,
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.chartColor || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title || null,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Vertical Bar & Line Chart") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const yVariable = yVariables[0];
      const y2Variable = y2Variables[0];
      console.log("Requested xVariable:", xVariable);
      console.log("Requested yVariables:", yVariable);
      console.log("Requested y2Variable:", y2Variable);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);
      const y2Index = variables.findIndex((v) => v.name === y2Variable);

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }
      if (yIndex === -1) {
        throw new Error(`Variabel y '${yVariable}' tidak ditemukan.`);
      }
      if (y2Index === -1) {
        throw new Error(`Variabel group by '${y2Variable}' tidak ditemukan.`);
      }

      const chartData = data
        .map((row) => {
          const category = row[xIndex]; // Ambil kategori dari groupByVariable
          const yValue = parseFloat(row[yIndex]); // Ambil nilai Y
          const y2Value = parseFloat(row[y2Index]); // Ambil nilai X

          // Pastikan nilai x dan y valid
          if (!isNaN(yValue) && !isNaN(y2Value)) {
            return {
              category: category,
              barValue: yValue,
              lineValue: y2Value,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      // Konversi ke format data yang bisa digunakan oleh chart
      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                category: xVariable,
                barValue: yVariable,
                lineValue: y2Variable,
              },
              description: chartMetadata.description || null,
              notes: chartMetadata.note || null,
            },
            chartData: chartData,
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.color || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title ?? null,
            },
          },
        ],
      };

      self.postMessage({ success: true, chartJSON });
    } else if (chartType === "Dual Axes Scatter Plot") {
      // Debugging output untuk memeriksa nama-nama variabel yang dicari
      console.log(
        "Variables in dataset:",
        variables.map((v) => v.name)
      );

      const xVariable = xVariables[0];
      const yVariable = yVariables[0];
      const y2Variable = y2Variables[0];
      console.log("Requested xVariable:", xVariable);
      console.log("Requested yVariables:", yVariable);
      console.log("Requested y2Variable:", y2Variable);

      // Temukan indeks dari variabel-variabel X dan Y
      const xIndex = variables.findIndex((v) => v.name === xVariable);
      const yIndex = variables.findIndex((v) => v.name === yVariable);
      const y2Index = variables.findIndex((v) => v.name === y2Variable);

      // Periksa jika variabel tidak ditemukan
      if (xIndex === -1) {
        throw new Error(`Variabel X '${xVariable}' tidak ditemukan.`);
      }
      if (yIndex === -1) {
        throw new Error(`Variabel y '${yVariable}' tidak ditemukan.`);
      }
      if (y2Index === -1) {
        throw new Error(`Variabel group by '${y2Variable}' tidak ditemukan.`);
      }

      const chartData = data
        .map((row) => {
          const xValue = parseFloat(row[xIndex]); // Ambil kategori dari groupByVariable
          const yValue = parseFloat(row[yIndex]); // Ambil nilai Y
          const y2Value = parseFloat(row[y2Index]); // Ambil nilai X

          // Pastikan nilai x dan y valid
          if (!isNaN(xValue) && !isNaN(yValue) && !isNaN(y2Value)) {
            return {
              x: xValue,
              y1: yValue,
              y2: y2Value,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      // Konversi ke format data yang bisa digunakan oleh chart
      const chartJSON = {
        charts: [
          {
            chartType: chartType,
            chartMetadata: {
              axisInfo: {
                x: xVariable,
                y1: yVariable,
                y2: y2Variable,
              },
              description: chartMetadata.description || null,
              notes: chartMetadata.note || null,
            },
            chartData: chartData,
            chartConfig: {
              width: chartConfig.width || 600,
              height: chartConfig.height || 400,
              chartColor: chartConfig.color || ["#4682B4"],
              useAxis: chartConfig.useAxis ?? true,
              useLegend: chartConfig.useLegend ?? true,
              title: chartConfig.title ?? null,
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
