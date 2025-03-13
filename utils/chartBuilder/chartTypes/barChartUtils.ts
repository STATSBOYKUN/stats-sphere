import * as d3 from "d3";

// Definisikan interface untuk data chart
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

export const createVerticalBarChart2 = (
  data: { category: string; value: number }[], // Data berupa array objek { category: string; value: number }
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
    .create("svg") // Membuat SVG baru
    .attr("width", width + marginLeft + marginRight)
    .attr("height", height + marginTop + marginBottom)
    .attr("viewBox", [
      0,
      0,
      width + marginLeft + marginRight,
      height + marginTop + marginBottom,
    ])
    .attr("style", "max-width: 100%; height: auto;");

  // Menambahkan rectangle untuk setiap bar
  svg
    .append("g")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d: { category: string; value: number }) => x(d.category) || 0)
    .attr("y", (d: { category: string; value: number }) => y(d.value))
    .attr(
      "height",
      (d: { category: string; value: number }) =>
        (y(0) as number) - (y(d.value) as number)
    )
    .attr("width", x.bandwidth());

  // Jika axis digunakan, tambahkan sumbu X dan Y
  if (useAxis) {
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

export const createHorizontalBarChart = (
  data: { category: string; value: number }[],
  width: number,
  height: number,
  useAxis: boolean = true,
  barColor: string = "steelblue",
  threshold: number = 0.007
) => {
  // Menentukan margin
  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 30 : 0;

  // Skala untuk sumbu X (horizontal) dan Y (vertikal)
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) as number])
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.category)) //
    .rangeRound([marginTop, height - marginBottom])
    .padding(0.1);

  // Format untuk nilai yang ditampilkan pada bar
  const format = x.tickFormat(20, "%");

  // Membuat elemen SVG baru
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Menambahkan rect (bar) untuk setiap data
  svg
    .append("g")
    .attr("fill", barColor)
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d.category) || 0)
    .attr("width", (d) => x(d.value) - x(0))
    .attr("height", y.bandwidth());

  // Menambahkan label pada bar
  // svg
  //   .append("g")
  //   .attr("fill", "white")
  //   .attr("text-anchor", "end")
  //   .selectAll("text")
  //   .data(data)
  //   .join("text")
  //   .attr("x", (d) => x(d.value)) // Posisi horizontal teks di akhir bar
  //   .attr("y", (d) => {
  //     // Pastikan kategori ada dalam domain y
  //     const yPosition = y(d.category);
  //     return yPosition ? yPosition + y.bandwidth() / 2 : 0; // Jika y(d.category) undefined, fallback ke 0
  //   }) // Posisi vertikal di tengah bar
  //   .attr("dy", "0.35em")
  //   .attr("dx", -4)
  //   .text((d) => format(d.value)) // Menampilkan nilai bar
  //   .call(
  //     (text) =>
  //       text
  //         .filter((d) => x(d.value) - x(0) < threshold) // Untuk bar yang pendek
  //         .attr("dx", +4) // Menggeser teks ke kanan jika bar sangat pendek
  //         .attr("fill", "black") // Warna teks hitam
  //         .attr("text-anchor", "start") // Teks disusun ke kiri
  //   );

  // Menambahkan sumbu X jika useAxis true
  if (useAxis) {
    // Sumbu X (Horizontal)
    svg
      .append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(d3.axisTop(x).ticks(width / 80))
      .call((g) => g.select(".domain").remove());

    // Sumbu Y (Vertical)
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0));
  }

  // Mengembalikan elemen SVG
  return svg.node(); // Mengembalikan node SVG untuk ditambahkan ke DOM
};

// export const createVerticalBarChart = (
//   svg: any,
//   data: number[],
//   width: number,
//   height: number
// ) => {
//   svg
//     .attr("width", width)
//     .attr("height", height)
//     .selectAll("rect")
//     .data(data)
//     .enter()
//     .append("rect")
//     .attr("x", (d: number, i: number) => i * (width / data.length))
//     .attr("y", (d: number) => height - d)
//     .attr("width", width / data.length - 5)
//     .attr("height", (d: number) => d)
//     .attr("fill", "#69b3a2");
// };

