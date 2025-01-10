import * as d3 from "d3";

interface ChartData {
  category: string;
  subcategory: string;
  value: number;
}

// Fungsi untuk membuat line chart
export const createLineChart = (
  data: { category: string; value: number }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating chart with data:", data);

  // Menentukan margin hanya jika axis digunakan
  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 30 : 0;

  // Menentukan skala untuk sumbu X dan Y
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.category))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) as number])
    .range([height - marginBottom, marginTop]);

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
    ])
    .attr("style", "max-width: 100%; height: auto;");

  // Mendeklarasikan generator garis
  const line = d3
    .line<{ category: string; value: number }>()
    .x((d) => x(d.category)!)
    .y((d) => y(d.value)!);

  // Menambahkan path untuk garis
  svg
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line(data));

  // Jika axis digunakan, tambahkan sumbu X dan Y
  if (useAxis) {
    // X-Axis (Horizontal)
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // Y-Axis (Vertical)
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
          .text("↑ Value")
      );
  }

  // Mengembalikan node SVG
  return svg.node();
};

/**
 * Membuat Multiline Chart dengan Sumbu X Berbasis Kategori (Ordinal)
 *
 * @param data - Array dari objek ChartData
 * @param width - Lebar SVG
 * @param height - Tinggi SVG
 * @param useAxis - Boolean untuk menentukan apakah sumbu akan ditampilkan
 * @returns SVGElement atau null jika data tidak valid
 */
export const createMultilineChart = (
  data: ChartData[],
  width: number,
  height: number,
  useAxis: boolean = true
): SVGElement | null => {
  // Validasi data
  const validData = data.filter(
    (d) =>
      typeof d.category === "string" &&
      typeof d.subcategory === "string" &&
      typeof d.value === "number" &&
      d.value >= 0
  );

  if (validData.length === 0) {
    console.error("No valid data available for the multiline chart");
    return null;
  }

  console.log("Creating multiline chart with valid data:", validData);

  // Definisi margin
  const marginTop = useAxis ? 20 : 0;
  const marginRight = useAxis ? 20 : 0;
  const marginBottom = useAxis ? 100 : 0;
  const marginLeft = useAxis ? 50 : 0;

  // Ekstrak seri dan kategori unik
  const subcategoryNames = Array.from(
    new Set(validData.map((d) => d.subcategory))
  );
  const categories = Array.from(new Set(validData.map((d) => d.category))).sort(
    d3.ascending
  );

  // Pastikan semua kategori ada dalam skala X
  const xScaleDomain = categories;

  // Membentuk data terstruktur per subkategori
  const dataBySubcategory: {
    [key: string]: { category: string; value: number }[];
  } = {};
  subcategoryNames.forEach((subcategory) => {
    dataBySubcategory[subcategory] = validData
      .filter((d) => d.subcategory === subcategory)
      .sort((a, b) => d3.ascending(a.category, b.category));
  });

  // Membuat skala untuk sumbu X dan Y
  const x = d3
    .scalePoint<string>()
    .domain(xScaleDomain)
    .range([marginLeft, width - marginRight])
    .padding(0.5);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(validData, (d) => d.value)!])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Skala warna
  const color = d3
    .scaleOrdinal<string>()
    .domain(subcategoryNames)
    .range(d3.schemeCategory10)
    .unknown("#ccc");

  // Membuat elemen SVG
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr(
      "style",
      "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;"
    );

  // Menambahkan sumbu X jika useaxiis = true
  if (useAxis) {
    // Sumbu X
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x))
      .call((g) => g.selectAll(".domain").remove());

    // Sumbu Y
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
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

  // Membuat garis untuk setiap subkategori
  const line = d3
    .line<{ category: string; value: number }>()
    .x((d) => x(d.category)!)
    .y((d) => y(d.value));

  svg
    .append("g")
    .selectAll("path")
    .data(subcategoryNames)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", (d) => color(d))
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", (d) => line(dataBySubcategory[d])!);

  // Menambahkan interaktivitas (tooltip)
  // Membuat div untuk tooltip
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

  // Menambahkan titik-titik interaktif untuk tooltip
  subcategoryNames.forEach((subcategory) => {
    svg
      .append("g")
      .selectAll("circle")
      .data(dataBySubcategory[subcategory])
      .join("circle")
      .attr("cx", (d) => x(d.category)!)
      .attr("cy", (d) => y(d.value))
      .attr("r", 3)
      .attr("fill", color(subcategory))
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `<strong>Subcategory:</strong> ${subcategory}<br><strong>Category:</strong> ${d.category}<br><strong>Value:</strong> ${d.value}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  });

  // Menambahkan legenda secara horizontal di bawah chart dengan label di samping swatches
  if (useAxis) {
    const legendGroup = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .attr(
        "transform",
        `translate(${marginLeft}, ${height - marginBottom + 50})`
      );

    const legendItemWidth = 19;
    const legendItemHeight = 19;
    const labelOffset = 3;
    const legendSpacingX = 130;
    const legendSpacingY = 10;
    const legendMaxWidth = width - marginLeft - marginRight;
    const itemsPerRow = Math.floor(legendMaxWidth / legendSpacingX);

    subcategoryNames.forEach((subcategory, index) => {
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
        .attr("fill", color(subcategory));

      // Menambahkan label teks
      legendGroup
        .append("text")
        .attr("x", xOffset + legendItemWidth + labelOffset)
        .attr("y", yOffset + legendItemHeight / 2)
        .attr("dy", "0.35em")
        .text(subcategory);
    });

    // Menambahkan label sumbu X (opsional)
    svg
      .append("text")
      .attr("x", (width - marginLeft - marginRight) / 2 + marginLeft)
      .attr("y", height - marginBottom + 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Category");

    // Menambahkan label sumbu Y (opsional)
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(marginTop + (height - marginBottom - marginTop) / 2))
      .attr("y", marginLeft - 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Value");
  }

  // // Menambahkan judul chart
  // svg
  //   .append("text")
  //   .attr("x", width / 2)
  //   .attr("y", marginTop / 2)
  //   .attr("text-anchor", "middle")
  //   .attr("font-size", "16px")
  //   .attr("font-weight", "bold")
  //   .text("Multiline Chart Example");

  // Mengembalikan elemen SVG
  return svg.node();
};
