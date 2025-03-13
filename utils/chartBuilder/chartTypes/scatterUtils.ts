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
    ? { top: 30, right: 30, bottom: 120, left: 50 }
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
    // Menambahkan legenda secara horizontal di bawah chart
    const legendGroup = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .attr(
        "transform",
        `translate(${margin.left}, ${height - margin.bottom + 60})`
      );
    const legendItemWidth = 19;
    const legendItemHeight = 19;
    const labelOffset = 5;
    const legendSpacingX = 130;
    const legendSpacingY = 25;
    const legendMaxWidth = width - margin.left - margin.right;
    const itemsPerRow = Math.floor(legendMaxWidth / legendSpacingX);

    categories.forEach((subcategory, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const xOffset = col * legendSpacingX;
      const yOffset = row * legendSpacingY;

      // Menambahkan swatch
      legendGroup
        .append("rect")
        .attr("x", xOffset)
        .attr("y", yOffset)
        .attr("width", legendItemWidth)
        .attr("height", legendItemHeight)
        .attr("fill", colorScale(subcategory));

      // Menambahkan label teks
      legendGroup
        .append("text")
        .attr("x", xOffset + legendItemWidth + labelOffset)
        .attr("y", yOffset + legendItemHeight / 2)
        .attr("dy", "0.35em")
        .text(subcategory);
    });
  }

  if (useAxis) {
    svg
      .append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - margin.bottom / 2 - 10)
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

export const createDotPlot = (
  data: { category: string; value: number }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating improved stacked dot plot with data:", data);

  const marginTop = useAxis ? 30 : 10;
  const marginRight = useAxis ? 30 : 10;
  const marginBottom = useAxis ? 30 : 10;
  const marginLeft = useAxis ? 30 : 10;
  const dotRadius = 7;
  const dotSpacing = dotRadius * 1.8;

  // Skala X: Kategori
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.category))
    .range([marginLeft, width - marginRight])
    .padding(0.5);

  // Skala Y: Nilai dari data
  const maxValue = d3.max(data, (d) => d.value) || 0;
  const y = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([height - marginBottom, marginTop]);

  // Dynamic Y-axis
  const tickCount = maxValue > 100 ? 10 : maxValue > 50 ? 7 : 5;

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
  // .attr("style", "max-width: 100%; max-height:50%;");

  // Draw the dots
  svg
    .append("g")
    .attr("fill", "steelblue")
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (d) => {
      const xPos = x(d.category) ?? 0;
      return `translate(${xPos + x.bandwidth() / 2}, 0)`;
    })
    .selectAll("circle")
    .data((d) => d3.range(d.value))
    .join("circle")
    .attr("cx", 0)
    .attr("cy", (d, i) => y(i + 1))
    .attr("r", dotRadius);

  // Menambahkan axis
  if (useAxis) {
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    svg
      .append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y).ticks(tickCount))
      .call((g) => g.select(".domain").remove());

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - marginBottom + 40)
      .style("font-size", "14px")
      .text("Categories");

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-10)`)
      .attr("x", -height / 2)
      .attr("y", marginLeft - 40)
      .style("font-size", "14px")
      .text("Count");
  }

  return svg.node();
};

export const createScatterPlotMatrix = (
  data: { [key: string]: any }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  const padding = useAxis ? 20 : 5;
  const columns: string[] = Object.keys(data[0]).filter(
    (d) => typeof data[0][d] === "number"
  );

  const marginTop = useAxis ? 30 : 10;
  const marginRight = useAxis ? 30 : 10;
  const marginBottom = useAxis ? 30 : 10;
  const marginLeft = useAxis ? 30 : 10;
  const matrixSize = Math.min(width, height);
  const size =
    (matrixSize - (columns.length + 1) * padding) / columns.length + padding;
  console.log("Computed size:", size);
  console.log("data", data);

  const x: d3.ScaleLinear<number, number>[] = columns.map((c) =>
    d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[c]) as [number, number])
      .rangeRound([padding / 2, size - padding / 2])
  );

  const y: d3.ScaleLinear<number, number>[] = x.map((xScale) =>
    xScale.copy().range([size - padding / 2, padding / 2])
  );

  const color = d3
    .scaleOrdinal<string, string>()
    .domain(data.map((d) => d.species))
    .range(d3.schemeCategory10);

  const axisx = d3
    .axisBottom(d3.scaleLinear())
    .ticks(4)
    .tickSize(size * columns.length);

  const axisy = d3
    .axisLeft(d3.scaleLinear())
    .ticks(4)
    .tickSize(-size * columns.length);

  const xAxis = (g: d3.Selection<SVGGElement, any, null, undefined>) => {
    g.selectAll<SVGGElement, d3.ScaleLinear<number, number>>("g")
      .data(x)
      .join("g")
      .attr("transform", (d, i) => `translate(${i * size}, 0)`)
      .each(function (d) {
        d3.select(this as SVGGElement).call(axisx.scale(d));
      })
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").attr("stroke", "#ddd"));
  };

  const yAxis = (g: d3.Selection<SVGGElement, any, null, undefined>) => {
    g.selectAll<SVGGElement, d3.ScaleLinear<number, number>>("g")
      .data(y)
      .join("g")
      .attr("transform", (d, i) => `translate(0,${i * size})`)
      .each(function (d) {
        d3.select(this as SVGGElement).call(axisy.scale(d));
      })
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").attr("stroke", "#ddd"));
  };
  const svg = d3
    .create("svg")
    .attr("width", width + marginLeft + marginRight)
    .attr("height", height + marginTop + marginBottom)
    .attr("viewBox", [
      0,
      0,
      width + marginLeft + marginRight,
      height + marginTop + marginBottom,
    ]);

  svg
    .append("style")
    .text(`circle.hidden { fill: #000; fill-opacity: 1; r: 1px; }`);
  if (useAxis) {
    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
  }

  if (useAxis) {
    svg
      .append("g")
      .style("font", "bold 10px sans-serif")
      .style("pointer-events", "none")
      .selectAll("text")
      .data(columns)
      .join("text")
      .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text((d) => d);
  }

  const cell = svg
    .append("g")
    .selectAll("g")
    .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
    .join("g")
    .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);

  cell
    .append("rect")
    .attr("fill", "none")
    .attr("stroke", "#aaa")
    .attr("x", padding / 2 + 0.5)
    .attr("y", padding / 2 + 0.5)
    .attr("width", size - padding)
    .attr("height", size - padding);

  cell.each(function ([i, j]: [number, number]) {
    d3.select(this)
      .selectAll<SVGCircleElement, { [key: string]: number }>("circle")
      .data(data.filter((d) => !isNaN(d[columns[i]]) && !isNaN(d[columns[j]])))
      .join("circle")
      .attr("cx", (d) => x[i](d[columns[i]]))
      .attr("cy", (d) => y[j](d[columns[j]]))
      .attr("r", 3.5)
      .attr("fill-opacity", 0.7)
      .attr("fill", (d) => color(d.species));
  });

  if (useAxis) {
    svg
      .append("g")
      .style("font", "bold 10px sans-serif")
      .style("pointer-events", "none")
      .selectAll("text")
      .data(columns)
      .join("text")
      .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text((d) => d);
  }

  return Object.assign(svg.node()!, { scales: { color } });
};

