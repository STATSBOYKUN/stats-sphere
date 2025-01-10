import * as d3 from "d3";

export const createPieChart = (
  data: { category: string; value: number }[], // Data dengan kategori dan nilai
  width: number = 928,
  height: number = Math.min(width, 500),
  colorRange: readonly string[] = d3.schemeBlues[9],
  labelThreshold: number = 0.25
) => {
  console.log("Creating pie chart with data:", data);

  // Validasi data
  const validData = data.filter(
    (d) =>
      typeof d.category === "string" &&
      typeof d.value === "number" &&
      d.value >= 0
  );

  if (validData.length === 0) {
    console.error("No valid data available for the pie chart");
    return null;
  }

  console.log("Creating pie chart with valid data:", validData);

  // Skala warna berdasarkan jumlah kategori
  let colorScheme: readonly string[];
  const numCategories = validData.length;

  if (numCategories === 1) {
    // Jika hanya ada satu kategori, gunakan warna tengah dari skema
    colorScheme = [d3.schemeBlues[9][4]];
  } else if (numCategories <= 9) {
    // Jika jumlah kategori <= 9, gunakan skema yang sesuai
    colorScheme = d3.schemeBlues[numCategories];
  } else {
    // Jika lebih dari 9, gunakan skema maksimum
    colorScheme = d3.schemeBlues[9];
  }

  const color = d3
    .scaleOrdinal<string>()
    .domain(validData.map((d) => d.category))
    .range(colorScheme);

  // Layout pie dan generator arc
  const pie = d3
    .pie<{ category: string; value: number }>()
    .sort(null)
    .value((d) => d.value);

  // Menghitung outerRadius secara langsung tanpa pemanggilan arc.outerRadius()
  const outerRadius = Math.min(width, height) / 2 - 1;
  const labelRadius = outerRadius * 0.8;

  // Generator arc untuk pie chart
  const arc = d3
    .arc<d3.PieArcDatum<{ category: string; value: number }>>()
    .innerRadius(0)
    .outerRadius(outerRadius);

  const arcs = pie(validData);

  // Membuat elemen SVG baru
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Menambahkan sektor untuk setiap data
  svg
    .append("g")
    .attr("stroke", "white")
    .selectAll("path")
    .data(arcs)
    .join("path")
    .attr(
      "fill",
      (d: d3.PieArcDatum<{ category: string; value: number }>) =>
        color(d.data.category) as string // Menggunakan category untuk warna
    )
    .attr("d", arc)
    .append("title")
    .text(
      (d: d3.PieArcDatum<{ category: string; value: number }>) =>
        `${d.data.category}: ${d.data.value.toLocaleString("en-US")}`
    );

  // Menambahkan label ke dalam chart
  svg
    .append("g")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(arcs)
    .join("text")
    .attr(
      "transform",
      (d: d3.PieArcDatum<{ category: string; value: number }>) =>
        `translate(${arc.centroid(d)})`
    );
  // .call((text) =>
  //   text
  //     .append("tspan")
  //     .attr("y", "-0.4em")
  //     .attr("font-weight", "bold")
  //     .text((d) => d.data.category)
  // )
  // .call((text) =>
  //   text
  //     .filter((d) => d.endAngle - d.startAngle > labelThreshold * 2 * Math.PI)
  //     .append("tspan")
  //     .attr("x", 0)
  //     .attr("y", "0.7em")
  //     .attr("fill-opacity", 0.7)
  //     .text((d) => d.data.value.toLocaleString("en-US"))
  // );

  return svg.node();
};
