function linearRegressionJS(x_vals, y_vals) {
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
}
