import * as d3 from "d3";
import * as ss from "simple-statistics";

export const createScatterPlot = (
  data: { x: number; y: number }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  // Menyaring data yang valid (x, y harus berupa angka dan tidak NaN)
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

  // Jika tidak ada data valid, tampilkan pesan error
  if (validData.length === 0) {
    console.error("No valid data available for the scatter plot");
    return null;
  }

  // Menentukan margin hanya jika axis digunakan
  const marginTop = useAxis ? 30 : 10;
  const marginRight = useAxis ? 30 : 10;
  const marginBottom = useAxis ? 40 : 10;
  const marginLeft = useAxis ? 40 : 10;

  // Menentukan skala untuk sumbu X dan Y
  const x = d3
    .scaleLinear()
    .domain(d3.extent(validData, (d) => d.x) as [number, number])
    .nice() // Memperhalus nilai domain
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

  // Menambahkan sumbu X dan grid lines jika diperlukan
  if (useAxis) {
    // Menambahkan grid lines untuk X
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

    // Menambahkan grid lines untuk Y
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
          .text("→ X Axis Label")
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
          .text("↑ Y Axis Label")
      );
  }

  // Mengembalikan node SVG
  return svg.node();
};

// export const createScatterPlot = (
//   data: { x: number; y: number }[], // Data berupa array objek { x: number, y: number }
//   width: number,
//   height: number,
//   useAxis: boolean = true
// ) => {
//   console.log("Creating scatter plot with data:", data);

//   const marginTop = useAxis ? 30 : 0;
//   const marginRight = useAxis ? 30 : 0;
//   const marginBottom = useAxis ? 30 : 0;
//   const marginLeft = useAxis ? 30 : 0;

//   // Skala X dan Y
//   const x = d3
//     .scaleLinear()
//     .domain(d3.extent(data, (d) => d.x) as [number, number])
//     .range([marginLeft, width - marginRight]);

//   const y = d3
//     .scaleLinear()
//     .domain(d3.extent(data, (d) => d.y) as [number, number])
//     .range([height - marginBottom, marginTop]);

//   // Elemen SVG
//   const svg = d3
//     .create("svg")
//     .attr("width", width + marginLeft + marginRight)
//     .attr("height", height + marginTop + marginBottom)
//     .attr("viewBox", [
//       0,
//       0,
//       width + marginLeft + marginRight,
//       height + marginTop + marginBottom,
//     ])
//     .attr("style", "max-width: 100%; height: auto;");

//   // Menambahkan titik scatter
//   svg
//     .append("g")
//     .attr("fill", "steelblue")
//     .selectAll("circle")
//     .data(data)
//     .join("circle")
//     .attr("cx", (d: { x: number; y: number }) => x(d.x))
//     .attr("cy", (d: { x: number; y: number }) => y(d.y))
//     .attr("r", 5);

//   // Tambahkan axis jika diperlukan
//   if (useAxis) {
//     svg
//       .append("g")
//       .attr("transform", `translate(0, ${height - marginBottom})`)
//       .call(d3.axisBottom(x));

//     svg
//       .append("g")
//       .attr("transform", `translate(${marginLeft}, 0)`)
//       .call(d3.axisLeft(y));
//   }

//   return svg.node();
// };

export const createScatterPlotWithFitLine = (
  data: { x: number; y: number }[], // Data berupa array objek dengan properti x dan y
  width: number,
  height: number,
  useAxis: boolean = true,
  showEquation: boolean = true
) => {
  // Menyaring data yang valid (x, y harus berupa angka dan tidak NaN)
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

  // Jika tidak ada data valid, tampilkan pesan error atau tangani kasus ini
  if (validData.length === 0) {
    console.error("No valid data available for the scatter plot");
    return null;
  }

  // Menentukan margin hanya jika axis digunakan
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
