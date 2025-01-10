import React, { useEffect, useRef, useState } from "react";
import { useDataStore } from "@/stores/useDataStore"; // Mengambil data dari useDataStore
import { useVariableStore } from "@/stores/useVariableStore"; // Mengambil variabel dari useVariableStore
import { chartUtils } from "@/utils/chartBuilder/chartTypes/chartUtils";
import * as d3 from "d3"; // Mengimpor D3.js
import { ChartType } from "@/components/Modals/Graphs/ChartTypes";

interface ChartPreviewProps {
  chartType: ChartType;
  width: number;
  height: number;
  useaxis: boolean;
  variableNames: string[];
  setVariableNames: React.Dispatch<React.SetStateAction<string[]>>;
}

interface ChartVariableRequirements {
  side: {
    min: number;
    max: number;
  };
  bottom: {
    min: number;
    max: number;
  };
}

// Definisi interface untuk data chart
interface ChartData {
  category: string;
  subcategory: string;
  value: number;
}
const chartVariableConfig: Record<ChartType, ChartVariableRequirements> = {
  bar2: {
    side: { min: 1, max: 1 },
    bottom: { min: 1, max: 1 },
  },
  Bar3: {
    side: { min: 1, max: 1 },
    bottom: { min: 1, max: 1 },
  },
  Line: {
    side: { min: 1, max: 1 },
    bottom: { min: 1, max: 1 },
  },
  Pie: {
    side: { min: 1, max: 1 },
    bottom: { min: 1, max: 1 },
  },
  Area: {
    side: { min: 1, max: 1 },
    bottom: { min: 1, max: 1 },
  },
  Histogram: {
    side: { min: 0, max: 0 },
    bottom: { min: 1, max: 1 },
  },
  Scatter: {
    side: { min: 1, max: 1 },
    bottom: { min: 1, max: 1 },
  },
  "Scatter Fit Line": {
    side: { min: 1, max: 1 },
    bottom: { min: 1, max: 1 },
  },
  Boxplot: {
    side: { min: 1, max: 1 },
    bottom: { min: 1, max: 1 },
  },
  "Horizontal Stacked Bar": {
    side: { min: 1, max: Infinity },
    bottom: { min: 1, max: 1 },
  },
  "Vertical Stacked Bar": {
    side: { min: 1, max: Infinity },
    bottom: { min: 1, max: 1 },
  },
  "Grouped Bar": {
    side: { min: 1, max: Infinity },
    bottom: { min: 1, max: 1 },
  },
  "Multi Line": {
    side: { min: 1, max: Infinity },
    bottom: { min: 1, max: 1 },
  },
  "Error Bar": {
    side: { min: 1, max: 1 },
    bottom: { min: 1, max: 1 },
  },
};

