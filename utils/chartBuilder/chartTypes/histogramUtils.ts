import * as d3 from "d3";

interface ChartData {
  category: string;
  subcategory: string;
  value: number;
}

// Definisikan interface untuk formattedData
interface FormattedData {
  category: string;
  [key: string]: number | string;
}

export const createHistogram = (
  data: number[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating histogram with data:", data);

  // Menentukan margin
  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 30 : 0;

  // Filter data
  const validData = data.filter(
    (d) => d !== null && d !== undefined && !Number.isNaN(d) && d !== 0
  );

  console.log("Creating histogram with valid data:", validData);

  // Menentukan jumlah bins secara dinamis berdasarkan ukuran data dan rentang nilai
  const thresholds = Math.max(5, Math.ceil(validData.length / 5));
  // Membuat bins dari data yang valid
  const bins = d3
    .bin()
    .thresholds(thresholds)
    .value((d: any) => d)(validData);

  // Pastikan x0 dan x1 memiliki nilai fallback jika undefined
  const x0 =
    bins.length > 0 && bins[0].x0 !== undefined
      ? bins[0].x0
      : d3.min(validData) || 0;
  const x1 =
    bins.length > 0 && bins[bins.length - 1].x1 !== undefined
      ? bins[bins.length - 1].x1
      : d3.max(validData);

  // Pastikan x0 dan x1 adalah tipe number
  const x0Value: number = typeof x0 === "number" ? x0 : 0;
  const x1Value: number =
    typeof x1 === "number" ? x1 : Math.max(d3.max(validData) as number, 10);

  // Menentukan skala untuk sumbu X
  const x = d3
    .scaleLinear()
    .domain([x0Value, x1Value])
    .range([marginLeft, width - marginRight]);

  // Menentukan skala untuk sumbu Y
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (d) => d.length) || 0])
    .range([height - marginBottom, marginTop]);

  // Membuat elemen SVG baru di dalam DOM
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // Menambahkan rectangle untuk setiap bin
  svg
    .append("g")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", (d) => x(d.x0 || 0) + 1)
    .attr("width", (d) => x(d.x1 || 0) - x(d.x0 || 0) - 2)
    .attr("y", (d) => y(d.length))
    .attr("height", (d) => y(0) - y(d.length));

  // Menambahkan X axis
  if (useAxis) {
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", width)
          .attr("y", marginBottom - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("→ Data")
      );
  }

  // Menambahkan Y axis
  if (useAxis) {
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Frequency")
      );
  }

  // Mengembalikan node SVG
  return svg.node();
};

export const createPopulationPyramid = (
  data: ChartData[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  const margin = {
    top: 20,
    right: 50,
    bottom: useAxis ? 40 : 10,
    left: useAxis ? 50 : 10,
  };
  console.log("Data", data);
  const svgWidth = width + margin.left + margin.right;
  const svgHeight = height + margin.top + margin.bottom;

  // Skala untuk sumbu X (populasi)
  const maxPopulation = d3.max(data, (d: ChartData) => d.value) || 0;
  const x = d3
    .scaleLinear()
    .domain([-maxPopulation, maxPopulation])
    .range([0, width]);

  // Skala untuk sumbu Y (kategori usia)
  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.category))
    .range([height, 0])
    .padding(0.1);

  // Membuat elemen SVG
  const svg = d3
    .create("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("viewBox", [0, 0, svgWidth, svgHeight])
    .attr("style", "max-width: 100%; height: auto;");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Menambahkan bar 1
  g.selectAll(".bar-male")
    .data(data.filter((d) => d.subcategory === "M"))
    .join("rect")
    .attr("class", "bar-male")
    .attr("x", (d) => x(-d.value))
    .attr("y", (d) => y(d.category) || 0)
    .attr("width", (d) => x(0) - x(-d.value))
    .attr("height", y.bandwidth())
    .attr("fill", "#3498db");

  // Menambahkan bar 2
  g.selectAll(".bar-female")
    .data(data.filter((d) => d.subcategory === "F"))
    .join("rect")
    .attr("class", "bar-female")
    .attr("x", x(0))
    .attr("y", (d) => y(d.category) || 0)
    .attr("width", (d) => x(d.value) - x(0))
    .attr("height", y.bandwidth())
    .attr("fill", "#e74c3c");

  // Menambahkan X axis
  if (useAxis) {
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((d) => Math.abs(Number(d)) + "")
      )
      .call((g) => g.select(".domain").remove());
  }

  // Menambahkan sumbu Y (kelompok usia) jika useAxis true
  if (useAxis) {
    g.append("g")
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove());
  }

  return svg.node();
};

