import React from 'react';

interface OpenFileModalProps {
    onClose: () => void;
}

const SaveFileModal: React.FC<OpenFileModalProps> = ({ onClose }) => {
    const handleOpen = () => {
        onClose();
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Open File</h2>
            {/* Form atau konten lainnya */}
            <button onClick={handleOpen} className="px-4 py-2 bg-blue-500 text-white rounded">
                Open
            </button>
        </div>
    );
};

export default SaveFileModal;
