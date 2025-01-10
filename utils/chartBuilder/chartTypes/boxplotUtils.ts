import * as d3 from "d3";

export const createBoxPlot = (
  data: { category: string; value: number }[], // Data berupa array objek dengan properti category dan value
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating box plot with data:", data);

  // Menentukan margin hanya jika axis digunakan
  const marginTop = useAxis ? 50 : 0;
  const marginRight = useAxis ? 50 : 0;
  const marginBottom = useAxis ? 60 : 0;
  const marginLeft = useAxis ? 60 : 0;

  // Filter data untuk menghilangkan nilai null, undefined, dan NaN
  const validData = data.filter(
    (d) => d.value !== null && d.value !== undefined && !Number.isNaN(d.value)
  );

  console.log("Valid Data:", validData);

  const x = d3
    .scaleBand()
    .domain(validData.map((d) => d.category))
    .range([marginLeft, width - marginRight])
    .padding(0.5);

  // Menentukan skala sumbu Y (nilai)
  const validY = validData
    .map((d) => d.value)
    .filter((d) => d !== null && d !== undefined && !Number.isNaN(d));
  const y = d3
    .scaleLinear()
    .domain([d3.min(validY) || 0, d3.max(validY) || 0])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Membuat elemen SVG baru di dalam DOM
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Mengelompokkan data berdasarkan kategori
  const groupedData = d3.group(validData, (d) => d.category);
  const boxData = Array.from(groupedData, ([category, group]) => {
    const sorted = group.map((d) => d.value).sort(d3.ascending);
    const q1 = d3.quantile(sorted, 0.25) ?? 0;
    const median = d3.quantile(sorted, 0.5) ?? 0;
    const q3 = d3.quantile(sorted, 0.75) ?? 0;
    const iqr = q3 - q1;
    const min = d3.min(group, (d) => d.value) ?? 0;
    const max = d3.max(group, (d) => d.value) ?? 0;
    const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
    const upperWhisker = Math.min(max, q3 + 1.5 * iqr);
    const outliers = group.filter(
      (d) => d.value < lowerWhisker || d.value > upperWhisker
    );

    return { category, q1, median, q3, lowerWhisker, upperWhisker, outliers };
  });

  // Membuat grup untuk setiap kategori pada sumbu X
  const g = svg
    .append("g")
    .selectAll("g")
    .data(boxData)
    .join("g")
    .attr("transform", (d) => {
      return `translate(${x(d.category)}, 0)`;
    });

  // Menambahkan whiskers (garis vertikal untuk rentang IQR)
  g.append("line")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", (d) => y(d.upperWhisker))
    .attr("y2", (d) => y(d.lowerWhisker))
    .attr("stroke", "currentColor")
    .attr("stroke-width", 1);

  // Box (Q1 hingga Q3)
  g.append("rect")
    .attr("x", -x.bandwidth() / 2)
    .attr("y", (d) => y(d.q3))
    .attr("width", x.bandwidth())
    .attr("height", (d) => y(d.q1) - y(d.q3))
    .attr("fill", "#ddd");

  // Median (garis horisontal)
  g.append("line")
    .attr("x1", -x.bandwidth() / 2)
    .attr("x2", x.bandwidth() / 2)
    .attr("y1", (d) => y(d.median))
    .attr("y2", (d) => y(d.median))
    .attr("stroke", "currentColor")
    .attr("stroke-width", 2);

  // Outliers (titik di luar whiskers)
  g.append("g")
    .attr("fill", "currentColor")
    .attr("fill-opacity", 0.6)
    .attr("stroke", "none")
    .selectAll("circle")
    .data((d) => d.outliers)
    .join("circle")
    .attr("cx", 0)
    .attr("cy", (d) => y(d.value))
    .attr("r", 3);

  // Menambahkan sumbu X di bagian bawah tanpa label kategori
  if (useAxis) {
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSize(0));
  }

  // Menambahkan sumbu Y jika diperlukan
  if (useAxis) {
    // Menambahkan sumbu Y (vertical axis)
    const yAxisGroup = svg
      .append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y).ticks(5))
      .call((g) => g.select(".domain").remove());

    // Menambahkan garis vertikal untuk sumbu Y (axis Y) di kiri
    svg
      .append("line")
      .attr("x1", marginLeft)
      .attr("x2", marginLeft)
      .attr("y1", marginTop)
      .attr("y2", height - marginBottom)
      .attr("stroke", "currentColor")
      .attr("stroke-width", 1);
  }

  return svg.node();
};
