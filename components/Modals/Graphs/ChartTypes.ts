// components/Modals/Graphs/ChartTypes.ts

export const chartTypes = [
  "Vertical Bar Chart",
  "Horizontal Bar Chart",
  "Line Chart",
  "Pie Chart",
  "Area Chart",
  "Histogram",
  "Scatter Plot",
  "Scatter Plot With Fit Line",
  "Boxplot",
  "Vertical Stacked Bar Chart",
  "Horizontal Stacked Bar Chart",
  "Grouped Bar Chart",
  "Multiple Line Chart",
  "Error Bar Chart",
] as const;

export type ChartType = (typeof chartTypes)[number];
