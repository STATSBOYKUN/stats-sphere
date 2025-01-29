import * as d3 from "d3";

export const createHistogram = (
  data: number[], // Data numerik berupa array
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating histogram with data:", data);

  // Menentukan margin hanya jika axis digunakan
  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 30 : 0;

  // Filter data untuk menghilangkan nilai null, undefined, dan NaN
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

  // Menambahkan sumbu X jika diperlukan
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

  // Menambahkan sumbu Y jika diperlukan
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
  return svg.node(); // Mengembalikan SVG sebagai node
};
