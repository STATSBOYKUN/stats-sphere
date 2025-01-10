// components/Modals/Graphs/ChartTypes.ts

export const chartTypes = [
  "bar2",
  "Bar3",
  "Line",
  "Pie",
  "Area",
  "Histogram",
  "Scatter",
  "Scatter Fit Line",
  "Boxplot",
  "Vertical Stacked Bar",
  "Horizontal Stacked Bar",
  "Grouped Bar",
  "Multi Line",
  "Error Bar",
] as const;

export type ChartType = (typeof chartTypes)[number];
