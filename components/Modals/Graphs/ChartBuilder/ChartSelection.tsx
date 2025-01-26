import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { chartUtils } from "@/utils/chartBuilder/chartTypes/chartUtils";

interface ChartSelectionProps {
  chartType: string;
  width: number;
  height: number;
  useaxis: boolean;
}

const ChartSelection: React.FC<ChartSelectionProps> = ({
  chartType,
  width,
  height,
  useaxis,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Menghapus grafik lama sebelum menggambar yang baru

      const data1 = [
        { category: "A", value: 30 },
        { category: "B", value: 80 },
        { category: "C", value: 45 },
        { category: "D", value: 60 },
        { category: "E", value: 20 },
        { category: "F", value: 90 },
      ];
      const data2 = [
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
      ];
      const data3 = [5, 8, 9, 7, 3, 6, 3, 7, 3, 2, 9, 1, 4, 2, 5];
      const data4 = [
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
      ];
      const data5 = [
        { category: "A", value: 20 },
        { category: "A", value: 40 },
        { category: "A", value: 60 },
        { category: "A", value: 80 },
        { category: "B", value: 30 },
        { category: "B", value: 50 },
        { category: "B", value: 70 },
        { category: "B", value: 90 },
      ];
      const data6 = [
        { category: "male", subcategory: "blue", value: 30 },
        { category: "male", subcategory: "white", value: 20 },
        { category: "male", subcategory: "green", value: 10 },
        { category: "female", subcategory: "blue", value: 25 },
        { category: "female", subcategory: "white", value: 15 },
        { category: "female", subcategory: "green", value: 10 },
      ];
      const data7 = [
        { category: "Product A", subcategory: "Division 1", value: 30 },
        { category: "Product A", subcategory: "Division 2", value: 20 },
        { category: "Product B", subcategory: "Division 1", value: 25 },
        { category: "Product B", subcategory: "Division 2", value: 15 },
        { category: "Product C", subcategory: "Division 1", value: 40 },
        { category: "Product C", subcategory: "Division 2", value: 10 },
      ];
      const data8 = [
        { category: "B", value: 80, error: 60 },
        { category: "D", value: 60, error: 60 },
        { category: "E", value: 20, error: 30 },
        { category: "F", value: 90, error: 70 },
      ];

      if (chartType === "Vertical Bar Chart") {
        // Panggil createVerticalBarChart2 tanpa svg (SVG akan dibuat di dalam fungsi)
        const chartNode = chartUtils.createVerticalBarChart2(
          data1,
          width,
          height,
          useaxis
        );

        // Pastikan chartNode bukan null dan svgRef.current bukan null
        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode); // Menambahkan node hasil dari fungsi ke dalam svgRef
        }
      } else if (chartType === "Horizontal Bar Chart") {
        // Panggil createHorizontalBarChart untuk horizontal bar chart
        const chartNode = chartUtils.createHorizontalBarChart(
          data1, // Pastikan data sesuai dengan format { category, value }
          width,
          height,
          useaxis, // Menyertakan parameter axis
          "steelblue", // Warna bar
          0.007 // Threshold untuk filter teks
        );

        // Pastikan chartNode bukan null dan svgRef.current bukan null
        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode); // Menambahkan node hasil dari fungsi ke dalam svgRef
        }
      } else if (chartType === "Line Chart") {
        // Panggil createLineChart untuk line chart
        const chartNode = chartUtils.createLineChart(
          data2, // Data dengan format { category, value }
          width,
          height,
          useaxis // Parameter axis
        );

        // Pastikan chartNode bukan null dan svgRef.current bukan null
        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode); // Menambahkan node hasil dari fungsi ke dalam svgRef
        }
      } else if (chartType === "Pie Chart") {
        const chartNode = chartUtils.createPieChart(
          data1, // Data dengan format { name, value }
          width,
          height
        );
        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode); // Menambahkan node hasil dari fungsi ke dalam svgRef
        }
      } else if (chartType === "Area Chart") {
        const chartNode = chartUtils.createAreaChart(
          data2,
          width,
          height,
          false
        );
        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode); // Menambahkan node hasil dari fungsi ke dalam svgRef
        }
      } else if (chartType === "Histogram") {
        // Tambahkan pemanggilan fungsi createHistogram untuk histogram chart
        const chartNode = chartUtils.createHistogram(
          data3,
          width,
          height,
          useaxis
        );

        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode); // Menambahkan node hasil dari fungsi ke dalam svgRef
        }
      } else if (chartType === "Scatter Plot") {
        // Tambahkan pemanggilan fungsi createScatterPlot untuk scatter chart
        const chartNode = chartUtils.createScatterPlot(
          data4,
          width,
          height,
          useaxis
        );
        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode);
        }
      } else if (chartType === "Boxplot") {
        // Tambahkan pemanggilan fungsi createBoxPlot untuk box plot chart
        const chartNode = chartUtils.createBoxplot(
          data5,
          width,
          height,
          useaxis
        );
        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode);
        }
      } else if (chartType === "Scatter Plot With Fit Line") {
        // Tambahkan pemanggilan fungsi createScatterPlotWithFitLine untuk scatter plot dengan fit line
        const chartNode = chartUtils.createScatterPlotWithFitLine(
          data4, // Pastikan data sesuai dengan format { category, value }
          width,
          height,
          useaxis,
          false
        );
        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode);
        }
      } else if (chartType === "Vertical Stacked Bar Chart") {
        // Tambahkan pemanggilan fungsi untuk Vertical Stacked Bar Chart
        const chartNode = chartUtils.createVerticalStackedBarChart(
          data6,
          width,
          height,
          useaxis
        );
        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode);
        }
      } else if (chartType === "Horizontal Stacked Bar Chart") {
        // Tambahkan pemanggilan fungsi untuk Horizontal Stacked Bar Chart
        const chartNode = chartUtils.createHorizontalStackedBarChart(
          data6,
          width,
          height,
          useaxis
        );
        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode);
        }
      } else if (chartType === "Grouped Bar Chart") {
        // Tambahkan pemanggilan fungsi untuk Horizontal Stacked Bar Chart
        const chartNode = chartUtils.createGroupedBarChart(
          data6,
          width,
          height,
          useaxis
        );
        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode);
        }
      } else if (chartType === "Multiple Line Chart") {
        const chartNode = chartUtils.createMultilineChart(
          data7,
          width,
          height,
          useaxis
        );

        if (svgRef.current && chartNode) {
          svgRef.current.appendChild(chartNode);
        }
      } else if (chartType === "Error Bar Chart") {
        // Panggil fungsi error handling bar chart
        const chartNode = chartUtils.createErrorBarChart(
          data8,
          width,
          height,
          useaxis
        );
        if (chartNode) {
          svgRef.current.appendChild(chartNode);
        }
      }
    }
  }, [chartType, width, height, useaxis]);

  return (
    <svg
      ref={svgRef}
      className="max-w-full max-h-full"
      style={{ display: "block", margin: "auto" }}
    />
  );
};

export default ChartSelection;
