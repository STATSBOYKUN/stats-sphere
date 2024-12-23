/** @type {import('next').NextConfig} */
const nextConfig = {}
const path = require("path");

module.exports = {
        nextConfig, 
        webpack: (config) => {
        config.resolve.alias["wasm"] = path.resolve(__dirname, "src/wasm/pkg");
        return config;
    },
};
