"use client"; // This marks the component as a Client Component

import { useEffect, useState } from 'react';

export default function Home() {
    const [wasmResult, setWasmResult] = useState({ slope: null, intercept: null });
    const [jsResult, setJsResult] = useState({ slope: null, intercept: null });
    const [wasmTime, setWasmTime] = useState(0);
    const [jsTime, setJsTime] = useState(0);

    // JavaScript Linear Regression Function
    const linearRegressionJS = (x_vals, y_vals) => {
        const n = x_vals.length;
        if (n !== y_vals.length || n === 0) {
            throw new Error("Vectors must be of the same length and not empty!");
        }

        const sum_x = x_vals.reduce((a, b) => a + b, 0);
        const sum_y = y_vals.reduce((a, b) => a + b, 0);
        const sum_xy = x_vals.reduce((acc, x, i) => acc + x * y_vals[i], 0);
        const sum_x_squared = x_vals.reduce((acc, x) => acc + x * x, 0);

        const mean_x = sum_x / n;
        const mean_y = sum_y / n;

        const numerator = sum_xy - n * mean_x * mean_y;
        const denominator = sum_x_squared - n * mean_x * mean_x;
        const m = numerator / denominator;

        const b = mean_y - m * mean_x;

        return { slope: m, intercept: b };
    };

    useEffect(() => {
        // Generate 5,000 random data points
        const generateRandomData = (size) => {
            const x_vals = Array.from({ length: size }, () => Math.random() * 100);
            const y_vals = x_vals.map((x) => 2 * x + (Math.random() * 50 - 25)); // y = 2x + some noise
            return { x_vals, y_vals };
        };

        const { x_vals, y_vals } = generateRandomData(5000);

        // JavaScript Linear Regression
        console.time('JS Linear Regression');
        const jsRes = linearRegressionJS(x_vals, y_vals);
        console.timeEnd('JS Linear Regression');
        setJsResult(jsRes);

        // Measure time for JS version
        const jsStartTime = performance.now();
        linearRegressionJS(x_vals, y_vals);
        const jsEndTime = performance.now();
        setJsTime(jsEndTime - jsStartTime);

        // WebAssembly Linear Regression
        const initWasm = async () => {
            const wasm = await import('@/module/linear-regression/pkg/linear_regression');
            await wasm.default();

            console.time('Wasm Linear Regression');
            const wasmRes = wasm.linear_regression(x_vals, y_vals);
            console.timeEnd('Wasm Linear Regression');
            setWasmResult({ slope: wasmRes[0], intercept: wasmRes[1] });

            // Measure time for Wasm version
            const wasmStartTime = performance.now();
            wasm.linear_regression(x_vals, y_vals);
            const wasmEndTime = performance.now();
            setWasmTime(wasmEndTime - wasmStartTime);
        };

        initWasm();
    }, []);

    return (
        <div>
            <h1>Linear Regression: JS vs Wasm</h1>

            <h2>JavaScript Implementation</h2>
            <p>Slope (m): {jsResult.slope}</p>
            <p>Intercept (b): {jsResult.intercept}</p>
            <p>Execution Time: {jsTime.toFixed(10)} ms</p>

            <h2>WebAssembly Implementation</h2>
            <p>Slope (m): {wasmResult.slope}</p>
            <p>Intercept (b): {wasmResult.intercept}</p>
            <p>Execution Time: {wasmTime.toFixed(10)} ms</p>
        </div>
    );
}