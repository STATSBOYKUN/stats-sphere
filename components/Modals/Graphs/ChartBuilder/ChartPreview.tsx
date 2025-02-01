import React, { useEffect, useRef } from "react";
import { useDataStore } from "@/stores/useDataStore"; // Mengambil data dari useDataStore
import { useVariableStore } from "@/stores/useVariableStore"; // Mengambil variabel dari useVariableStore
import { chartUtils } from "@/utils/chartBuilder/chartTypes/chartUtils";
import * as d3 from "d3"; // Mengimpor D3.js
import { ChartType } from "@/components/Modals/Graphs/ChartTypes";
import { chartVariableConfig } from "./ChartVariableConfig";

interface ChartPreviewProps {
  chartType: ChartType;
  width: number;
  height: number;
  useaxis: boolean;
  sideVariables: string[];
  bottomVariables: string[];
  onDropSide: (newSideVariables: string[]) => void; // Mengubah tipe parameter
  onDropBottom: (newBottomVariables: string[]) => void;
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
  subcategory?: string;
  value: number;
  error?: number;
  x?: number;
  y?: number;
}

const ChartPreview: React.FC<ChartPreviewProps> = ({
  chartType,
  width,
  height,
  useaxis,
  sideVariables,
  bottomVariables,
  onDropSide,
  onDropBottom,
}) => {
  const { data, loadData } = useDataStore(); // Mengambil data dari useDataStore
  const { variables, loadVariables } = useVariableStore(); // Mengambil variabel dari useVariableStore
  const svgRef = useRef<SVGSVGElement | null>(null); // Referensi untuk elemen SVG

  // Memuat data dan variabel ketika komponen pertama kali dimuat
  useEffect(() => {
    loadData(); // Memuat data dari useDataStore
    loadVariables(45); // Memuat variabel dari useVariableStore
  }, [loadData, loadVariables]);

  // Fungsi untuk menangani drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Mengizinkan drop
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropZone: "side" | "bottom"
  ) => {
    e.preventDefault();
    const variableName = e.dataTransfer.getData("text/plain");

    if (!variableName) {
      console.warn("No variable detected in drag event");
      return;
    }

    const config = chartVariableConfig[chartType]; // Ambil konfigurasi chartType saat ini

    if (dropZone === "side") {
      if (sideVariables.length >= config.side.max) {
        // Jika sudah mencapai maksimum, ganti variabel pertama
        const updatedSideVariables = [variableName];
        onDropSide(updatedSideVariables);
        console.log(`Replacing side variables with: ${updatedSideVariables}`);
      } else {
        // Tambahkan variabel jika belum penuh
        const updatedSideVariables = [...sideVariables, variableName];
        onDropSide(updatedSideVariables);
        console.log(`Added to side variables: ${updatedSideVariables}`);
      }
    } else if (dropZone === "bottom") {
      if (bottomVariables.length >= config.bottom.max) {
        // Jika sudah mencapai maksimum, ganti variabel pertama
        const updatedBottomVariables = [variableName];
        onDropBottom(updatedBottomVariables);
        console.log(
          `Replacing bottom variables with: ${updatedBottomVariables}`
        );
      } else {
        // Tambahkan variabel jika belum penuh
        const updatedBottomVariables = [...bottomVariables, variableName];
        onDropBottom(updatedBottomVariables);
        console.log(`Added to bottom variables: ${updatedBottomVariables}`);
      }
    }
  };

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
        value: 0, // Set nilai default jika sideVariables kosong
      }));
    }

    // Jika ada variabel side yang valid tetapi tidak ada variabel bottom
    if (sideIndices.some((index) => index !== -1) && bottomIndex === -1) {
      const results: ChartData[] = [];

      data.forEach((row) => {
        sideIndices.forEach((index, i) => {
          if (index !== -1) {
            results.push({
              category: "Unknown",
              subcategory: sideVariables[i] || "",
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
        subcategory: sideVariableName,
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
        case "Vertical Bar Chart":
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

        case "Horizontal Bar Chart":
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

        case "Vertical Stacked Bar Chart": {
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
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.subcategory || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createVerticalStackedBarChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Horizontal Stacked Bar Chart": {
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
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.subcategory || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createHorizontalStackedBarChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Grouped Bar Chart": {
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
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.subcategory || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createGroupedBarChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Line Chart":
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

        case "Multiple Line Chart": {
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
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.subcategory || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createMultilineChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Pie Chart":
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

        case "Area Chart":
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

        case "Scatter Plot": // Menambahkan case baru untuk Scatter plot
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

        case "Scatter Plot With Fit Line": // Menambahkan case baru untuk Scatter plot dengan Fit Line
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
          chartNode = chartUtils.createBoxplot(
            boxPlotData, // Data untuk Box Plot
            width,
            height,
            useaxis // Pilihan untuk menampilkan sumbu
          );
          break;

        case "Error Bar Chart": // Menambahkan case baru untuk BoxPlot
          // Ambil data box plot jika tidak ada data default
          const errorBardata =
            chartData.length === 0
              ? [
                  { category: "A", value: 30, error: 5 },
                  { category: "B", value: 80, error: 10 },
                  { category: "C", value: 45, error: 4 },
                  { category: "D", value: 60, error: 6 },
                  { category: "E", value: 20, error: 3 },
                  { category: "F", value: 90, error: 7 },
                ]
              : chartData.map((d) => ({
                  category: d.category, // Gunakan category untuk mengganti x
                  value: d.value, // Gunakan value untuk mengganti y
                  error: 2,
                }));

          // Memanggil fungsi untuk membuat BoxPlot
          chartNode = chartUtils.createErrorBarChart(
            errorBardata, // Data untuk Box Plot
            width,
            height,
            useaxis // Pilihan untuk menampilkan sumbu
          );
          break;

        case "Stacked Area Chart":
          const stackedAreaData =
            chartData.length === 0
              ? [
                  { category: "Sun", subcategory: "Product 1", value: 30 },
                  { category: "Sun", subcategory: "Product 2", value: 20 },
                  { category: "Sun", subcategory: "Product 3", value: 25 },
                  { category: "Mon", subcategory: "Product 1", value: 15 },
                  { category: "Mon", subcategory: "Product 2", value: 40 },
                  { category: "Mon", subcategory: "Product 3", value: 10 },
                  { category: "Tue", subcategory: "Product 1", value: 20 },
                  { category: "Tue", subcategory: "Product 2", value: 30 },
                  { category: "Tue", subcategory: "Product 3", value: 15 },
                  { category: "Wed", subcategory: "Product 1", value: 10 },
                  { category: "Wed", subcategory: "Product 2", value: 25 },
                  { category: "Wed", subcategory: "Product 3", value: 40 },
                ]
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.subcategory || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createStackedAreaChart(
            stackedAreaData,
            width,
            height,
            useaxis
          );
          break;

        case "Grouped Scatter Plot": // Menambahkan case baru untuk Scatter plot
          // Ambil data scatter jika tidak ada data default
          const groupedScatterData =
            chartData.length === 0
              ? [
                  { category: "A", x: 5.1, y: 3.5 },
                  { category: "B", x: 4.9, y: 3.0 },
                  { category: "A", x: 4.7, y: 3.2 },
                  { category: "C", x: 4.6, y: 3.1 },
                  { category: "B", x: 5.0, y: 3.6 },
                  { category: "C", x: 5.4, y: 3.9 },
                  { category: "A", x: 4.6, y: 3.4 },
                  { category: "B", x: 5.0, y: 3.4 },
                  { category: "C", x: 4.4, y: 2.9 },
                  { category: "A", x: 4.9, y: 3.1 },
                  { category: "B", x: 5.4, y: 3.7 },
                  { category: "C", x: 4.8, y: 3.4 },
                  { category: "A", x: 4.8, y: 3.0 },
                  { category: "B", x: 4.3, y: 3.0 },
                  { category: "C", x: 5.8, y: 4.0 },
                  { category: "A", x: 5.7, y: 4.4 },
                  { category: "B", x: 5.4, y: 3.9 },
                  { category: "C", x: 5.1, y: 3.5 },
                  { category: "A", x: 5.1, y: 3.8 },
                  { category: "B", x: 5.0, y: 3.3 },
                ]
              : chartData.map((d) => ({
                  x: Number(d.category), // Konversi category ke number
                  y: d.value, // Tetap gunakan value sebagai y
                }));

          chartNode = chartUtils.createGroupedScatterPlot(
            [
              { category: "A", x: 5.1, y: 3.5 },
              { category: "B", x: 4.9, y: 3.0 },
              { category: "A", x: 4.7, y: 3.2 },
              { category: "C", x: 4.6, y: 3.1 },
              { category: "B", x: 5.0, y: 3.6 },
              { category: "C", x: 5.4, y: 3.9 },
              { category: "A", x: 4.6, y: 3.4 },
              { category: "B", x: 5.0, y: 3.4 },
              { category: "C", x: 4.4, y: 2.9 },
              { category: "A", x: 4.9, y: 3.1 },
              { category: "B", x: 5.4, y: 3.7 },
              { category: "C", x: 4.8, y: 3.4 },
              { category: "A", x: 4.8, y: 3.0 },
              { category: "B", x: 4.3, y: 3.0 },
              { category: "C", x: 5.8, y: 4.0 },
              { category: "A", x: 5.7, y: 4.4 },
              { category: "B", x: 5.4, y: 3.9 },
              { category: "C", x: 5.1, y: 3.5 },
              { category: "A", x: 5.1, y: 3.8 },
              { category: "B", x: 5.0, y: 3.3 },
            ], // Data untuk Scatter plot
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
  }, [
    chartType,
    sideVariables,
    bottomVariables,
    data,
    useaxis,
    width,
    height,
    variables,
  ]);

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