// export const createPopulationPyramid = (
//   data: { ageGroup: string; male: number; female: number }[], // Data harus memiliki tipe eksplisit
//   width: number,
//   height: number
// ) => {
//   const margin = { top: 20, right: 50, bottom: 30, left: 50 };
//   const svgWidth = width + margin.left + margin.right;
//   const svgHeight = height + margin.top + margin.bottom;

//   // Skala untuk sumbu X (populasi)
//   const x = d3
//     .scaleLinear()
//     .domain([
//       0,
//       d3.max(data, (d: { male: number; female: number }) =>
//         Math.max(d.male, d.female)
//       ) || 0,
//     ])
//     .range([0, width / 2]);

//   // Skala untuk sumbu Y (kategori usia)
//   const y = d3
//     .scaleBand()
//     .domain(data.map((d: { ageGroup: string }) => d.ageGroup))
//     .range([height, 0])
//     .padding(0.1);

//   // Membuat elemen SVG
//   const svg = d3
//     .create("svg")
//     .attr("width", svgWidth)
//     .attr("height", svgHeight)
//     .attr("viewBox", [0, 0, svgWidth, svgHeight])
//     .attr("style", "max-width: 100%; height: auto;");

//   const g = svg
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

//   // Menambahkan bar untuk pria (male) di sisi kiri
//   g.selectAll(".bar-male")
//     .data(data)
//     .join("rect")
//     .attr("class", "bar-male")
//     .attr("x", (d) => width / 2 - x(d.male))
//     .attr("y", (d) => y(d.ageGroup) || 0)
//     .attr("width", (d) => x(d.male))
//     .attr("height", y.bandwidth())
//     .attr("fill", "#3498db"); // Warna biru untuk pria

//   // Menambahkan bar untuk wanita (female) di sisi kanan
//   g.selectAll(".bar-female")
//     .data(data)
//     .join("rect")
//     .attr("class", "bar-female")
//     .attr("x", width / 2)
//     .attr("y", (d) => y(d.ageGroup) || 0)
//     .attr("width", (d) => x(d.female))
//     .attr("height", y.bandwidth())
//     .attr("fill", "#e74c3c"); // Warna merah untuk wanita

//   // Menambahkan sumbu X untuk pria di kiri
//   g.append("g")
//     .attr("transform", `translate(${width / 2},${height})`)
//     .call(
//       d3
//         .axisBottom(x)
//         .ticks(5)
//         .tickFormat((d) => d + "M")
//     )
//     .call((g) => g.select(".domain").remove());

//   // Menambahkan sumbu X untuk wanita di kanan
//   g.append("g")
//     .attr("transform", `translate(${width / 2},${height})`)
//     .call(
//       d3
//         .axisBottom(x)
//         .ticks(5)
//         .tickFormat((d) => d + "M")
//     )
//     .call((g) => g.select(".domain").remove());

//   // Menambahkan sumbu Y (kelompok usia)
//   g.append("g")
//     .call(d3.axisLeft(y))
//     .call((g) => g.select(".domain").remove());

//   return svg.node();
// };