export const createDropLineChart = (
  data: { x: string; y: number; category: string }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  const validData = data.filter(
    (d) =>
      d.x !== null &&
      d.y !== null &&
      d.category !== null &&
      d.x !== undefined &&
      d.y !== undefined &&
      d.category !== undefined &&
      !isNaN(d.y)
  );

  console.log("Creating drop-line chart with valid data:", validData);

  if (validData.length === 0) {
    console.error("No valid data available for the drop-line chart");
    return null;
  }

  const marginTop = useAxis ? 30 : 10;
  const marginRight = useAxis ? 30 : 10;
  const marginBottom = useAxis ? 40 : 10;
  const marginLeft = useAxis ? 40 : 10;

  const x = d3
    .scaleBand()
    .domain(validData.map((d) => d.x))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(validData, (d) => d.y) as number])
    .nice()
    .range([height - marginBottom, marginTop]);

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  if (useAxis) {
    svg
      .append("g")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 0.5)
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(x.domain())
          .join("line")
          .attr("x1", (d) => x(d)!)
          .attr("x2", (d) => x(d)!)
          .attr("y1", marginTop)
          .attr("y2", height - marginBottom)
      );
  }

  if (useAxis) {
    svg
      .append("g")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 0.8)
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(y.ticks())
          .join("line")
          .attr("y1", (d) => y(d))
          .attr("y2", (d) => y(d))
          .attr("x1", marginLeft)
          .attr("x2", width - marginRight)
      );
  }

  const groupedData = d3.groups(validData, (d) => d.x);

  svg
    .append("g")
    .selectAll("line")
    .data(groupedData)
    .join("line")
    .attr("x1", (d) => x(d[0])! + x.bandwidth() / 2)
    .attr("x2", (d) => x(d[0])! + x.bandwidth() / 2)
    .attr("y1", (d) => y(d[1][0]?.y || 0))
    .attr("y2", (d) => y(d[1][d[1].length - 1]?.y || 0))
    .attr("stroke", "black")
    .attr("stroke-width", 1.5);

  groupedData.forEach((categoryData) => {
    svg
      .append("g")
      .selectAll("line")
      .data(categoryData[1].slice(1))
      .join("line")
      .attr("x1", (d, i) => x(d.x)! + x.bandwidth() / 2)
      .attr("x2", (d, i) => x(categoryData[1][i].x)! + x.bandwidth() / 2)
      .attr("y1", (d) => y(d.y))
      .attr("y2", (d, i) => y(categoryData[1][i].y))
      .attr("stroke", "black")
      .attr("stroke-width", 1.5);
  });

  svg
    .append("g")
    .selectAll("circle")
    .data(validData)
    .join("circle")
    .attr("cx", (d) => x(d.x)! + x.bandwidth() / 2)
    .attr("cy", (d) => y(d.y))
    .attr("r", 6)
    .attr("fill", (d) => color(d.category));

  if (useAxis) {
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", width)
          .attr("y", marginBottom - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("→ Kategori")
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
          .text("↑ Nilai")
      );
  }

  return svg.node();
};

