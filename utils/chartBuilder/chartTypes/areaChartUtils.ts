import * as d3 from "d3";

export const createAreaChart = (
  data: { category: string; value: number }[], // Data dengan category sebagai string dan value sebagai angka
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating area chart with data:", data);

  // Filter data untuk menghilangkan item dengan category atau value yang tidak valid
  const validData = data.filter(
    (d) =>
      d.category &&
      !Number.isNaN(d.value) &&
      d.value !== null &&
      d.value !== undefined
  );

  console.log("Filtered valid data:", validData);

  // Menentukan margin hanya jika axis digunakan
  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 40 : 0;

  // Menentukan skala untuk sumbu X dan Y
  const x = d3
    .scaleBand() // scaleBand untuk kategori
    .domain(validData.map((d) => d.category))
    .range([marginLeft, width - marginRight])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(validData, (d) => d.value) as number])
    .range([height - marginBottom, marginTop]);

  // Generator untuk area chart
  const area = d3
    .area<{ category: string; value: number }>()
    .x((d) => x(d.category)! + x.bandwidth() / 2)
    .y0(y(0))
    .y1((d) => y(d.value));

  // Membuat elemen SVG baru di dalam DOM
  const svg = d3
    .create("svg")
    .attr("width", width + marginLeft + marginRight)
    .attr("height", height + marginTop + marginBottom)
    .attr("viewBox", [
      0,
      0,
      width + marginLeft + marginRight,
      height + marginTop + marginBottom,
    ]) // ViewBox untuk responsif
    .attr("style", "max-width: 100%; height: auto;");

  // Menambahkan path untuk area chart
  svg.append("path").datum(validData).attr("fill", "steelblue").attr("d", area);

  // Jika axis digunakan, tambahkan sumbu X dan Y
  if (useAxis) {
    // X-Axis (Horizontal)
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
      );

    // Y-Axis (Vertical)
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Value")
      );
  }

  // Mengembalikan node SVG
  return svg.node();
};
