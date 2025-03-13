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
  side2?: {
    min: number;
    max: number;
  };
  color?: {
    min: number;
    max: number;
  };
  filter?: {
    min: number;
    max: number;
  };
  high?: {
    min: number;
    max: number;
  };
  low?: {
    min: number;
    max: number;
  };
  close?: {
    min: number;
    max: number;
  };
}

export const chartVariableConfig: Record<ChartType, ChartVariableRequirements> =
  {
    "Vertical Bar Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Horizontal Bar Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Line Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Pie Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Area Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    Histogram: {
      side: { min: 1, max: 1 },
      bottom: { min: 0, max: 0 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Scatter Plot": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Scatter Plot With Fit Line": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    Boxplot: {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Horizontal Stacked Bar Chart": {
      side: { min: 1, max: Infinity },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Vertical Stacked Bar Chart": {
      side: { min: 1, max: Infinity },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Grouped Bar Chart": {
      side: { min: 1, max: Infinity },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Multiple Line Chart": {
      side: { min: 1, max: Infinity },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Error Bar Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Stacked Area Chart": {
      side: { min: 1, max: Infinity },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Grouped Scatter Plot": {
      side: { min: 1, max: Infinity },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 1 },
      filter: { min: 0, max: 0 },
    },
    "Dot Plot": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Population Pyramid": {
      side: { min: 1, max: 2 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Frequency Polygon": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Clustered Error Bar Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 1, max: 1 },
      filter: { min: 0, max: 0 },
    },
    "Scatter Plot Matrix": {
      side: { min: 0, max: 0 },
      bottom: { min: 1, max: Infinity },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Stacked Histogram": {
      side: { min: 0, max: 0 },
      bottom: { min: 1, max: 1 },
      color: { min: 1, max: 1 },
      filter: { min: 0, max: 0 },
    },
    "Clustered Boxplot": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 1, max: 1 },
      filter: { min: 0, max: 0 },
    },
    "1-D Boxplot": {
      side: { min: 1, max: 1 },
      bottom: { min: 0, max: 0 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
    },
    "Simple Range Bar": {
      side: { min: 0, max: 0 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
      high: { min: 1, max: 1 },
      low: { min: 1, max: 1 },
      close: { min: 1, max: 1 },
    },
    "Clustered Range Bar": {
      side: { min: 0, max: 0 },
      bottom: { min: 1, max: 1 },
      color: { min: 1, max: 1 },
      filter: { min: 0, max: 0 },
      high: { min: 1, max: 1 },
      low: { min: 1, max: 1 },
      close: { min: 1, max: 1 },
    },
    "High-Low-Close Chart": {
      side: { min: 0, max: 0 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
      high: { min: 1, max: 1 },
      low: { min: 1, max: 1 },
      close: { min: 1, max: 1 },
    },
    "Difference Area": {
      side: { min: 0, max: 0 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      filter: { min: 0, max: 0 },
      high: { min: 1, max: 1 },
      low: { min: 1, max: 1 },
      close: { min: 0, max: 0 },
    },
    // "Word Cloud": {
    //   side: { min: 0, max: 0 },
    //   bottom: { min: 0, max: 0 },
    //   color: { min: 0, max: 0 },
    //   filter: { min: 0, max: 0 },
    //   high: { min: 0, max: 0 },
    //   low: { min: 0, max: 0 },
    //   close: { min: 0, max: 0 },
    // },
    "Vertical Bar & Line Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      side2: { min: 1, max: 1 },
    },
    "Dual Axes Scatter Plot": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 0, max: 0 },
      side2: { min: 1, max: 1 },
    },
    "Drop Line Chart": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
      color: { min: 1, max: 1 },
    },
    "Summary Point Plot": {
      side: { min: 1, max: 1 },
      bottom: { min: 1, max: 1 },
    },
  };