export const createFrequencyPolygon = (
  data: { category: string; value: number }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating frequency polygon with data:", data);

  // Filter data
  const validData = data.filter(
    (d) =>
      d.category &&
      d.value !== undefined &&
      d.value !== null &&
      !Number.isNaN(d.value)
  );

  if (validData.length === 0) {
    console.warn("No valid data available for creating the chart.");
    return null;
  }

  console.log("Filtered valid data:", validData);

  // Extend data with zero values to create boundary points
  const firstCategory = validData[0].category || "No Category";
  const lastCategory =
    validData[validData.length - 1].category || "No Category";
  const extendedData = [
    { category: "start", value: 0 },
    ...validData,
    { category: "end", value: 0 },
  ];

  console.log("Extended data with zero boundaries:", extendedData);

  // Set margins based on whether axes are enabled
  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 40 : 0;

  // Set scales for X and Y axes
  const x = d3
    .scalePoint()
    .domain(extendedData.map((d) => d.category))
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(extendedData, (d) => d.value) as number])
    .range([height - marginBottom, marginTop]);

  // Define line generator for frequency polygon
  const line = d3
    .line<{ category: string; value: number }>()
    .x((d) => x(d.category)!)
    .y((d) => y(d.value))
    .curve(d3.curveMonotoneX);

  // Create SVG element
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

  // Append frequency polygon line to the SVG
  svg
    .append("path")
    .datum(extendedData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Append data points to the SVG
  svg
    .append("g")
    .selectAll("circle")
    .data(extendedData)
    .join("circle")
    .attr("cx", (d) => x(d.category)!)
    .attr("cy", (d) => y(d.value))
    .attr("r", 4)
    .attr("fill", "steelblue");

  // If axis is enabled, append X and Y axes
  if (useAxis) {
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    svg
      .append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Frequency")
      );
  }

  // Return the SVG node
  return svg.node();
};

export const createStackedHistogram = (
  data: { value: number; category: string }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating stacked histogram with data:", data);

  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 30 : 0;

  // Filter data untuk menghilangkan nilai yang tidak valid
  const validData = data.filter(
    (d) =>
      d.value !== null &&
      d.value !== undefined &&
      !Number.isNaN(d.value) &&
      d.value !== 0
  );

  // Kelompokkan data berdasarkan kategori
  const categories = Array.from(new Set(validData.map((d) => d.category)));

  // Menentukan bins
  const thresholds = Math.max(5, Math.ceil(validData.length / 5));
  const binGenerator = d3
    .bin<{ value: number; category: string }, number>()
    .thresholds(thresholds)
    .value((d) => d.value);

  const bins = binGenerator(validData);

  // Pastikan x0 dan x1 selalu bertipe number
  const x0Value: number = bins[0]?.x0 ?? 0;
  const x1Value: number =
    bins[bins.length - 1]?.x1 ?? d3.max(validData.map((d) => d.value)) ?? 10;

  // Buat struktur data untuk d3.stack()
  const stackedData = bins.map((bin) => {
    const counts: { [key: string]: number } = {};
    categories.forEach((category) => (counts[category] = 0));
    bin.forEach((d) => counts[d.category]++);
    return { x0: bin.x0 ?? 0, x1: bin.x1 ?? 0, ...counts };
  });

  // Skala X
  const x = d3
    .scaleLinear()
    .domain([x0Value, x1Value])
    .range([marginLeft, width - marginRight]);

  // Skala Y
  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(stackedData, (d) => d3.sum(categories, (c) => (d as any)[c])) ?? 0,
    ])
    .range([height - marginBottom, marginTop]);

  // Skala warna untuk kategori
  const color = d3.scaleOrdinal().domain(categories).range(d3.schemeCategory10);

  // Data untuk d3.stack()
  const stack = d3.stack<{ [key: string]: number }>().keys(categories);
  const series = stack(stackedData);

  // Buat elemen SVG
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // Buat kelompok bar
  const groups = svg
    .append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", (d) => color(d.key) as string);

  // Tambahkan rect untuk setiap kategori dalam bin
  groups
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => x(d.data.x0))
    .attr("width", (d) => Math.max(1, x(d.data.x1) - x(d.data.x0) - 2))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => Math.max(0, y(d[0]) - y(d[1])));

  // Tambahkan sumbu X
  if (useAxis) {
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", width)
          .attr("y", marginBottom - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("→ Data")
      );
  }

  // Tambahkan sumbu Y
  if (useAxis) {
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Frequency")
      );

    // Tambahkan legenda
    const legend = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(categories)
      .join("g")
      .attr("transform", (d, i) => `translate(${width - 100},${i * 20})`);

    const legendItemWidth = 19;
    const legendItemHeight = 19;
    const labelOffset = 5;

    legend
      .append("rect")
      .attr("width", legendItemWidth)
      .attr("height", legendItemHeight)
      .attr("fill", (d) => color(d) as string);

    legend
      .append("text")
      .attr("x", legendItemWidth + labelOffset)
      .attr("y", legendItemHeight / 2)
      .attr("dy", "0.35em")
      .text((d) => d);
  }

  // Kembalikan node SVG
  return svg.node();
};
