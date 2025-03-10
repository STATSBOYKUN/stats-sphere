import * as d3 from "d3";

export const createBarAndLineChart = (
  data: { category: string; barValue: number; lineValue: number }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating combined chart with data:", data);

  // Margin
  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 30 : 0;

  // Definisi X axis
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.category))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  // Definisi Y axis
  const y = d3
    .scaleLinear()
    .domain([0, Math.max(d3.max(data, (d) => d.barValue) as number)])
    .range([height - marginBottom, marginTop]);

  // Definisi Y axis
  const y2 = d3
    .scaleLinear()
    .domain([0, Math.max(d3.max(data, (d) => d.lineValue) as number)])
    .range([height - marginBottom, marginTop]);

  // Membuat SVG element
  const svg = d3
    .create("svg")
    .attr("width", width + marginLeft + marginRight)
    .attr("height", height + marginTop + marginBottom)
    .attr("viewBox", [
      0,
      0,
      width + marginLeft + marginRight,
      height + marginTop + marginBottom,
    ])
    .attr("style", "max-width: 100%; height: auto;");

  // Bar chart
  svg
    .append("g")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d: { category: string }) => x(d.category) || 0)
    .attr("y", (d: { barValue: number }) => y(d.barValue))
    .attr(
      "height",
      (d: { barValue: number }) => (y(0) as number) - (y(d.barValue) as number)
    )
    .attr("width", x.bandwidth());

  // Line chart
  const line = d3
    .line<{ category: string; lineValue: number }>()
    .x((d) => x(d.category)! + x.bandwidth() / 2)
    .y((d) => y2(d.lineValue)!);

  svg
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("d", line(data));

  // Menambahkan axis
  if (useAxis) {
    // X-Axis (Horizontal)
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // Y-Axis
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y).tickFormat((y) => (+y * 1).toFixed(0)))
      .call((g: any) => g.select(".domain").remove())
      .call((g: any) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Bar Value")
      );

    // Y2-Axis
    const y2Axis = svg
      .append("g")
      .attr("transform", `translate(${width - marginRight}, 0)`)
      .call(d3.axisRight(y2).tickFormat((y) => (+y * 1).toFixed(0)))
      .call((g: any) => g.select(".domain").remove())
      .call((g: any) =>
        g
          .append("text")
          .attr("x", marginRight)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Line Value")
      );

    // Custom Y2 axis
    y2Axis.selectAll(".tick text").attr("fill", "red");
    y2Axis.select(".domain").attr("stroke", "red");
  }

  return svg.node();
};

export const createDualAxesScatterPlot = (
  data: { x: number; y1: number; y2: number }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  // const validData = data.filter(
  //   (d) =>
  //     d.x !== null &&
  //     d.y1 !== null &&
  //     d.y2 !== null &&
  //     d.x !== undefined &&
  //     d.y1 !== undefined &&
  //     d.y2 !== undefined &&
  //     !isNaN(d.x) &&
  //     !isNaN(d.y1) &&
  //     !isNaN(d.y2)
  // );

  const validData = data;
  console.log("Creating dual axis scatter plot with valid data:", validData);

  if (validData.length === 0) {
    console.error("No valid data available for the scatter plot");
    return null;
  }

  const marginTop = useAxis ? 30 : 10;
  const marginRight = useAxis ? 30 : 10;
  const marginBottom = useAxis ? 40 : 10;
  const marginLeft = useAxis ? 40 : 10;

  // Skala untuk sumbu X
  const x = d3
    .scaleLinear()
    .domain(d3.extent(validData, (d) => d.x) as [number, number])
    .nice()
    .range([marginLeft, width - marginRight]);

  // Skala untuk sumbu Y pertama
  const y1 = d3
    .scaleLinear()
    .domain(d3.extent(validData, (d) => d.y1) as [number, number])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Skala untuk sumbu Y kedua
  const y2 = d3
    .scaleLinear()
    .domain(d3.extent(validData, (d) => d.y2) as [number, number])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Membuat SVG
  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

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
          .data(x.ticks())
          .join("line")
          .attr("x1", (d) => x(d))
          .attr("x2", (d) => x(d))
          .attr("y1", marginTop)
          .attr("y2", height - marginBottom)
      );
  }

  if (useAxis) {
    // Menambahkan gridline untuk sumbu Y pertama
    svg
      .append("g")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 0.8)
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(y1.ticks())
          .join("line")
          .attr("y1", (d) => y1(d))
          .attr("y2", (d) => y1(d))
          .attr("x1", marginLeft)
          .attr("x2", width - marginRight)
      );
  }

  // Menambahkan titik untuk sumbu Y pertama
  svg
    .append("g")
    .attr("stroke", "blue")
    .attr("stroke-width", 1.5)
    .attr("fill", "none")
    .selectAll("circle")
    .data(validData)
    .join("circle")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y1(d.y1))
    .attr("r", 3);

  if (useAxis) {
    // Menambahkan gridline untuk sumbu Y kedua
    svg
      .append("g")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 0.8)
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(y2.ticks())
          .join("line")
          .attr("y1", (d) => y2(d))
          .attr("y2", (d) => y2(d))
          .attr("x1", marginLeft)
          .attr("x2", width - marginRight)
      );
  }

  // Menambahkan titik untuk sumbu Y kedua (Lulusan SMA)
  svg
    .append("g")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("fill", "none")
    .selectAll("circle")
    .data(validData)
    .join("circle")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y2(d.y2))
    .attr("r", 3);

  if (useAxis) {
    // Menambahkan sumbu X
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
          .text("→ X Axis")
      );

    // Menambahkan sumbu Y pertama
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y1))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick text").attr("fill", "blue"))
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Y1 Axis")
      );

    // Menambahkan sumbu Y kedua
    svg
      .append("g")
      .attr("transform", `translate(${width - marginRight},0)`)
      .call(d3.axisRight(y2))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick text").attr("fill", "red"))
      .call((g) =>
        g
          .append("text")
          .attr("x", marginRight)
          .attr("y", 10)
          .attr("fill", "red")
          .attr("text-anchor", "end")
          .text("↑ Y2 Axis ")
      );
  }

  return svg.node();
};
