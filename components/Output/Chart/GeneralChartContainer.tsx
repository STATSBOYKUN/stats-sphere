import React, { useEffect, useRef, useState } from "react";
import { chartUtils } from "@/utils/chartBuilder/chartTypes/chartUtils";

// Define type untuk data chart
interface ChartData {
  chartType: string;
  chartData: any[]; // Bisa lebih spesifik, misalnya tipe data untuk chart tertentu
  config: {
    width: number;
    height: number;
    useAxis?: boolean;
  };
  chartMetadata: {
    axisInfo: {
      category: string;
      value: string;
    };
    description: string;
  };
}

interface GeneralChartContainerProps {
  data: string | { charts: ChartData[] }; // Bisa menerima string JSON atau object
}

const GeneralChartContainer: React.FC<GeneralChartContainerProps> = ({
  data,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [chartDimensions, setChartDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 800, // Default width
    height: 600, // Default height
  });

  // Parse data jika berbentuk string
  const parsedData = typeof data === "string" ? JSON.parse(data) : data;

  useEffect(() => {
    if (chartRef.current) {
      console.log("data di container chart", parsedData);

      // Hapus SVG sebelumnya untuk menghindari duplikasi
      const existingSvgs = chartRef.current.querySelectorAll("svg");
      existingSvgs.forEach((svg) => svg.remove());

      // Periksa jika ada chart data
      if (parsedData && parsedData.charts && Array.isArray(parsedData.charts)) {
        // Iterasi untuk setiap chart dalam parsedData.charts
        parsedData.charts.forEach((chartData: ChartData, index: number) => {
          const {
            chartType,
            chartData: chartDataPoints,
            config,
            chartMetadata,
          } = chartData;
          const width = config?.width || chartDimensions.width;
          const height = config?.height || chartDimensions.height;
          const useAxis = config?.useAxis ?? true;

          console.log("chartData", chartDataPoints);

          // Buat grafik berdasarkan jenisnya
          let chartNode: SVGElement | null = null;

          switch (chartType) {
            case "Vertical Bar Chart":
              chartNode = chartUtils.createVerticalBarChart2(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Horizontal Bar Chart":
              chartNode = chartUtils.createHorizontalBarChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Pie Chart":
              chartNode = chartUtils.createPieChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Scatter Plot":
              chartNode = chartUtils.createScatterPlot(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Scatter Plot With Fit Line":
              chartNode = chartUtils.createScatterPlotWithFitLine(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Line Chart":
              chartNode = chartUtils.createLineChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Area Chart":
              chartNode = chartUtils.createAreaChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Vertical Stacked Bar Chart":
              chartNode = chartUtils.createVerticalStackedBarChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Horizontal Stacked Bar Chart":
              chartNode = chartUtils.createHorizontalStackedBarChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Grouped Bar Chart":
              chartNode = chartUtils.createGroupedBarChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Multiple Line Chart":
              chartNode = chartUtils.createMultilineChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Boxplot":
              chartNode = chartUtils.createBoxplot(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Histogram":
              chartNode = chartUtils.createHistogram(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Error Bar Chart":
              chartNode = chartUtils.createErrorBarChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Stacked Area Chart":
              chartNode = chartUtils.createStackedAreaChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Grouped Scatter Plot":
              chartNode = chartUtils.createGroupedScatterPlot(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Dot Plot":
              chartNode = chartUtils.createDotPlot(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Frequency Polygon":
              chartNode = chartUtils.createFrequencyPolygon(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Population Pyramid":
              chartNode = chartUtils.createPopulationPyramid(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Clustered Error Bar Chart":
              chartNode = chartUtils.createClusteredErrorBarChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Stacked Histogram":
              chartNode = chartUtils.createStackedHistogram(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Scatter Plot Matrix":
              chartNode = chartUtils.createScatterPlotMatrix(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Clustered Boxplot":
              chartNode = chartUtils.createClusteredBoxplot(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "1-D Boxplot":
              chartNode = chartUtils.create1DBoxplot(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Simple Range Bar":
              chartNode = chartUtils.createSimpleRangeBar(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Clustered Range Bar":
              chartNode = chartUtils.createClusteredRangeBar(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "High-Low-Close Chart":
              chartNode = chartUtils.createHighLowCloseChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Difference Area":
              chartNode = chartUtils.createDifferenceArea(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Drop Line Chart":
              chartNode = chartUtils.createDropLineChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Summary Point Plot":
              chartNode = chartUtils.createSummaryPointPlot(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Vertical Bar & Line Chart":
              chartNode = chartUtils.createBarAndLineChart(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;
            case "Dual Axes Scatter Plot":
              chartNode = chartUtils.createDualAxesScatterPlot(
                chartDataPoints,
                width,
                height,
                useAxis
              );
              break;

            default:
              console.warn(`Unsupported chart type: ${chartType}`);
          }

          // Jika chartNode ada, tambahkan ke chartRef
          if (chartNode && chartRef.current) {
            chartRef.current.appendChild(chartNode);
          }
        });
      }
    }
  }, [parsedData, chartDimensions]); // Include chartDimensions in the dependency array

  // Menentukan ukuran kontainer berdasarkan dimensi chart
  const containerStyle = {
    width: `${chartDimensions.width}px`,
    height: `${chartDimensions.height}px`,
    position: "relative" as const,
  };

  return (
    <div
      ref={chartRef}
      style={containerStyle}
      className="chart-container"
    ></div>
  );
};

export default React.memo(
  GeneralChartContainer,
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
);