export const createVerticalStackedBarChart = (
  data: ChartData[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  // Validasi data
  console.log("Creating stacked bar plot with data", data);
  const validData = data.filter(
    (d) =>
      typeof d.category === "string" &&
      typeof d.subcategory === "string" &&
      typeof d.value === "number" &&
      d.value >= 0
  );

  if (validData.length === 0) {
    console.error("No valid data available for the stacked bar chart");
    return null;
  }

  console.log("Creating stacked bar plot with valid data:", validData);

  // Definisi margin
  const marginTop = useAxis ? 20 : 0;
  const marginRight = useAxis ? 20 : 0;
  const marginBottom = useAxis ? 100 : 0;
  const marginLeft = useAxis ? 50 : 0;

  // Kategori utama dan subkategori
  const categories = Array.from(new Set(validData.map((d) => d.category)));
  const subcategories = Array.from(
    new Set(validData.map((d) => d.subcategory))
  );

  // Format data untuk stack
  const formattedData: FormattedData[] = categories.map((category) => {
    const entry: FormattedData = { category };
    validData
      .filter((d) => d.category === category)
      .forEach((d) => {
        entry[d.subcategory] = d.value;
      });
    return entry;
  });

  // Membuat stack generator
  const stackGenerator = d3
    .stack<FormattedData>()
    .keys(subcategories as string[]);
  const series = stackGenerator(formattedData);

  // Skala untuk sumbu X dan Y
  const x = d3
    .scaleBand<string>()
    .domain(categories)
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, (s) => d3.max(s, (d) => d[1]))!])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Warna
  let colorScheme: readonly string[];
  if (subcategories.length <= 3) {
    // Gunakan skema minimum 3 warna jika subcategories <= 3 (dibalik)
    colorScheme = d3.schemeBlues[3].slice().reverse();
  } else if (subcategories.length <= 9) {
    // Gunakan skema yang sesuai dengan jumlah subcategories (dibalik)
    colorScheme = d3.schemeBlues[subcategories.length].slice().reverse();
  } else {
    // Jika lebih dari 9, gunakan skema maksimum dan dibalik
    colorScheme = d3.schemeBlues[9].slice().reverse();
  }

  const color = d3
    .scaleOrdinal<string>()
    .domain(subcategories)
    .range(colorScheme);

  // Membuat elemen SVG
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
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  svg
    .append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", (d) => color(d.key) || "#ccc")
    .selectAll("rect")
    .data((d) =>
      d.map((item) => ({
        ...item,
        key: d.key,
      }))
    )
    .join("rect")
    .attr("x", (d) => x(String(d.data.category))!)
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .append("title")
    .text((d) => `${d.data.category}, ${d.key}: ${d[1] - d[0]}`);

  // Menambahkan sumbu jika `useAxis` true
  if (useAxis) {
    // Sumbu X
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call((g) => g.select(".domain").remove());

    // Sumbu Y
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call((g) => g.select(".domain").remove());

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

    // Menambahkan legenda secara horizontal di bawah chart
    const legendGroup = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .attr(
        "transform",
        `translate(${marginLeft}, ${height - marginBottom + 60})`
      );
    const legendItemWidth = 19;
    const legendItemHeight = 19;
    const labelOffset = 5;
    const legendSpacingX = 130;
    const legendSpacingY = 25;
    const legendMaxWidth = width - marginLeft - marginRight;
    const itemsPerRow = Math.floor(legendMaxWidth / legendSpacingX);

    subcategories.forEach((subcategory, index) => {
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
  }

  return svg.node();
};

/**
 * Fungsi Horizontal Stacked Bar Chart
 *
 * @param data - Array dari objek ChartData
 * @param width - Lebar SVG
 * @param height - Tinggi SVG
 * @param useAxis - Boolean untuk menentukan apakah sumbu akan ditampilkan
 * @returns SVGElement atau null jika data tidak valid
 */
export const createHorizontalStackedBarChart = (
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
    console.error(
      "No valid data available for the horizontal stacked bar chart"
    );
    return null;
  }

  console.log(
    "Creating horizontal stacked bar chart with valid data:",
    validData
  );

  // Definisi margin
  const marginTop = useAxis ? 20 : 0;
  const marginRight = useAxis ? 20 : 0;
  const marginBottom = useAxis ? 100 : 0;
  const marginLeft = useAxis ? 50 : 0;

  // Kategori utama dan subkategori
  const categories = Array.from(new Set(validData.map((d) => d.category)));
  const subcategories = Array.from(
    new Set(validData.map((d) => d.subcategory))
  );

  // Format data untuk stack
  const formattedData: FormattedData[] = categories.map((category) => {
    const entry: FormattedData = { category };
    validData
      .filter((d) => d.category === category)
      .forEach((d) => {
        entry[d.subcategory] = d.value;
      });
    return entry;
  });

  // Membuat stack generator
  const stackGenerator = d3
    .stack<FormattedData>()
    .keys(subcategories)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);
  const series = stackGenerator(formattedData);

  // Skala untuk sumbu X dan Y
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(series, (s) => d3.max(s, (d) => d[1]))!])
    .nice()
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleBand<string>()
    .domain(categories)
    .range([marginTop, height - marginBottom])
    .padding(0.1);

  // Skala warna dengan d3.schemeBlues
  let colorScheme: readonly string[];
  if (subcategories.length <= 3) {
    // Gunakan skema minimum 3 warna jika subcategories <= 3 (dibalik)
    colorScheme = d3.schemeBlues[3].slice().reverse();
  } else if (subcategories.length <= 9) {
    // Gunakan skema yang sesuai dengan jumlah subcategories (dibalik)
    colorScheme = d3.schemeBlues[subcategories.length].slice().reverse();
  } else {
    // Jika lebih dari 9, gunakan skema maksimum dan dibalik
    colorScheme = d3.schemeBlues[9].slice().reverse();
  }

  const color = d3
    .scaleOrdinal<string>()
    .domain(subcategories)
    .range(colorScheme)
    .unknown("#ccc");

  // Membuat elemen SVG
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Append grup untuk setiap series
  svg
    .append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    .data((d) => d.map((item) => ({ ...item, key: d.key })))
    .join("rect")
    .attr("y", (d) => y(d.data.category)!)
    .attr("x", (d) => x(d[0]))
    .attr("height", y.bandwidth())
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .append("title")
    .text((d) => `${d.data.category}, ${d.key}: ${d[1] - d[0]}`);

  // Menambahkan sumbu dan legend jika `useAxis` true
  if (useAxis) {
    // Sumbu X
    svg
      .append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(d3.axisTop(x).ticks(width / 80, "s"))
      .call((g) => g.selectAll(".domain").remove());

    // Sumbu Y
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .call((g) => g.selectAll(".domain").remove());

    // Menambahkan legenda
    const legendGroup = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .attr(
        "transform",
        `translate(${marginLeft}, ${height - marginBottom + 30})`
      );

    const legendItemWidth = 19;
    const legendItemHeight = 19;
    const labelOffset = 5;
    const legendSpacingX = 130;
    const legendSpacingY = 25;
    const legendMaxWidth = width - marginLeft - marginRight;
    const itemsPerRow = Math.floor(legendMaxWidth / legendSpacingX);

    subcategories.forEach((subcategory, index) => {
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
  }

  // Mengembalikan elemen SVG
  return svg.node();
};

/**
 * Fungsi Grouped Bar Chart
 *
 * @param data - Array dari objek ChartData
 * @param width - Lebar SVG
 * @param height - Tinggi SVG
 * @param useAxis - Boolean untuk menentukan apakah sumbu akan ditampilkan
 * @returns SVGElement atau null jika data tidak valid
 */

export const createGroupedBarChart = (
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
    console.error("No valid data available for the grouped bar chart");
    return null;
  }

  console.log("Creating grouped bar chart with valid data:", validData);

  // Definisi margin
  const marginTop = useAxis ? 20 : 0;
  const marginRight = useAxis ? 20 : 0;
  const marginBottom = useAxis ? 100 : 0;
  const marginLeft = useAxis ? 50 : 0;

  // Kategori utama dan subkategori
  const categories = Array.from(new Set(validData.map((d) => d.category)));
  const subcategories = Array.from(
    new Set(validData.map((d) => d.subcategory))
  );

  // Format data untuk grouped bar
  const formattedData: FormattedData[] = categories.map((category) => {
    const entry: FormattedData = { category };
    validData
      .filter((d) => d.category === category)
      .forEach((d) => {
        entry[d.subcategory] = d.value;
      });
    return entry;
  });

  // Skala untuk sumbu X dan Y
  const x0 = d3
    .scaleBand<string>()
    .domain(categories)
    .range([marginLeft, width - marginRight])
    .paddingInner(0.1);

  const x1 = d3
    .scaleBand<string>()
    .domain(subcategories)
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(validData, (d) => d.value)!])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Skala warna
  let colorScheme: readonly string[];
  if (subcategories.length <= 3) {
    colorScheme = d3.schemeBlues[3];
  } else if (subcategories.length <= 9) {
    colorScheme = d3.schemeBlues[subcategories.length];
  } else {
    colorScheme = d3.schemeBlues[9];
  }

  const color = d3
    .scaleOrdinal<string>()
    .domain(subcategories)
    .range(colorScheme)
    .unknown("#ccc");

  // Membuat elemen SVG
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Append grup untuk setiap kategori
  svg
    .append("g")
    .selectAll("g")
    .data(formattedData)
    .join("g")
    .attr("transform", (d) => `translate(${x0(d.category)},0)`)
    .selectAll("rect")
    .data((d) => subcategories.map((key) => ({ key, value: d[key] as number })))
    .join("rect")
    .attr("x", (d) => x1(d.key)!)
    .attr("y", (d) => y(d.value))
    .attr("width", x1.bandwidth())
    .attr("height", (d) => y(0) - y(d.value))
    .attr("fill", (d) => color(d.key))
    .append("title")
    .text((d) => `${d.key}: ${d.value}`);

  // Menambahkan sumbu dan legend jika `useAxis` true
  if (useAxis) {
    // Sumbu X
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x0))
      .call((g) => g.selectAll(".domain").remove());

    // Sumbu Y
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call((g) => g.selectAll(".domain").remove());

    // Menambahkan label sumbu X (opsional)
    svg
      .append("text")
      .attr("x", (width - marginLeft - marginRight) / 2 + marginLeft)
      .attr("y", height - marginBottom + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Category");

    // Menambahkan label sumbu Y (opsional)
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(marginTop + (height - marginBottom - marginTop) / 2))
      .attr("y", marginLeft - 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Value");

    // Menambahkan legenda secara horizontal di bawah chart dengan label di samping swatches
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
    const labelOffset = 5;
    const legendSpacingX = 130;
    const legendSpacingY = 25;
    const legendMaxWidth = width - marginLeft - marginRight;
    const itemsPerRow = Math.floor(legendMaxWidth / legendSpacingX);

    subcategories.forEach((subcategory, index) => {
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
  }

  // Mengembalikan elemen SVG
  return svg.node();
};

export const createErrorBarChart = (
  data: { category: string; value: number; error: number }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating chart with data:", data);

  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 30 : 0;

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.category))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value + d.error) as number])
    .range([height - marginBottom, marginTop]);

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

  // Menambahkan error bars
  svg
    .append("g")
    .attr("stroke", "black")
    .selectAll("line")
    .data(data)
    .join("line")
    .attr(
      "x1",
      (d: { category: string; value: number; error: number }) =>
        x(d.category)! + x.bandwidth() / 2
    )
    .attr(
      "x2",
      (d: { category: string; value: number; error: number }) =>
        x(d.category)! + x.bandwidth() / 2
    )
    .attr("y1", (d: { value: number; error: number }) => y(d.value + d.error))
    .attr("y2", (d: { value: number; error: number }) => y(d.value - d.error))
    .attr("stroke-width", 2);

  // Menambahkan titik pada setiap kategori untuk menunjukkan nilai
  svg
    .append("g")
    .attr("fill", "steelblue")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr(
      "cx",
      (d: { category: string; value: number }) =>
        x(d.category)! + x.bandwidth() / 2
    )
    .attr("cy", (d: { value: number }) => y(d.value))
    .attr("r", 5);

  // Menambahkan garis horizontal di ujung atas dan bawah error bar
  svg
    .append("g")
    .attr("stroke", "black")
    .selectAll(".error-cap-top")
    .data(data)
    .join("line")
    .attr(
      "x1",
      (d: { category: string; value: number; error: number }) =>
        x(d.category)! + x.bandwidth() / 2 - 5 // Panjang garis horizontal
    )
    .attr(
      "x2",
      (d: { category: string; value: number; error: number }) =>
        x(d.category)! + x.bandwidth() / 2 + 5
    )
    .attr("y1", (d: { value: number; error: number }) => y(d.value + d.error))
    .attr("y2", (d: { value: number; error: number }) => y(d.value + d.error))
    .attr("stroke-width", 2);

  svg
    .append("g")
    .attr("stroke", "black")
    .selectAll(".error-cap-bottom")
    .data(data)
    .join("line")
    .attr(
      "x1",
      (d: { category: string; value: number; error: number }) =>
        x(d.category)! + x.bandwidth() / 2 - 5
    )
    .attr(
      "x2",
      (d: { category: string; value: number; error: number }) =>
        x(d.category)! + x.bandwidth() / 2 + 5
    )
    .attr("y1", (d: { value: number; error: number }) => y(d.value - d.error))
    .attr("y2", (d: { value: number; error: number }) => y(d.value - d.error))
    .attr("stroke-width", 2);

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

  return svg.node();
};

