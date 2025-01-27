import { ChartType } from "@/components/Modals/Graphs/ChartTypes";

export interface ChartVariableRequirements {
  side: {
    min: number;
    max: number;
  };
  bottom: {
    min: number;
    max: number;
  };
}

export const chartVariableConfig: Record<ChartType, ChartVariableRequirements> =
  {
    "Vertical Bar Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
    },
    "Horizontal Bar Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
    },
    "Line Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
    },
    "Pie Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
    },
    "Area Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
    },
    Histogram: {
      side: { min: 1, max: 1 },
      bottom: { min: 0, max: 0 },
    },
    "Scatter Plot": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
    },
    "Scatter Plot With Fit Line": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
    },
    Boxplot: {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
    },
    "Horizontal Stacked Bar Chart": {
      side: { min: 1, max: Infinity },
      bottom: { min: 1, max: 1 },
    },
    "Vertical Stacked Bar Chart": {
      side: { min: 1, max: Infinity },
      bottom: { min: 1, max: 1 },
    },
    "Grouped Bar Chart": {
      side: { min: 1, max: Infinity },
      bottom: { min: 1, max: 1 },
    },
    "Multiple Line Chart": {
      side: { min: 1, max: Infinity },
      bottom: { min: 1, max: 1 },
    },
    "Error Bar Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
    },
    "Stacked Area Chart": {
      side: { min: 1, max: Infinity },
      bottom: { min: 1, max: 1 },
    },
    "Grouped Scatter Plot": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
    },
  };
