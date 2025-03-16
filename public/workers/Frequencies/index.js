/* Improved worker that handles different actions */
self.importScripts('./descriptive.js', './frequency.js');

self.onmessage = (e) => {
    const { action, variableData } = e.data;
    let result = { success: true, error: null };

    try {
        // Convert variableData to formats expected by calculation functions
        const data = extractData(variableData);
        const variables = variableData.map(vd => ({
            name: vd.variable.name,
            type: vd.variable.type
        }));

        // Handle different actions
        switch (action) {
            case 'DESCRIPTIVE_STATS':
                const desc = formatDescriptiveStats(data, variables);
                result.descriptive = JSON.stringify(desc);
                break;

            case 'FREQUENCIES':
                const freqs = variables.map((v) => {
                    const freq = computeFreq(data, v);
                    return formatFrequencyTable(v.name, freq, v.type);
                });
                result.frequencies = freqs.map(f => f.output_data);
                break;

            case 'FULL_ANALYSIS':
                // Do both descriptive and frequency
                const descStats = formatDescriptiveStats(data, variables);
                result.descriptive = JSON.stringify(descStats);

                const freqTables = variables.map((v) => {
                    const freq = computeFreq(data, v);
                    return formatFrequencyTable(v.name, freq, v.type);
                });
                result.frequencies = freqTables.map(f => f.output_data);
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        self.postMessage(result);
    } catch (err) {
        self.postMessage({
            success: false,
            error: err.message || "An error occurred in the worker"
        });
    }
};

/**
 * Helper function to convert VariableData array to the row-based format
 * expected by calculation functions
 *
 * @param {Array} variableData - Array of {variable, data} objects
 * @returns {Array} Array of row objects where each key is a variable name
 */
function extractData(variableData) {
    if (!variableData || !variableData.length) return [];

    // Get the length of the first variable's data to determine dataset size
    const rowCount = variableData[0].data.length;
    const result = [];

    // Create row objects with all variables
    for (let i = 0; i < rowCount; i++) {
        const row = {};
        variableData.forEach(vd => {
            // Handle potentially missing or empty values
            const value = i < vd.data.length ? vd.data[i] : "";
            // Use the variable name as the key
            row[vd.variable.name] = value;
        });
        result.push(row);
    }

    return result;
}

self.addEventListener('error', (e) => {
    console.error('Worker error:', e.message);
    self.postMessage({
        success: false,
        error: e.message || "An error occurred in the worker"
    });
});