export const createClusteredErrorBarChart = (
  data: {
    category: string;
    subcategory: string;
    value: number;
    error: number;
  }[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating chart with data:", data);

  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 30 : 0;

  const categories = Array.from(new Set(data.map((d) => d.category)));
  const subcategories = Array.from(new Set(data.map((d) => d.subcategory)));

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.category))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value + d.error) as number])
    .range([height - marginBottom, marginTop]);

  // Define a color scale for the subcategories
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

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

  // Menambahkan error bars dengan warna berdasarkan subkategori
  svg
    .append("g")
    .attr("stroke", "black")
    .selectAll("line")
    .data(data)
    .join("line")
    .attr(
      "x1",
      (d: {
        category: string;
        subcategory: string;
        value: number;
        error: number;
      }) => x(d.category)! + x.bandwidth() / 2
    )
    .attr(
      "x2",
      (d: {
        category: string;
        subcategory: string;
        value: number;
        error: number;
      }) => x(d.category)! + x.bandwidth() / 2
    )
    .attr("y1", (d: { value: number; error: number }) => y(d.value + d.error))
    .attr("y2", (d: { value: number; error: number }) => y(d.value - d.error))
    .attr("stroke-width", 2)
    .attr("stroke", (d: { subcategory: string }) => colorScale(d.subcategory));

  // Menambahkan titik pada setiap kategori untuk menunjukkan nilai dengan warna berdasarkan subkategori
  svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr(
      "cx",
      (d: { category: string; value: number }) =>
        x(d.category)! + x.bandwidth() / 2
    )
    .attr("cy", (d: { value: number }) => y(d.value))
    .attr("r", 5)
    .attr("fill", (d: { subcategory: string }) => colorScale(d.subcategory));

  // Menambahkan garis horizontal di ujung atas dan bawah error bar
  svg
    .append("g")
    .attr("stroke", "black")
    .selectAll(".error-cap-top")
    .data(data)
    .join("line")
    .attr(
      "x1",
      (d: { category: string; value: number; error: number }) =>
        x(d.category)! + x.bandwidth() / 2 - 5
    )
    .attr(
      "x2",
      (d: { category: string; value: number; error: number }) =>
        x(d.category)! + x.bandwidth() / 2 + 5
    )
    .attr("y1", (d: { value: number; error: number }) => y(d.value + d.error))
    .attr("y2", (d: { value: number; error: number }) => y(d.value + d.error))
    .attr("stroke-width", 2)
    .attr("stroke", (d: { subcategory: string }) => colorScale(d.subcategory));

  svg
    .append("g")
    .attr("stroke", "black")
    .selectAll(".error-cap-bottom")
    .data(data)
    .join("line")
    .attr(
      "x1",
      (d: { category: string; value: number; error: number }) =>
        x(d.category)! + x.bandwidth() / 2 - 5 // Panjang garis horizontal
    )
    .attr(
      "x2",
      (d: { category: string; value: number; error: number }) =>
        x(d.category)! + x.bandwidth() / 2 + 5
    )
    .attr("y1", (d: { value: number; error: number }) => y(d.value - d.error))
    .attr("y2", (d: { value: number; error: number }) => y(d.value - d.error))
    .attr("stroke-width", 2)
    .attr("stroke", (d: { subcategory: string }) => colorScale(d.subcategory));

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

  // Dynamic Legend
  const legendGroup = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "start")
    .attr(
      "transform",
      `translate(${marginLeft}, ${height - marginBottom + 60})`
    );

  const legendItemWidth = 19;
  const legendItemHeight = 19;
  const labelOffset = 5;
  const legendSpacingX = 100;
  const legendSpacingY = 25;
  const legendMaxWidth = width - marginLeft - marginRight;
  const itemsPerRow = Math.floor(legendMaxWidth / legendSpacingX);

  subcategories.forEach((subcategory, index) => {
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

  return svg.node();
};
