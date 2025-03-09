import * as d3 from "d3";
// const d3Cloud = require("d3-cloud");

interface chartData {
  category: string;
  subcategory?: string;
  high: number;
  low: number;
  close: number;
}

export const createSimpleRangeBar = (
  data: chartData[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  // Filter data
  const filteredData = data.filter(
    (d) =>
      d.high != null &&
      d.low != null &&
      d.close != null &&
      !isNaN(d.high) &&
      !isNaN(d.low) &&
      !isNaN(d.close) &&
      d.category != " "
  );

  console.log("Creating simplerangebar with filtered data", filteredData);

  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 30 : 0;

  const x = d3
    .scaleBand()
    .domain(filteredData.map((d) => d.category))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([
      d3.min(filteredData, (d) => d.low) as number,
      d3.max(filteredData, (d) => d.high) as number,
    ])
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

  svg
    .append("g")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(filteredData)
    .join("rect")
    .attr("x", (d) => x(d.category) || 0)
    .attr("y", (d) => y(d.high))
    .attr("height", (d) => y(d.low) - y(d.high))
    .attr("width", x.bandwidth());

  // Menambahkan close value
  svg
    .append("g")
    .attr("fill", "black")
    .selectAll("circle")
    .data(filteredData)
    .join("circle")
    .attr("cx", (d) => {
      const categoryX = x(d.category);
      return categoryX !== undefined ? categoryX + x.bandwidth() / 2 : 0;
    })
    .attr("cy", (d) => y(d.close))
    .attr("r", 3);

  if (useAxis) {
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

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

// export const createClusteredRangeBar = (
//   data: {
//     category: string;
//     subcategory: string;
//     low: number;
//     high: number;
//     close: number;
//   }[], // Add subcategory to data
//   width: number,
//   height: number,
//   useAxis: boolean = true
// ) => {
//   console.log("Creating Clusteredrangebar with data", data);
//   const marginTop = useAxis ? 30 : 0;
//   const marginRight = useAxis ? 30 : 0;
//   const marginBottom = useAxis ? 30 : 0;
//   const marginLeft = useAxis ? 30 : 0;

//   // Group data by category
//   const categories = Array.from(new Set(data.map((d) => d.category)));
//   const subcategories = Array.from(new Set(data.map((d) => d.subcategory)));

//   const color = d3
//     .scaleOrdinal()
//     .domain(subcategories)
//     .range(d3.schemeCategory10);

//   // Skala X untuk kategori utama (posisi bar cluster)
//   const x = d3
//     .scaleBand()
//     .domain(categories)
//     .range([marginLeft, width - marginRight])
//     .padding(0.1);

//   // Skala X untuk sub-kategori dalam kategori utama (klaster)
//   const xSub = d3
//     .scaleBand()
//     .domain(subcategories)
//     .range([0, x.bandwidth()])
//     .padding(0.05);

//   // Skala Y berdasarkan nilai
//   const y = d3
//     .scaleLinear()
//     .domain([
//       d3.min(data, (d) => d.low) as number,
//       d3.max(data, (d) => d.high) as number,
//     ])
//     .range([height - marginBottom, marginTop]);

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

//   // Grouping data by category and subcategory
//   const groupedData = d3.group(data, (d) => d.category);

//   // Create bars for each category and subcategory
//   const categoryGroup = svg
//     .append("g")
//     .selectAll("g")
//     .data(Array.from(groupedData))
//     .join("g")
//     .attr("transform", ([category]) => `translate(${x(category)}, 0)`);

//   categoryGroup
//     .selectAll("rect")
//     .data(([category, values]) => values)
//     .join("rect")
//     .attr("x", (d) => xSub(d.subcategory) ?? 0) // Position bars inside clusters
//     .attr("y", (d) => y(d.high))
//     .attr("height", (d) => y(d.low) - y(d.high))
//     .attr("width", xSub.bandwidth())
//     .attr("fill", (d) => color(d.subcategory) as string);

//   // Add the close value as a dot for each subcategory
//   svg
//     .append("g")
//     .attr("fill", "black")
//     .selectAll("circle")
//     .data(data)
//     .join("circle")
//     .attr("cx", (d) => {
//       const categoryX = x(d.category);
//       const subcategoryX = xSub(d.subcategory);

//       // Check if both categoryX and subcategoryX are defined, otherwise default to 0
//       return categoryX !== undefined && subcategoryX !== undefined
//         ? categoryX + subcategoryX + xSub.bandwidth() / 2
//         : 0; // Fallback value if either is undefined
//     })

//     .attr("cy", (d) => y(d.close))
//     .attr("r", 3);

//   // Add axes if needed
//   if (useAxis) {
//     svg
//       .append("g")
//       .attr("transform", `translate(0, ${height - marginBottom})`)
//       .call(d3.axisBottom(x).tickSizeOuter(0));

//     svg
//       .append("g")
//       .attr("transform", `translate(${marginLeft}, 0)`)
//       .call(d3.axisLeft(y).tickFormat((y) => (+y * 1).toFixed(0)))
//       .call((g: any) => g.select(".domain").remove())
//       .call((g: any) =>
//         g
//           .append("text")
//           .attr("x", -marginLeft)
//           .attr("y", 10)
//           .attr("fill", "currentColor")
//           .attr("text-anchor", "start")
//           .text("↑ Value")
//       );
//     // Tambahkan legenda
//     const legend = svg
//       .append("g")
//       .attr("font-family", "sans-serif")
//       .attr("font-size", 10)
//       .attr("text-anchor", "start")
//       .selectAll("g")
//       .data(subcategories)
//       .join("g")
//       .attr("transform", (d, i) => `translate(${width - 100},${i * 20})`);

//     const legendItemWidth = 19;
//     const legendItemHeight = 19;
//     const labelOffset = 5; // Offset to move text a little further right

//     legend
//       .append("rect")
//       .attr("width", legendItemWidth)
//       .attr("height", legendItemHeight)
//       .attr("fill", (d) => color(d) as string);

//     legend
//       .append("text")
//       .attr("x", legendItemWidth + labelOffset) // Move text to the right of the rectangle
//       .attr("y", legendItemHeight / 2)
//       .attr("dy", "0.35em") // Vertically center the text
//       .text((d) => d);
//   }

//   return svg.node();
// };

export const createClusteredRangeBar = (
  data: {
    category: string;
    subcategory: string;
    low: number;
    high: number;
    close: number;
  }[], // Add subcategory to data
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  // Filter out data where high, low, or close are null, undefined, empty string, or NaN
  const filteredData = data.filter(
    (d) =>
      d.high != null &&
      d.low != null &&
      d.close != null && // Check for null or undefined
      !isNaN(d.high) &&
      !isNaN(d.low) &&
      !isNaN(d.close) // Check for NaN
  );

  console.log("Creating Clusteredrangebar with filtered data", filteredData);

  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 30 : 0;

  // Group data by category
  const categories = Array.from(new Set(filteredData.map((d) => d.category)));
  const subcategories = Array.from(
    new Set(filteredData.map((d) => d.subcategory))
  );

  const color = d3
    .scaleOrdinal()
    .domain(subcategories)
    .range(d3.schemeCategory10);

  // Skala X untuk kategori utama
  const x = d3
    .scaleBand()
    .domain(categories)
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  // Skala X untuk sub-kategori dalam kategori utama
  const xSub = d3
    .scaleBand()
    .domain(subcategories)
    .range([0, x.bandwidth()])
    .padding(0.05);

  // Skala Y berdasarkan nilai
  const y = d3
    .scaleLinear()
    .domain([
      d3.min(filteredData, (d) => d.low) as number,
      d3.max(filteredData, (d) => d.high) as number,
    ])
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

  // Grouping data by category and subcategory
  const groupedData = d3.group(filteredData, (d) => d.category);

  // Create bars untuk setiap category dan subcategory
  const categoryGroup = svg
    .append("g")
    .selectAll("g")
    .data(Array.from(groupedData))
    .join("g")
    .attr("transform", ([category]) => `translate(${x(category)}, 0)`);

  categoryGroup
    .selectAll("rect")
    .data(([category, values]) => values)
    .join("rect")
    .attr("x", (d) => xSub(d.subcategory) ?? 0)
    .attr("y", (d) => y(d.high))
    .attr("height", (d) => y(d.low) - y(d.high))
    .attr("width", xSub.bandwidth())
    .attr("fill", (d) => color(d.subcategory) as string);

  // Add close value
  svg
    .append("g")
    .attr("fill", "black")
    .selectAll("circle")
    .data(filteredData)
    .join("circle")
    .attr("cx", (d) => {
      const categoryX = x(d.category);
      const subcategoryX = xSub(d.subcategory);

      return categoryX !== undefined && subcategoryX !== undefined
        ? categoryX + subcategoryX + xSub.bandwidth() / 2
        : 0;
    })
    .attr("cy", (d) => y(d.close))
    .attr("r", 3);

  // Menambahkan axis
  if (useAxis) {
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

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
    // Tambahkan legenda
    const legend = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(subcategories)
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

  return svg.node();
};

export const createHighLowCloseChart = (
  data: chartData[],
  width: number,
  height: number,
  useAxis: boolean = true
) => {
  console.log("Creating highlowclose with data", data);
  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 30 : 0;
  const marginLeft = useAxis ? 30 : 0;

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.category))
    .range([marginLeft, width - marginRight])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d.low) as number,
      d3.max(data, (d) => d.high) as number,
    ])
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

  // Menambahkan garis vertikal untuk high-low range
  svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "black")
    .selectAll("line")
    .data(data)
    .join("line")
    .attr("x1", (d) => {
      const categoryX = x(d.category);
      return categoryX !== undefined ? categoryX + x.bandwidth() / 2 : 0;
    })
    .attr("x2", (d) => {
      const categoryX = x(d.category);
      return categoryX !== undefined ? categoryX + x.bandwidth() / 2 : 0;
    })
    .attr("y1", (d) => y(d.high))
    .attr("y2", (d) => y(d.low))
    .attr("stroke-width", 2);

  // Menambahkan garis horizontal untuk high-low range atas
  svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "black")
    .selectAll("line")
    .data(data)
    .join("line")
    .attr("x1", (d) => {
      const categoryX = x(d.category);
      const range = y(d.high) - y(d.low); // Calculate dynamic range
      return categoryX !== undefined
        ? categoryX + x.bandwidth() / 2 - range / 10
        : 0; // Centering based on range
    })
    .attr("x2", (d) => {
      const categoryX = x(d.category);
      const range = y(d.high) - y(d.low); // Calculate dynamic range
      return categoryX !== undefined
        ? categoryX + x.bandwidth() / 2 + range / 10
        : 0; // Centering based on range
    })
    .attr("y1", (d) => y(d.high))
    .attr("y2", (d) => y(d.high))
    .attr("stroke-width", 2);

  // Menambahkan garis horizontal untuk high-low range bawah
  svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "black")
    .selectAll("line")
    .data(data)
    .join("line")
    .attr("x1", (d) => {
      const categoryX = x(d.category);
      const range = y(d.high) - y(d.low); // Calculate dynamic range
      return categoryX !== undefined
        ? categoryX + x.bandwidth() / 2 - range / 10
        : 0; // Centering based on range
    })
    .attr("x2", (d) => {
      const categoryX = x(d.category);
      const range = y(d.high) - y(d.low); // Calculate dynamic range
      return categoryX !== undefined
        ? categoryX + x.bandwidth() / 2 + range / 10
        : 0; // Centering based on range
    })
    .attr("y1", (d) => y(d.low))
    .attr("y2", (d) => y(d.low))
    .attr("stroke-width", 2);

  // Menambahkan titik untuk nilai close, tepat di atas kategori
  svg
    .append("g")
    .attr("fill", "black")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => {
      const categoryX = x(d.category);
      return categoryX !== undefined ? categoryX + x.bandwidth() / 2 : 0; // Check if categoryX is defined
    })
    .attr("cy", (d) => y(d.close))
    .attr("r", 4); // Ukuran titik

  // Menambahkan label pada sumbu X (kategori)
  if (useAxis) {
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

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

// export const createDifferenceArea = (
//   data: { category: string; value0: number; value1: number }[],
//   width: number,
//   height: number
// ) => {
//   const marginTop = 20;
//   const marginRight = 20;
//   const marginBottom = 30;
//   const marginLeft = 30;

//   const x = d3
//     .scaleBand()
//     .domain(data.map((d) => d.category))
//     .range([marginLeft, width - marginRight])
//     .padding(0.1);

//   const y = d3
//     .scaleLinear()
//     .domain([
//       d3.min(data, (d) => Math.min(d.value0, d.value1)) ?? 0,
//       d3.max(data, (d) => Math.max(d.value0, d.value1)) ?? 100,
//     ])
//     .nice()
//     .range([height - marginBottom, marginTop]);

//   const colors = { above: "#1F77B4", below: "#FF7F0E" }; // Biru dan Oranye

//   const svg = d3
//     .create("svg")
//     .attr("viewBox", `0 0 ${width} ${height}`)
//     .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
//     .datum(data);

//   // Sumbu X dan Y
//   svg
//     .append("g")
//     .attr("transform", `translate(0,${height - marginBottom})`)
//     .call(d3.axisBottom(x))
//     .call((g) => g.select(".domain").remove());

//   svg
//     .append("g")
//     .attr("transform", `translate(${marginLeft},0)`)
//     .call(d3.axisLeft(y))
//     .call((g) => g.select(".domain").remove())
//     .call((g) =>
//       g
//         .selectAll(".tick line")
//         .clone()
//         .attr("x2", width - marginLeft - marginRight)
//         .attr("stroke-opacity", 0.1)
//     );

//   // Area di atas dan bawah dengan clipPath yang benar
//   const areaAbove = d3
//     .area<{ category: string; value0: number; value1: number }>()
//     .curve(d3.curveStep)
//     .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
//     .y0((d) => y(d.value1))
//     .y1((d) => y(d.value0));

//   const areaBelow = d3
//     .area<{ category: string; value0: number; value1: number }>()
//     .curve(d3.curveStep)
//     .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
//     .y0((d) => y(d.value0))
//     .y1((d) => y(d.value1));

//   // Clip Path untuk area di atas
//   svg
//     .append("clipPath")
//     .attr("id", "above")
//     .append("path")
//     .attr("d", areaAbove(data));

//   // Clip Path untuk area di bawah
//   svg
//     .append("clipPath")
//     .attr("id", "below")
//     .append("path")
//     .attr("d", areaBelow(data));

//   // Area biru (di atas garis tengah)
//   svg
//     .append("path")
//     .attr("clip-path", "url(#above)")
//     .attr("fill", colors.above)
//     .attr("d", areaAbove(data));

//   // Area oranye (di bawah garis tengah)
//   svg
//     .append("path")
//     .attr("clip-path", "url(#below)")
//     .attr("fill", colors.below)
//     .attr("d", areaBelow(data));

//   // Garis tengah antara value0 dan value1
//   svg
//     .append("path")
//     .attr("fill", "none")
//     .attr("stroke", "black")
//     .attr("stroke-width", 1.5)
//     .attr("stroke-linejoin", "round")
//     .attr("stroke-linecap", "round")
//     .attr(
//       "d",
//       d3
//         .line<{ category: string; value0: number; value1: number }>()
//         .curve(d3.curveStep)
//         .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
//         .y((d) => y(d.value0))(data)
//     );

//   return svg.node();
// };

// export const createDifferenceArea = (
//   data: { category: string; value0: number; value1: number }[],
//   width: number,
//   height: number
// ) => {
//   const marginTop = 20;
//   const marginRight = 20;
//   const marginBottom = 30;
//   const marginLeft = 30;

//   // Skala X dan Y
//   const x = d3
//     .scaleBand()
//     .domain(data.map((d) => d.category))
//     .range([marginLeft, width - marginRight])
//     .padding(0.1);

//   const y = d3
//     .scaleLinear()
//     .domain([
//       d3.min(data, (d) => Math.min(d.value0, d.value1)) ?? 0,
//       d3.max(data, (d) => Math.max(d.value0, d.value1)) ?? 100,
//     ])
//     .nice()
//     .range([height - marginBottom, marginTop]);

//   // Warna area
//   const colors = { above: "#1F77B4", below: "#FF7F0E" };

//   // SVG Container
//   const svg = d3
//     .create("svg")
//     .attr("viewBox", `0 0 ${width} ${height}`)
//     .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
//     .datum(data);

//   // Sumbu X
//   svg
//     .append("g")
//     .attr("transform", `translate(0,${height - marginBottom})`)
//     .call(d3.axisBottom(x))
//     .call((g) => g.select(".domain").remove());

//   // Sumbu Y
//   svg
//     .append("g")
//     .attr("transform", `translate(${marginLeft},0)`)
//     .call(d3.axisLeft(y))
//     .call((g) => g.select(".domain").remove())
//     .call((g) =>
//       g
//         .selectAll(".tick line")
//         .clone()
//         .attr("x2", width - marginLeft - marginRight)
//         .attr("stroke-opacity", 0.1)
//     );

//   // Area di atas garis tengah (value1 > value0)
//   const areaAbove = d3
//     .area<{ category: string; value0: number; value1: number }>()
//     .curve(d3.curveStep)
//     .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
//     .y0((d) => y(d.value0)) // Mulai dari value0
//     .y1((d) => y(d.value1)); // Menuju value1 jika lebih besar

//   // Area di bawah garis tengah (value0 > value1)
//   const areaBelow = d3
//     .area<{ category: string; value0: number; value1: number }>()
//     .curve(d3.curveStep)
//     .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
//     .y0((d) => y(d.value1)) // Mulai dari value1
//     .y1((d) => y(d.value0)); // Menuju value0 jika lebih besar

//   // Filter data agar area tidak tumpang tindih
//   const dataAbove = data.map((d) =>
//     d.value1 > d.value0
//       ? { ...d, value0: d.value0, value1: d.value1 }
//       : { ...d, value0: d.value1, value1: d.value1 }
//   );

//   const dataBelow = data.map((d) =>
//     d.value0 > d.value1
//       ? { ...d, value0: d.value0, value1: d.value1 }
//       : { ...d, value0: d.value0, value1: d.value0 }
//   );

//   // Buat grup untuk area warna
//   const areaGroup = svg.append("g");

//   // Area biru (hanya untuk value1 > value0)
//   areaGroup
//     .append("path")
//     .attr("fill", colors.above)
//     .attr("fill-opacity", "0.7")
//     .attr("d", areaAbove(dataAbove));

//   // Area oranye (hanya untuk value0 > value1)
//   areaGroup
//     .append("path")
//     .attr("fill", colors.below)
//     .attr("fill-opacity", "0.7")
//     .attr("d", areaBelow(dataBelow));

//   // Garis tengah antara value0 dan value1
//   svg
//     .append("path")
//     .attr("fill", "none")
//     .attr("stroke", "black")
//     .attr("stroke-width", 1.5)
//     .attr("stroke-linejoin", "round")
//     .attr("stroke-linecap", "round")
//     .attr(
//       "d",
//       d3
//         .line<{ category: string; value0: number; value1: number }>()
//         .curve(d3.curveStep)
//         .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
//         .y((d) => y(d.value0))(data)
//     );

//   return svg.node();
// };

//ASLI TANPA FILTER
// export const createDifferenceArea = (
//   data: { category: string; value0: number; value1: number }[],
//   width: number,
//   height: number,
//   useAxis: boolean = true // Tambahkan parameter useAxis dengan default true
// ) => {
//   console.log("Creating differencearea with data", data);
//   // Menentukan margin hanya jika axis digunakan
//   const marginTop = useAxis ? 30 : 0;
//   const marginRight = useAxis ? 30 : 0;
//   const marginBottom = useAxis ? 50 : 0;
//   const marginLeft = useAxis ? 30 : 0;

//   // Skala X dan Y
//   const x = d3
//     .scaleBand()
//     .domain(data.map((d) => d.category))
//     .range([marginLeft, width - marginRight])
//     .padding(0.1);

//   const y = d3
//     .scaleLinear()
//     .domain([
//       d3.min(data, (d) => Math.min(d.value0, d.value1)) ?? 0,
//       d3.max(data, (d) => Math.max(d.value0, d.value1)) ?? 100,
//     ])
//     .nice()
//     .range([height - marginBottom, marginTop]);

//   // Warna area
//   const colors = { above: "#1F77B4", below: "#FF7F0E" };

//   // SVG Container
//   const svg = d3
//     .create("svg")
//     .attr("viewBox", `0 0 ${width} ${height}`)
//     .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
//     .datum(data);

//   // Tampilkan sumbu jika useAxis = true
//   if (useAxis) {
//     // Sumbu X
//     svg
//       .append("g")
//       .attr("transform", `translate(0,${height - marginBottom})`)
//       .call(d3.axisBottom(x))
//       .call((g) => g.select(".domain").remove());

//     // Sumbu Y
//     svg
//       .append("g")
//       .attr("transform", `translate(${marginLeft},0)`)
//       .call(d3.axisLeft(y))
//       .call((g) => g.select(".domain").remove())
//       .call((g) =>
//         g
//           .selectAll(".tick line")
//           .clone()
//           .attr("x2", width - marginLeft - marginRight)
//           .attr("stroke-opacity", 0.1)
//       );
//   }

//   // Area di atas garis tengah (value1 > value0)
//   const areaAbove = d3
//     .area<{ category: string; value0: number; value1: number }>()
//     .curve(d3.curveStep)
//     .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
//     .y0((d) => y(d.value0))
//     .y1((d) => y(d.value1));

//   // Area di bawah garis tengah (value0 > value1)
//   const areaBelow = d3
//     .area<{ category: string; value0: number; value1: number }>()
//     .curve(d3.curveStep)
//     .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
//     .y0((d) => y(d.value1))
//     .y1((d) => y(d.value0));

//   // Filter data agar area tidak tumpang tindih
//   const dataAbove = data.map((d) =>
//     d.value1 > d.value0
//       ? { ...d, value0: d.value0, value1: d.value1 }
//       : { ...d, value0: d.value1, value1: d.value1 }
//   );

//   const dataBelow = data.map((d) =>
//     d.value0 > d.value1
//       ? { ...d, value0: d.value0, value1: d.value1 }
//       : { ...d, value0: d.value0, value1: d.value0 }
//   );

//   // Buat grup untuk area warna
//   const areaGroup = svg.append("g");

//   // Area biru (hanya untuk value1 > value0)
//   areaGroup
//     .append("path")
//     .attr("fill", colors.above)
//     .attr("fill-opacity", "0.7")
//     .attr("d", areaAbove(dataAbove));

//   // Area oranye (hanya untuk value0 > value1)
//   areaGroup
//     .append("path")
//     .attr("fill", colors.below)
//     .attr("fill-opacity", "0.7")
//     .attr("d", areaBelow(dataBelow));

//   // Garis tengah antara value0 dan value1
//   svg
//     .append("path")
//     .attr("fill", "none")
//     .attr("stroke", "black")
//     .attr("stroke-width", 1.5)
//     .attr("stroke-linejoin", "round")
//     .attr("stroke-linecap", "round")
//     .attr(
//       "d",
//       d3
//         .line<{ category: string; value0: number; value1: number }>()
//         .curve(d3.curveStep)
//         .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
//         .y((d) => y(d.value0))(data)
//     );

//   return svg.node();
// };

export const createDifferenceArea = (
  data: { category: string; value0: number; value1: number }[],
  width: number,
  height: number,
  useAxis: boolean = true // Tambahkan parameter useAxis dengan default true
) => {
  console.log("Creating differencearea with data", data);

  // Filter out invalid data (NaN, null, undefined) for value0 and value1
  const filteredData = data.filter(
    (d) =>
      d.value0 != null &&
      d.value1 != null &&
      !isNaN(d.value0) &&
      !isNaN(d.value1)
  );

  console.log("FIltered Data", filteredData);

  // Menentukan margin hanya jika axis digunakan
  const marginTop = useAxis ? 30 : 0;
  const marginRight = useAxis ? 30 : 0;
  const marginBottom = useAxis ? 50 : 0;
  const marginLeft = useAxis ? 30 : 0;

  // Skala X dan Y
  const x = d3
    .scaleBand()
    .domain(filteredData.map((d) => d.category))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([
      d3.min(filteredData, (d) => Math.min(d.value0, d.value1)) ?? 0,
      d3.max(filteredData, (d) => Math.max(d.value0, d.value1)) ?? 100,
    ])
    .nice()
    .range([height - marginBottom, marginTop]);

  // Warna area
  const colors = { above: "#1F77B4", below: "#FF7F0E" };

  // SVG Container
  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
    .datum(filteredData);

  // Tampilkan sumbu jika useAxis = true
  if (useAxis) {
    // Sumbu X
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x))
      .call((g) => g.select(".domain").remove());

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
      );
  }

  // Area di atas garis tengah (value1 > value0)
  const areaAbove = d3
    .area<{ category: string; value0: number; value1: number }>()
    .curve(d3.curveStep)
    .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
    .y0((d) => y(d.value0))
    .y1((d) => y(d.value1));

  // Area di bawah garis tengah (value0 > value1)
  const areaBelow = d3
    .area<{ category: string; value0: number; value1: number }>()
    .curve(d3.curveStep)
    .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
    .y0((d) => y(d.value1))
    .y1((d) => y(d.value0));

  // Filter data agar area tidak tumpang tindih
  const dataAbove = filteredData.map((d) =>
    d.value1 > d.value0
      ? { ...d, value0: d.value0, value1: d.value1 }
      : { ...d, value0: d.value1, value1: d.value1 }
  );

  const dataBelow = filteredData.map((d) =>
    d.value0 > d.value1
      ? { ...d, value0: d.value0, value1: d.value1 }
      : { ...d, value0: d.value0, value1: d.value0 }
  );

  // Buat grup untuk area warna
  const areaGroup = svg.append("g");

  // Area biru (hanya untuk value1 > value0)
  areaGroup
    .append("path")
    .attr("fill", colors.above)
    .attr("fill-opacity", "0.7")
    .attr("d", areaAbove(dataAbove));

  // Area oranye (hanya untuk value0 > value1)
  areaGroup
    .append("path")
    .attr("fill", colors.below)
    .attr("fill-opacity", "0.7")
    .attr("d", areaBelow(dataBelow));

  // Garis tengah antara value0 dan value1
  svg
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr(
      "d",
      d3
        .line<{ category: string; value0: number; value1: number }>()
        .curve(d3.curveStep)
        .x((d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
        .y((d) => y(d.value0))(filteredData)
    );

  return svg.node();
};

// export const createWordCloud = (
//   words: string[], // Data berupa array kata
//   width: number, // Lebar SVG
//   height: number, // Tinggi SVG
//   options: {
//     size?: (group: string[]) => number; // Fungsi untuk menentukan ukuran kata
//     word?: (d: string) => string; // Fungsi untuk menentukan teks
//     marginTop?: number; // Margin atas
//     marginRight?: number; // Margin kanan
//     marginBottom?: number; // Margin bawah
//     marginLeft?: number; // Margin kiri
//     maxWords?: number; // Jumlah kata maksimal yang ditampilkan
//     fontFamily?: string; // Keluarga font
//     fontScale?: number; // Skala ukuran font
//     fill?: string | ((d: string) => string); // Warna font
//     padding?: number; // Padding antar kata
//     rotate?: number | ((d: string) => number); // Rotasi kata
//     invalidation?: Promise<any>; // Saat promise ini selesai, hentikan simulasi
//   } = {}
// ) => {
//   const {
//     size = (group) => group.length, // default size berdasarkan jumlah kata
//     word = (d) => d, // default kata langsung dari input
//     marginTop = 10, // default margin top 10px
//     marginRight = 10, // default margin right 10px
//     marginBottom = 10, // default margin bottom 10px
//     marginLeft = 10, // default margin left 10px
//     maxWords = 1000, // maksimal kata yang ditampilkan 100
//     fontFamily = "sans-serif", // font default sans-serif
//     fontScale = 8, // ukuran font default 20
//     fill = "black", // warna font default hitam
//     padding = 5, // padding antar kata default 5px
//     rotate = 0, // rotasi default 0
//     invalidation,
//   } = options;

//   // Menghitung frekuensi kata dan menyiapkan data untuk word cloud
//   const data = d3
//     .rollups(words, size, (w) => w)
//     .sort(([, a], [, b]) => d3.descending(a, b))
//     .slice(0, maxWords)
//     .map(([key, size]) => ({ text: word(key), size }));

//   // Membuat SVG dengan ukuran dan styling sesuai parameter
//   const svg = d3
//     .create("svg")
//     .attr("viewBox", [0, 0, width, height])
//     .attr("width", width)
//     .attr("font-family", fontFamily)
//     .attr("text-anchor", "middle")
//     .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

//   const g = svg
//     .append("g")
//     .attr("transform", `translate(${marginLeft},${marginTop})`);

//   // Membuat cloud menggunakan d3Cloud
//   const cloud = d3Cloud() // Now calling d3Cloud correctly
//     .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
//     .words(data)
//     .padding(padding)
//     .rotate(rotate)
//     .font(fontFamily)
//     .fontSize((d: { size: number }) => Math.sqrt(d.size) * fontScale) // Memperbaiki tipe d
//     .on(
//       "word",
//       ({
//         size,
//         x,
//         y,
//         rotate,
//         text,
//       }: {
//         size: number;
//         x: number;
//         y: number;
//         rotate: number;
//         text: string;
//       }) => {
//         // Tipe eksplisit untuk parameter
//         g.append("text")
//           .datum(text)
//           .attr("font-size", size)
//           .attr("fill", typeof fill === "function" ? fill(text) : fill) // Handle fill properly
//           .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
//           .text(text);
//       }
//     );

//   cloud.start();

//   // Handle invalidation
//   if (invalidation) {
//     invalidation.then(() => cloud.stop());
//   }

//   return svg.node();
// };
