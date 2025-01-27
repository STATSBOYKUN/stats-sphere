import * as d3 from "d3";
import * as ss from "simple-statistics";

interface GroupedScatterPlotData {
  category: string;
  x: number;
  y: number;
}

export const createScatterPlot = (
  data: { x: number; y: number }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  const validData = data.filter(
    (d) =>
      d.x !== null &&
      d.y !== null &&
      d.x !== undefined &&
      d.y !== undefined &&
      !isNaN(d.x) &&
      !isNaN(d.y)
  );

  console.log("Creating scatter plot with valid data:", validData);

  if (validData.length === 0) {
    console.error("No valid data available for the scatter plot");
    return null;
  }

  const marginTop = useAxis ? 30 : 10;
  const marginRight = useAxis ? 30 : 10;
  const marginBottom = useAxis ? 40 : 10;
  const marginLeft = useAxis ? 40 : 10;

  const x = d3
    .scaleLinear()
    .domain(d3.extent(validData, (d) => d.x) as [number, number])
    .nice()
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(validData, (d) => d.y) as [number, number])
    .nice()
    .range([height - marginBottom, marginTop]);

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  svg
    .append("g")
    .call((g) =>
      g
        .append("g")
        .selectAll("line")
        .data(x.ticks())
        .join("line")
        .attr("x1", (d) => 0.5 + x(d))
        .attr("x2", (d) => 0.5 + x(d))
        .attr("y1", marginTop)
        .attr("y2", height - marginBottom)
    )
    .call((g) =>
      g
        .append("g")
        .selectAll("line")
        .data(y.ticks())
        .join("line")
        .attr("y1", (d) => 0.5 + y(d))
        .attr("y2", (d) => 0.5 + y(d))
        .attr("x1", marginLeft)
        .attr("x2", width - marginRight)
    );

  svg
    .append("g")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("fill", "none")
    .selectAll("circle")
    .data(validData)
    .join("circle")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("r", 3);

  if (useAxis) {
    svg
      .append("g")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(x.ticks())
          .join("line")
          .attr("x1", (d) => 0.5 + x(d))
          .attr("x2", (d) => 0.5 + x(d))
          .attr("y1", marginTop)
          .attr("y2", height - marginBottom)
      );

    svg
      .append("g")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(y.ticks())
          .join("line")
          .attr("y1", (d) => 0.5 + y(d))
          .attr("y2", (d) => 0.5 + y(d))
          .attr("x1", marginLeft)
          .attr("x2", width - marginRight)
      );

    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(width / 80))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", width)
          .attr("y", marginBottom - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("→ X Axis Label")
      );

    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Y Axis Label")
      );
  }

  return svg.node();
};

export const createScatterPlotWithFitLine = (
  data: { x: number; y: number }[],
  width: number,
  height: number,
  useAxis: boolean = true,
  showEquation: boolean = true
) => {
  // Menyaring data yang valid
  const validData = data.filter(
    (d) =>
      d.x !== null &&
      d.y !== null &&
      d.x !== undefined &&
      d.y !== undefined &&
      !isNaN(d.x) &&
      !isNaN(d.y)
  );

  console.log("Creating scatter plot with valid data:", validData);

  // Pesan eror jika tidak ada data valid
  if (validData.length === 0) {
    console.error("No valid data available for the scatter plot");
    return null;
  }

  // Margin
  const marginTop = useAxis ? 30 : 10;
  const marginRight = useAxis ? 30 : 10;
  const marginBottom = useAxis ? 40 : 10;
  const marginLeft = useAxis ? 40 : 10;

  // Menentukan skala untuk sumbu X dan Y
  const x = d3
    .scaleLinear()
    .domain(d3.extent(validData, (d) => d.x) as [number, number])
    .nice()
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(validData, (d) => d.y) as [number, number])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Membuat elemen SVG baru di dalam DOM
  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Membuat grid berdasarkan skala X dan Y
  if (useAxis) {
    // Grid Lines X
    svg
      .append("g")
      .selectAll("line")
      .data(x.ticks())
      .join("line")
      .attr("x1", (d) => 0.5 + x(d))
      .attr("x2", (d) => 0.5 + x(d))
      .attr("y1", marginTop)
      .attr("y2", height - marginBottom)
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1);

    // Grid Lines Y
    svg
      .append("g")
      .selectAll("line")
      .data(y.ticks())
      .join("line")
      .attr("y1", (d) => 0.5 + y(d))
      .attr("y2", (d) => 0.5 + y(d))
      .attr("x1", marginLeft)
      .attr("x2", width - marginRight)
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1);
  }

  // Menambahkan titik-titik (scatter points)
  svg
    .append("g")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("fill", "none")
    .selectAll("circle")
    .data(validData)
    .join("circle")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("r", 3);

  // Menambahkan sumbu X dan Y jika diperlukan
  if (useAxis) {
    // Sumbu X
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(width / 80))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", width)
          .attr("y", marginBottom - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("→ X Axis Label")
      );

    // Sumbu Y
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Y Axis Label")
      );
  }

  // Menghitung regresi linier menggunakan simple-statistics
  const regression = ss.linearRegression(validData.map((d) => [d.x, d.y]));
  const slope = regression.m;
  const intercept = regression.b;

  // Cetak objek regression langsung
  console.log("Regression Object:", regression);
  console.log(`Regresi Linier: y = ${slope}x + ${intercept}`);

  // Menentukan dua titik untuk garis regresi
  const xMin = d3.min(validData, (d) => d.x) as number;
  const xMax = d3.max(validData, (d) => d.x) as number;
  const regressionData = [
    { x: xMin, y: slope * xMin + intercept },
    { x: xMax, y: slope * xMax + intercept },
  ];

  // Membuat generator garis regresi
  const regressionLine = d3
    .line<{ x: number; y: number }>()
    .x((d) => x(d.x))
    .y((d) => y(d.y));

  // Menambahkan garis regresi ke SVG
  svg
    .append("path")
    .datum(regressionData)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("d", regressionLine);

  if (showEquation) {
    // Menambahkan label persamaan regresi (opsional)
    svg
      .append("text")
      .attr("x", width - marginRight)
      .attr("y", marginTop)
      .attr("fill", "black")
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .text(`y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`);
  }

  // Mengembalikan node SVG
  return svg.node();
};

