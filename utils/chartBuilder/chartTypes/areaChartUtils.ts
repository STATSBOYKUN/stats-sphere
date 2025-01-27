import * as d3 from "d3";

interface ChartData {
  category: string;
  subcategory: string;
  value: number;
}

interface StackedAreaChartInput {
  category: string;
  [key: string]: number | string;
}

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

/**
 * Membuat Stacked Area Chart dengan Struktur Data Umum.
 *
 * @param data - Array dari objek ChartData
 * @param width - Lebar SVG (default: 928)
 * @param height - Tinggi SVG (default: 500)
 * @param useAxis - Boolean untuk menentukan apakah sumbu akan ditampilkan (default: true)
 * @returns SVGElement atau null jika data tidak valid
 */
export const createStackedAreaChart = (
  data: ChartData[],
  width: number = 928,
  height: number = 500,
  useAxis: boolean = true
): SVGElement | null => {
  // Validasi data
  if (!data || data.length === 0) {
    console.error("No data provided for the stacked area chart.");
    return null;
  }

  // Definisi margin
  const margin = {
    top: useAxis ? 20 : 0,
    right: useAxis ? 20 : 0,
    bottom: useAxis ? 50 : 0,
    left: useAxis ? 60 : 0,
  };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Ekstrak kategori unik dan subkategori unik
  const categories = Array.from(new Set(data.map((d) => d.category))).sort(
    d3.ascending
  );
  const subcategories = Array.from(new Set(data.map((d) => d.subcategory)));

  // Membentuk data terstruktur per kategori
  const dataByCategory: { [key: string]: { [key: string]: number } } = {};
  data.forEach((d) => {
    if (!dataByCategory[d.category]) {
      dataByCategory[d.category] = {};
    }
    dataByCategory[d.category][d.subcategory] = d.value;
  });

  // Membentuk data untuk d3.stack
  const stackData: StackedAreaChartInput[] = categories.map((category) => ({
    category,
    ...dataByCategory[category],
  }));

  // Type assertion untuk memastikan tipe data benar
  const typedStackData = stackData as Array<
    { category: string } & Record<string, number>
  >;

  // Membuat stack generator
  const stackedData = d3
    .stack<{ category: string } & Record<string, number>>()
    .keys(subcategories)
    .value((d, key) => d[key] || 0)(typedStackData);

  // Skala X: scalePoint untuk kategori berbasis string
  const x = d3
    .scalePoint<string>()
    .domain(categories)
    .range([0, innerWidth])
    .padding(0.5);

  // Skala Y
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1]))!])
    .range([innerHeight, 0])
    .nice();

  // Skala Warna
  const color = d3
    .scaleOrdinal<string>()
    .domain(subcategories)
    .range(d3.schemeTableau10);

  // Area Generator
  const area = d3
    .area<d3.SeriesPoint<{ category: string } & Record<string, number>>>()
    .x((d) => x(d.data.category)!)
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]))
    .curve(d3.curveLinear);
  // .curve(d3.curveMonotoneX); //alternatif

  // Membuat SVG
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("style", "max-width: 100%; height: auto;");

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tambahkan Y-axis dan grid lines jika useAxis adalah true
  if (useAxis) {
    chart
      .append("g")
      .call(d3.axisLeft(y).ticks(height / 80))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("x2", innerWidth)
          .attr("stroke-opacity", 0.1)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", -margin.left)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Value")
      );
  }

  // Append areas
  chart
    .selectAll("path")
    .data(stackedData)
    .join("path")
    .attr("fill", (d) => color(d.key)!)
    .attr("d", area)
    .append("title")
    .text((d) => d.key as string);

  // Tambahkan X-axis jika useAxis adalah true
  if (useAxis) {
    const xAxis = d3.axisBottom(x).tickSizeOuter(0);
    chart
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((g) => {
        g.selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");
      });

    // Menambahkan label sumbu X
    svg
      .append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - margin.bottom / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Category");

    // Menambahkan label sumbu Y
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + innerHeight / 2))
      .attr("y", margin.left / 2 - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Value");
  }

  // Tambahkan legenda
  if (useAxis) {
    // Menambahkan legenda
    // const legendGroup = svg
    //   .append("g")
    //   .attr("font-family", "sans-serif")
    //   .attr("font-size", 10)
    //   .attr("text-anchor", "start")
    //   .attr(
    //     "transform",
    //     `translate(${margin.left}, ${height - margin.bottom + 30})`
    //   );

    // const legendItemWidth = 19;
    // const legendItemHeight = 19;
    // const labelOffset = 5;
    // const legendSpacingX = 130;
    // const legendSpacingY = 25;
    // const legendMaxWidth = width - margin.left - margin.right;
    // const itemsPerRow = Math.floor(legendMaxWidth / legendSpacingX);

    // subcategories.forEach((subcategory, index) => {
    //   const row = Math.floor(index / itemsPerRow);
    //   const col = index % itemsPerRow;
    //   const xOffset = col * legendSpacingX;
    //   const yOffset = row * legendSpacingY;

    //   // Menambahkan swatch
    //   legendGroup
    //     .append("rect")
    //     .attr("x", xOffset)
    //     .attr("y", yOffset)
    //     .attr("width", legendItemWidth)
    //     .attr("height", legendItemHeight)
    //     .attr("fill", color(subcategory));

    //   // Menambahkan label teks
    //   legendGroup
    //     .append("text")
    //     .attr("x", xOffset + legendItemWidth + labelOffset)
    //     .attr("y", yOffset + legendItemHeight / 2)
    //     .attr("dy", "0.35em")
    //     .text(subcategory);
    // });
    const legend = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .attr("transform", `translate(${innerWidth + 20}, ${margin.top})`);

    const legendItemSize = 15;
    const legendSpacing = 4;

    subcategories.forEach((sub, i) => {
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
        .attr("fill", color(sub));

      legendRow
        .append("text")
        .attr("x", legendItemSize + legendSpacing)
        .attr("y", legendItemSize / 2)
        .attr("dy", "0.35em")
        .text(sub);
    });

    // Tambahkan tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "#f9f9f9")
      .style("padding", "5px")
      .style("border", "1px solid #d3d3d3")
      .style("border-radius", "4px")
      .style("pointer-events", "none");

    // // Tambahkan interaksi pada path
    // chart
    //   .selectAll("path")
    //   .data(stackedData)
    //   .join("path")
    //   .attr("fill", (d) => color(d.key)!)
    //   .attr("d", area)
    //   .on("mouseover", function (event, d) {
    //     tooltip.transition().duration(200).style("opacity", 1);
    //     tooltip
    //       .html(`Subcategory: ${d.key}`)
    //       .style("left", event.pageX + 10 + "px")
    //       .style("top", event.pageY - 28 + "px");
    //   })
    //   .on("mouseout", function () {
    //     tooltip.transition().duration(500).style("opacity", 0);
    //   })
    //   .append("title")
    //   .text((d) => d.key as string);
  }

  // Mengembalikan elemen SVG
  return svg.node();
};