export const createSummaryPointPlot = (
  data: { category: string; value: number }[],
  width: number,
  height: number,
  useAxis: boolean = true,
  statistic: "mean" | "median" | "mode" | "min" | "max" = "mean" // Pilihan statistik
) => {
  // Mengelompokkan data berdasarkan category dan menghitung statistik per kategori
  const categoryValues = Array.from(
    d3.group(data, (d) => d.category),
    ([key, value]) => ({
      category: key,
      value: calculateStat(value, statistic),
    })
  );

  console.log(
    `Creating summary point plot with ${statistic} values:`,
    categoryValues
  );

  if (categoryValues.length === 0) {
    console.error("No valid data available for the summary point plot");
    return null;
  }

  const marginTop = useAxis ? 30 : 10;
  const marginRight = useAxis ? 30 : 10;
  const marginBottom = useAxis ? 70 : 10;
  const marginLeft = useAxis ? 40 : 10;

  // Skala untuk sumbu X (category)
  const x = d3
    .scaleBand()
    .domain(categoryValues.map((d) => d.category))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  // Skala untuk sumbu Y (statistik nilai)
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(categoryValues, (d) => d.value) as number])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Membuat SVG
  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Warna titik (default warna abu-abu untuk semua titik)
  const color = "#4682B4";

  if (useAxis) {
    // Menambahkan gridline untuk sumbu X
    svg
      .append("g")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 0.5)
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(x.domain())
          .join("line")
          .attr("x1", (d) => x(d)!)
          .attr("x2", (d) => x(d)!)
          .attr("y1", marginTop)
          .attr("y2", height - marginBottom)
      );
  }

  if (useAxis) {
    // Menambahkan gridline untuk sumbu Y
    svg
      .append("g")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 0.8)
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(y.ticks())
          .join("line")
          .attr("y1", (d) => y(d))
          .attr("y2", (d) => y(d))
          .attr("x1", marginLeft)
          .attr("x2", width - marginRight)
      );
  }

  // Menambahkan titik data untuk setiap kategori berdasarkan statistik yang dihitung
  svg
    .append("g")
    .selectAll("circle")
    .data(categoryValues)
    .join("circle")
    .attr("cx", (d) => x(d.category)! + x.bandwidth() / 2)
    .attr("cy", (d) => y(d.value))
    .attr("r", 6)
    .attr("fill", color);

  // Menambahkan teks informasi statistik di bawah grafik
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - marginBottom + 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text(
      `Statistik: ${statistic.charAt(0).toUpperCase() + statistic.slice(1)}`
    );

  if (useAxis) {
    // Menambahkan sumbu X
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", width)
          .attr("y", marginBottom - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("→ Kategori")
      );

    // Menambahkan sumbu Y
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
          .text("↑ Nilai")
      );
  }

  return svg.node();
};

// Fungsi untuk menghitung statistik berdasarkan pilihan
function calculateStat(
  data: { value: number }[],
  statistic: "mean" | "median" | "mode" | "min" | "max"
): number {
  switch (statistic) {
    case "mean":
      return d3.mean(data, (d) => d.value) as number;
    case "median":
      return d3.median(data, (d) => d.value) as number;
    case "mode":
      return mode(data);
    case "min":
      return d3.min(data, (d) => d.value) as number;
    case "max":
      return d3.max(data, (d) => d.value) as number;
    default:
      return 0;
  }
}

// Fungsi untuk menghitung mode
function mode(data: { value: number }[]): number {
  const frequency: { [key: number]: number } = {};
  let maxFreq = 0;
  let modeValue = 0;
  data.forEach((d) => {
    frequency[d.value] = (frequency[d.value] || 0) + 1;
    if (frequency[d.value] > maxFreq) {
      maxFreq = frequency[d.value];
      modeValue = d.value;
    }
  });
  return modeValue;
}
