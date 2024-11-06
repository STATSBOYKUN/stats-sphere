// components/Graph/BarChart.tsx

"use client";

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface BarChartProps {
    data: { category: string; value: number }[];
    width?: number;
    height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, width = 500, height = 300 }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        // Clear previous renders
        d3.select(svgRef.current).selectAll("*").remove();

        // Set up SVG
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        // Set up margins
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create scales
        const xScale = d3
            .scaleBand()
            .domain(data.map((d) => d.category))
            .range([0, innerWidth])
            .padding(0.1);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.value)!])
            .nice()
            .range([innerHeight, 0]);

        // Create container
        const container = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Draw bars
        container
            .selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScale(d.category)!)
            .attr("y", (d) => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => innerHeight - yScale(d.value))
            .attr("fill", "#4f46e5"); // Indigo-600

        // Add X axis
        container
            .append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale));

        // Add Y axis
        container.append("g").call(d3.axisLeft(yScale));
    }, [data, width, height]);

    return <svg ref={svgRef}></svg>;
};

export default BarChart;
