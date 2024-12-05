// components/ResultOutput.tsx
import React from 'react';

const ResultOutput: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto p-4 border-2">
            {/* Konten dummy */}
            <h1>Result Output</h1>
            <p>Ini adalah komponen ResultOutput yang mengambil area penuh.</p>

            {/* Konten yang menyebabkan overflow */}
            <div style={{ height: '2000px' }}>
                <p>Konten tambahan yang sangat panjang sehingga menyebabkan overflow...</p>
            </div>
        </div>
    );
};

export default ResultOutput;
