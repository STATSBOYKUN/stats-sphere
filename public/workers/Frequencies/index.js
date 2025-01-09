/* Meng-handle pesan dari main thread lalu import helper */
self.importScripts('./descriptive.js', './frequency.js');

self.onmessage = (e) => {
    const { action, data, variables } = e.data;
    let result = { success: true, error: null, descriptive: null, frequencies: null };

    try {
        // Contoh jika Anda ingin menghitung descriptive statistics juga:
        if (action === 'FREQUENCIES' || action === 'DESCRIPTIVE_ONLY') {
            const desc = formatDescriptiveStats(data, variables);
            result.descriptive = JSON.stringify(desc);
        }

        // B) Frekuensi
        if (action === 'FREQUENCIES') {
            const freqs = variables.map((v, i) => {
                const freq = computeFreq(data, v);
                // Perbaikan: sertakan v.type sebagai parameter ketiga
                return formatFrequencyTable(v.name, freq, v.type, i + 1);
            });
            result.frequencies = freqs.map((f) => f.output_data);
        }
        // C) (contoh) Regresi, dsb., tinggal ditambahkan sesuai kebutuhan

        self.postMessage(result);
    } catch (err) {
        self.postMessage({ success: false, error: err.message });
    }
};

self.addEventListener('error', (e) => {
    console.error('Worker error:', e.message);
});