const ChartPreview: React.FC<ChartPreviewProps> = ({
  chartType,
  width,
  height,
  useaxis,
  variableNames,
  setVariableNames,
}) => {
  const { data, loadData } = useDataStore(); // Mengambil data dari useDataStore
  const { variables, loadVariables } = useVariableStore(); // Mengambil variabel dari useVariableStore
  const [sideVariables, setSideVariables] = useState<string[]>([]); // Variabel untuk sisi
  const [bottomVariables, setBottomVariables] = useState<string[]>([]); // Variabel untuk bawah
  const [subCategoryVariable, setSubCategoryVariable] = useState<string | null>(
    null
  ); // Variabel untuk subkategori (khusus stacked bar)
  const svgRef = useRef<SVGSVGElement | null>(null); // Referensi untuk elemen SVG

  // Memuat data dan variabel ketika komponen pertama kali dimuat
  useEffect(() => {
    loadData(); // Memuat data dari useDataStore
    loadVariables(45); // Memuat variabel dari useVariableStore
  }, [loadData, loadVariables]);

  // Fungsi untuk menangani drag start
  const handleDragStart = (e: React.DragEvent, variable: string) => {
    e.dataTransfer.setData("text", variable); // Menyimpan nama variabel untuk dipindahkan
  };

  // Fungsi untuk menangani drop variabel
  const handleDrop = (e: React.DragEvent, area: "side" | "bottom" | "sub") => {
    e.preventDefault();
    const droppedVariable = e.dataTransfer.getData("text");

    const config = chartVariableConfig[chartType];

    if (!config) {
      console.error("Chart type not supported:", chartType);
      return;
    }

    // Cek area dan update sesuai dengan area yang di-drop
    if (area === "side") {
      if (config.side.max === 1) {
        setSideVariables([droppedVariable]);
      } else {
        setSideVariables((prev) => {
          if (prev.length < config.side.max) {
            return [...prev, droppedVariable];
          } else {
            // Misalnya, mengabaikan atau menimpa variabel pertama
            return [...prev.slice(1), droppedVariable];
          }
        });
      }
    } else if (area === "bottom") {
      if (config.bottom.max === 1) {
        setBottomVariables([droppedVariable]);
      } else {
        setBottomVariables((prev) => {
          if (prev.length < config.bottom.max) {
            return [...prev, droppedVariable];
          } else {
            // Misalnya, mengabaikan atau menimpa variabel pertama
            return [...prev.slice(1), droppedVariable];
          }
        });
      }
    } else if (area === "sub") {
      setSubCategoryVariable(droppedVariable);
    }
  };

  // Fungsi untuk menangani drag over untuk area drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Ambil data berdasarkan variabel yang dipilih
  // const getDataForChart = () => {
  //   const bottomIndex = variables.findIndex(
  //     (variable) => variable.name === bottomVariables[0]
  //   );
  //   const sideIndex = variables.findIndex(
  //     (variable) => variable.name === sideVariables[0]
  //   );

  //   // Jika kedua variabel kosong, kembali ke data default
  //   if (sideIndex === -1 && bottomIndex === -1) {
  //     return []; // Data tidak valid, jadi jangan tampilkan chart
  //   }

  //   // Jika hanya ada bottomVariables yang valid, ambil hanya data itu saja
  //   if (bottomIndex !== -1 && sideIndex === -1) {
  //     return data.map((row) => ({
  //       category: row[bottomIndex],
  //       value: 0, // Set nilai default jika sideVariables kosong
  //     }));
  //   }

  //   // Jika hanya ada sideVariables yang valid, ambil hanya data itu saja
  //   if (sideIndex !== -1 && bottomIndex === -1) {
  //     return data.map((row) => ({
  //       category: "Unknown", // Set kategori default jika bottomVariables kosong
  //       value: parseFloat(row[sideIndex]),
  //     }));
  //   }

  //   // Jika kedua variabel valid, ambil data berdasarkan kedua variabel
  //   return data.map((row) => ({
  //     category: row[bottomIndex], // Kategori dari bottomVariables
  //     value: parseFloat(row[sideIndex]), // Nilai dari sideVariables
  //   }));
  // };

  // Fungsi untuk mengambil data chart
  const getDataForChart = (): ChartData[] => {
    const bottomIndex = variables.findIndex(
      (variable) => variable.name === bottomVariables[0]
    );

    const sideIndices = sideVariables.map((varName) =>
      variables.findIndex((variable) => variable.name === varName)
    );

    // Cek apakah tidak ada variabel bottom maupun side yang valid
    if (bottomIndex === -1 && sideIndices.every((index) => index === -1)) {
      return [];
    }

    // Jika hanya ada variabel bottom yang valid
    if (bottomIndex !== -1 && sideIndices.every((index) => index === -1)) {
      return data.map((row) => ({
        category: row[bottomIndex],
        subcategory: "Unknown", // Atau nilai default lainnya
        value: 0,
      }));
    }

    // Jika ada variabel side yang valid tetapi tidak ada variabel bottom
    if (sideIndices.some((index) => index !== -1) && bottomIndex === -1) {
      const results: ChartData[] = []; // Tipe secara eksplisit ditentukan

      data.forEach((row) => {
        sideIndices.forEach((index, i) => {
          if (index !== -1) {
            results.push({
              category: "unknown",
              subcategory: sideVariables[i],
              value: parseFloat(row[index] || "0"),
            });
          }
        });
      });

      console.log("Hasil akhir (results):", results);
      return results;
    }

    // Filter indeks variabel side yang valid
    const validSideIndices = sideIndices.filter((index) => index !== -1);

    if (validSideIndices.length === 1) {
      // Kasus satu variabel side
      const sideIndex = validSideIndices[0];
      const sideVariableName = sideVariables[sideIndices.indexOf(sideIndex)];
      return data.map((row) => ({
        category: row[bottomIndex],
        subcategory: sideVariableName, // Atau bisa juga sideVariables[0] jika ingin menyimpan nama variabel side
        value: parseFloat(row[sideIndex] || "0"),
      }));
    } else {
      // Kasus lebih dari satu variabel side
      const results: ChartData[] = [];

      data.forEach((row) => {
        sideIndices.forEach((index, i) => {
          if (index !== -1) {
            results.push({
              category: row[bottomIndex],
              subcategory: sideVariables[i],
              value: parseFloat(row[index] || "0"),
            });
          }
        });
      });

      return results;
    }
  };

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Menghapus chart sebelumnya

      // Ambil data untuk chart, jika variabel tidak ada gunakan data default
      const chartData = getDataForChart();

      // Switch case untuk memilih jenis chart berdasarkan chartType
      let chartNode = null;

      switch (chartType) {
        case "bar2":
          chartNode =
            chartData.length === 0
              ? chartUtils.createVerticalBarChart2(
                  [
                    // Default data jika tidak ada variabel yang dipilih
                    { category: "A", value: 30 },
                    { category: "B", value: 80 },
                    { category: "C", value: 45 },
                    { category: "D", value: 60 },
                    { category: "E", value: 20 },
                    { category: "F", value: 90 },
                  ],
                  width,
                  height,
                  useaxis
                )
              : chartUtils.createVerticalBarChart2(
                  chartData,
                  width,
                  height,
                  useaxis
                );
          break;

        case "Bar3":
          chartNode =
            chartData.length === 0
              ? chartUtils.createHorizontalBarChart(
                  [
                    // Default data jika tidak ada variabel yang dipilih
                    { category: "A", value: 30 },
                    { category: "B", value: 80 },
                    { category: "C", value: 45 },
                    { category: "D", value: 60 },
                    { category: "E", value: 20 },
                    { category: "F", value: 90 },
                  ],
                  width,
                  height,
                  useaxis
                )
              : chartUtils.createHorizontalBarChart(
                  chartData,
                  width,
                  height,
                  useaxis
                );
          break;

        case "Vertical Stacked Bar": {
          // Bungkus dalam blok {}
          const formattedData =
            chartData.length === 0
              ? [
                  { category: "male", subcategory: "blue", value: 30 },
                  { category: "male", subcategory: "white", value: 20 },
                  { category: "male", subcategory: "green", value: 10 },
                  { category: "female", subcategory: "blue", value: 25 },
                  { category: "female", subcategory: "white", value: 15 },
                  { category: "female", subcategory: "green", value: 10 },
                ]
              : chartData;

          chartNode = chartUtils.createVerticalStackedBarChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Horizontal Stacked Bar": {
          // Bungkus dalam blok {}
          const formattedData =
            chartData.length === 0
              ? [
                  { category: "male", subcategory: "blue", value: 30 },
                  { category: "male", subcategory: "white", value: 20 },
                  { category: "male", subcategory: "green", value: 10 },
                  { category: "female", subcategory: "blue", value: 25 },
                  { category: "female", subcategory: "white", value: 15 },
                  { category: "female", subcategory: "green", value: 10 },
                ]
              : chartData;

          chartNode = chartUtils.createHorizontalStackedBarChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Grouped Bar": {
          // Bungkus dalam blok {}
          const formattedData =
            chartData.length === 0
              ? [
                  { category: "male", subcategory: "blue", value: 30 },
                  { category: "male", subcategory: "white", value: 20 },
                  { category: "male", subcategory: "green", value: 10 },
                  { category: "female", subcategory: "blue", value: 25 },
                  { category: "female", subcategory: "white", value: 15 },
                  { category: "female", subcategory: "green", value: 10 },
                ]
              : chartData;

          chartNode = chartUtils.createGroupedBarChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Line":
          chartNode =
            chartData.length === 0
              ? chartUtils.createLineChart(
                  [
                    // Default data jika tidak ada variabel yang dipilih
                    { category: "2023-01-01", value: 10 },
                    { category: "2023-01-02", value: 30 },
                    { category: "2023-01-03", value: 55 },
                    { category: "2023-01-04", value: 60 },
                    { category: "2023-01-05", value: 70 },
                    { category: "2023-01-06", value: 90 },
                    { category: "2023-01-07", value: 55 },
                    { category: "2023-01-08", value: 30 },
                    { category: "2023-01-09", value: 50 },
                    { category: "2023-01-10", value: 20 },
                    { category: "2023-01-11", value: 25 },
                  ],
                  width,
                  height,
                  useaxis
                )
              : chartUtils.createLineChart(chartData, width, height, useaxis);
          break;

        case "Multi Line": {
          const formattedData =
            chartData.length === 0
              ? [
                  {
                    category: "Product A",
                    subcategory: "Division 1",
                    value: 30,
                  },
                  {
                    category: "Product A",
                    subcategory: "Division 2",
                    value: 20,
                  },
                  {
                    category: "Product B",
                    subcategory: "Division 1",
                    value: 25,
                  },
                  {
                    category: "Product B",
                    subcategory: "Division 2",
                    value: 15,
                  },
                  {
                    category: "Product C",
                    subcategory: "Division 1",
                    value: 40,
                  },
                  {
                    category: "Product C",
                    subcategory: "Division 2",
                    value: 10,
                  },
                ]
              : chartData;

          chartNode = chartUtils.createMultilineChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Pie": // Tambahkan case baru untuk Pie chart
          chartNode =
            chartData.length === 0
              ? chartUtils.createPieChart(
                  [
                    // Data default jika tidak ada variabel yang dipilih
                    { category: "A", value: 30 },
                    { category: "B", value: 80 },
                    { category: "C", value: 45 },
                    { category: "D", value: 60 },
                    { category: "E", value: 20 },
                    { category: "F", value: 90 },
                  ],
                  width,
                  height
                )
              : chartUtils.createPieChart(chartData, width, height);
          break;

        case "Area":
          chartNode =
            chartData.length === 0
              ? chartUtils.createAreaChart(
                  [
                    // Default data jika tidak ada variabel yang dipilih
                    { category: "2023-01-01", value: 10 },
                    { category: "2023-01-02", value: 30 },
                    { category: "2023-01-03", value: 55 },
                    { category: "2023-01-04", value: 60 },
                    { category: "2023-01-05", value: 70 },
                    { category: "2023-01-06", value: 90 },
                    { category: "2023-01-07", value: 55 },
                    { category: "2023-01-08", value: 30 },
                    { category: "2023-01-09", value: 50 },
                    { category: "2023-01-10", value: 20 },
                    { category: "2023-01-11", value: 25 },
                  ],
                  width,
                  height,
                  useaxis
                )
              : chartUtils.createAreaChart(chartData, width, height, useaxis);
          break;

        case "Histogram": // Menambahkan case baru untuk Histogram
          // Mengambil hanya nilai 'value' dari chartData
          const histogramData =
            chartData.length === 0
              ? [5, 8, 9, 7, 3, 6, 3, 7, 3, 2, 9, 1, 4, 2, 5]
              : chartData.map((d) => d.value); // Mengambil hanya nilai dari chartData

          chartNode = chartUtils.createHistogram(
            histogramData, // Pastikan ini hanya array angka
            width,
            height,
            useaxis
          );
          break;

        case "Scatter": // Menambahkan case baru untuk Scatter plot
          // Ambil data scatter jika tidak ada data default
          const scatterData =
            chartData.length === 0
              ? [
                  { x: 15, y: 50 },
                  { x: 20, y: 200 },
                  { x: 60, y: 100 },
                  { x: 200, y: 325 },
                  { x: 80, y: 150 },
                  { x: 130, y: 275 },
                  { x: 50, y: 220 },
                  { x: 170, y: 300 },
                  { x: 100, y: 30 },
                  { x: 170, y: 125 },
                  { x: 150, y: 80 },
                  { x: 100, y: 190 },
                  { x: 95, y: 75 },
                ]
              : chartData.map((d) => ({
                  x: Number(d.category), // Konversi category ke number
                  y: d.value, // Tetap gunakan value sebagai y
                }));

          chartNode = chartUtils.createScatterPlot(
            scatterData, // Data untuk Scatter plot
            width,
            height,
            useaxis
          );
          break;

        case "Scatter Fit Line": // Menambahkan case baru untuk Scatter plot dengan Fit Line
          // Ambil data scatter dengan fit line jika tidak ada data default
          const scatterWithFitLineData =
            chartData.length === 0
              ? [
                  { x: 15, y: 50 },
                  { x: 20, y: 200 },
                  { x: 60, y: 100 },
                  { x: 200, y: 325 },
                  { x: 80, y: 150 },
                  { x: 130, y: 275 },
                  { x: 50, y: 220 },
                  { x: 170, y: 300 },
                  { x: 100, y: 30 },
                  { x: 170, y: 125 },
                  { x: 150, y: 80 },
                  { x: 100, y: 190 },
                  { x: 95, y: 75 },
                ]
              : chartData.map((d) => ({
                  x: Number(d.category), // Konversi category ke number
                  y: d.value, // Tetap gunakan value sebagai y
                }));

          chartNode = chartUtils.createScatterPlotWithFitLine(
            scatterWithFitLineData, // Data untuk Scatter plot dengan Fit Line
            width,
            height,
            useaxis
          );
          break;

        case "Boxplot": // Menambahkan case baru untuk BoxPlot
          // Ambil data box plot jika tidak ada data default
          const boxPlotData =
            chartData.length === 0
              ? [
                  { category: "A", value: 20 },
                  { category: "A", value: 40 },
                  { category: "A", value: 60 },
                  { category: "A", value: 80 },
                  { category: "B", value: 30 },
                  { category: "B", value: 50 },
                  { category: "B", value: 70 },
                  { category: "B", value: 90 },
                ]
              : chartData.map((d) => ({
                  category: d.category, // Gunakan category untuk mengganti x
                  value: d.value, // Gunakan value untuk mengganti y
                }));

          // Memanggil fungsi untuk membuat BoxPlot
          chartNode = chartUtils.createBoxPlot(
            boxPlotData, // Data untuk Box Plot
            width,
            height,
            useaxis // Pilihan untuk menampilkan sumbu
          );
          break;

        case "Error Bar":
          chartNode =
            chartData.length === 0
              ? chartUtils.createErrorBarChart(
                  [
                    // Default data jika tidak ada variabel yang dipilih
                    { category: "A", value: 30, error: 5 },
                    { category: "B", value: 80, error: 10 },
                    { category: "C", value: 45, error: 4 },
                    { category: "D", value: 60, error: 6 },
                    { category: "E", value: 20, error: 3 },
                    { category: "F", value: 90, error: 7 },
                  ],
                  width,
                  height,
                  useaxis
                )
              : chartUtils.createVerticalBarChart2(
                  chartData,
                  width,
                  height,
                  useaxis
                );
          break;

        default:
          console.error("Unknown chart type:", chartType);
          break;
      }

      // Jika chartNode valid, append ke svgRef
      if (chartNode && svgRef.current) {
        svgRef.current.appendChild(chartNode); // Menambahkan node hasil dari fungsi ke dalam svgRef
      }
    }
  }, [chartType, sideVariables, bottomVariables, data, useaxis, width, height]);

  // Menyesuaikan variabel saat chartType berubah
  useEffect(() => {
    const config = chartVariableConfig[chartType];

    if (sideVariables.length > config.side.max) {
      setSideVariables(sideVariables.slice(0, config.side.max));
    }

    if (bottomVariables.length > config.bottom.max) {
      setBottomVariables(bottomVariables.slice(0, config.bottom.max));
    }
  }, [chartType]);

  return (
    <div className="pl-6 flex justify-center items-center overflow-visible flex-col ">
      <div className="space-y-4 w-full flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold text-Black">CHART PREVIEW</h3>
        <div
          className="bg-gray-100 border-2 border-gray-300 flex items-center justify-center rounded-lg relative p-4"
          style={{
            width: "100%", // Membuat lebar kontainer responsif
            height: "500px", // Tentukan tinggi tetap atau bisa pakai vh (viewport height)
            maxWidth: "100%", // Pastikan ukuran kontainer tidak meluap
            maxHeight: "90%",
            overflow: "visible", // Pastikan grafik bisa tampil tanpa terpotong
          }}
        >
          {/* Label Variabel di Kiri (Vertikal, Rotasi 90 Derajat Terbalik) */}
          <div
            className="absolute top-1/2 left-[-80px] transform -translate-y-1/2 flex flex-col space-y-2"
            onDrop={(e) => handleDrop(e, "side")}
            onDragOver={handleDragOver}
            style={{
              transformOrigin: "top left", // Menambahkan properti transformOrigin untuk menghindari pergeseran
              whiteSpace: "nowrap", // Mencegah pemenggalan teks
              display: "flex", // Menjaga label tetap pada kolom vertikal
              flexDirection: "column",
            }}
          >
            {sideVariables.length === 0 ? (
              <div className="bg-gray-300 text-gray-500 p-2 rounded-md text-sm shadow-md rotate-90">
                No variables selected
              </div>
            ) : (
              sideVariables.map((variable, index) => (
                <div
                  key={index}
                  className="bg-blue-500 text-white p-2 rounded-md text-sm shadow-md rotate-90"
                >
                  {variable}
                </div>
              ))
            )}
            {/* Indikator Maksimum
            {sideVariables.length >=
              chartVariableConfig[chartType].side.max && (
              <div className="bg-red-300 text-red-700 p-2 rounded-md text-xs shadow-md rotate-90">
                Maksimum tercapai
              </div>
            )} */}
          </div>

          <svg
            ref={svgRef}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 650 500" // Ukuran referensi grafik
            style={{
              width: "100%", // Mengisi lebar kontainer
              height: "100%", // Mengisi tinggi kontainer
              maxWidth: "100%", // Mencegah ukuran lebih besar dari lebar kontainer
              maxHeight: "100%", // Mencegah ukuran lebih besar dari tinggi kontainer
            }}
          />

          {/* Label Variabel di Bawah (Horizontal) */}
          <div
            className="absolute bottom-0 left-0 w-full flex justify-center items-center space-x-4 py-2"
            onDrop={(e) => handleDrop(e, "bottom")}
            onDragOver={handleDragOver}
          >
            {bottomVariables.length === 0 ? (
              <div className="bg-gray-300 text-gray-500 p-2 rounded-md text-sm shadow-md">
                No variables selected
              </div>
            ) : (
              bottomVariables.map((variable, index) => (
                <div
                  key={index}
                  className="bg-blue-500 text-white p-2 rounded-md text-sm shadow-md"
                >
                  {variable}
                </div>
              ))
            )}
            {/* Indikator Maksimum
            {bottomVariables.length >=
              chartVariableConfig[chartType].bottom.max && (
              <div className="bg-red-300 text-red-700 p-2 rounded-md text-xs shadow-md">
                Maksimum tercapai
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPreview;