/**
 * Membuat Grouped Scatter Plot

 * @param data - Array dari objek GroupedScatterPlotData
 * @param width - Lebar SVG (default: 928)
 * @param height - Tinggi SVG (default: 600)
 * @param useAxis - Boolean untuk menentukan apakah sumbu dan grid lines akan ditampilkan (default: true)
 * @returns SVGSVGElement atau null jika data tidak valid
 */
export const createGroupedScatterPlot = (
  data: GroupedScatterPlotData[],
  width: number = 600,
  height: number = 400,
  useAxis: boolean = true
): SVGSVGElement | null => {
  const validData = data.filter(
    (d) =>
      d.category !== null &&
      d.x !== null &&
      d.y !== null &&
      d.category !== undefined &&
      d.x !== undefined &&
      d.y !== undefined &&
      !isNaN(d.x) &&
      !isNaN(d.y)
  );

  if (validData.length === 0) {
    console.error("No valid data available for the grouped scatter plot");
    return null;
  }

  const margin = useAxis
    ? { top: 30, right: 30, bottom: 50, left: 50 }
    : { top: 10, right: 10, bottom: 10, left: 10 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const categories = Array.from(new Set(validData.map((d) => d.category)));

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(validData, (d) => d.x) as [number, number])
    .nice()
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(validData, (d) => d.y) as [number, number])
    .nice()
    .range([innerHeight, 0]);

  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(categories)
    .range(d3.schemeCategory10);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  if (useAxis) {
    chart
      .append("g")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)
      .selectAll("line.horizontal")
      .data(yScale.ticks())
      .join("line")
      .attr("class", "horizontal")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d));

    chart
      .append("g")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)
      .selectAll("line.vertical")
      .data(xScale.ticks())
      .join("line")
      .attr("class", "vertical")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("x1", (d) => xScale(d))
      .attr("x2", (d) => xScale(d));
  }

  if (useAxis) {
    chart
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(width / 80))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", innerWidth)
          .attr("y", margin.bottom - 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("X Axis →")
      );

    chart
      .append("g")
      .call(d3.axisLeft(yScale))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", -margin.left + 15)
          .attr("y", -10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Y Axis")
      );
  }

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("padding", "8px")
    .style("border", "1px solid #d3d3d3")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("box-shadow", "0px 0px 6px #aaa");

  chart
    .append("g")
    .attr("stroke-width", 1.5)
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .selectAll("circle")
    .data(validData)
    .join("circle")
    .attr("cx", (d) => xScale(d.x))
    .attr("cy", (d) => yScale(d.y))
    .attr("r", 5)
    .attr("fill", (d) => colorScale(d.category) as string)
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `
          <strong>Category:</strong> ${d.category}<br/>
          <strong>X Value:</strong> ${d.x}<br/>
          <strong>Y Value:</strong> ${d.y}
        `
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  if (useAxis) {
    const legend = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const legendItemSize = 15;
    const legendSpacing = 4;

    categories.forEach((category, i) => {
      const legendRow = legend
        .append("g")
        .attr(
          "transform",
          `translate(0, ${i * (legendItemSize + legendSpacing)})`
        );

      legendRow
        .append("rect")
        .attr("width", legendItemSize)
        .attr("height", legendItemSize)
        .attr("fill", colorScale(category) as string)
        .attr("stroke", "none");

      legendRow
        .append("text")
        .attr("x", legendItemSize + legendSpacing)
        .attr("y", legendItemSize / 2)
        .attr("dy", "0.35em")
        .text(category);
    });
  }

  if (useAxis) {
    svg
      .append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - margin.bottom / 3)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("X Axis Label");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + innerHeight / 2))
      .attr("y", margin.left / 2 - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Y Axis Label");
  }

  return svg.node();
};
