import * as barChartUtils from "./barChartUtils";
import * as lineChartUtils from "./lineChartUtils";
import * as pieChartUtils from "./pieChartUtils";
import * as areaChartUtils from "./areaChartUtils";
import * as histogramUtils from "./histogramUtils";
import * as scatterUtils from "./scatterUtils";
import * as boxplotUtils from "./boxplotUtils";
import * as highLowChartUtils from "./highLowChartUtils";
import * as dualAxesChartUtils from "./dualAxesChartUtils";

export const chartUtils = {
  ...barChartUtils,
  ...lineChartUtils,
  ...pieChartUtils,
  ...areaChartUtils,
  ...histogramUtils,
  ...scatterUtils,
  ...boxplotUtils,
  ...highLowChartUtils,
  ...dualAxesChartUtils,
};
