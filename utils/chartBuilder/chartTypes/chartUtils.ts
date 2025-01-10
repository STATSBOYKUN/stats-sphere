// src/utils/chartBuilder/chartTypes/chartUtils.ts

import * as barChartUtils from "./barChartUtils";
import * as lineChartUtils from "./lineChartUtils";
import * as pieChartUtils from "./pieChartUtils";
import * as areaChartUtils from "./areaChartUtils";
import * as histogramUtils from "./histogramUtils";
import * as scatterUtils from "./scatterUtils";
import * as boxplotUtils from "./boxplotUtils";

export const chartUtils = {
  ...barChartUtils,
  ...lineChartUtils,
  ...pieChartUtils,
  ...areaChartUtils,
  ...histogramUtils,
  ...scatterUtils,
  ...boxplotUtils,
};
