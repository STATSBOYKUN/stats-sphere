import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-blue-600 p-2 shadow-inner border-t border-gray-300">
            <ul className="flex justify-start space-x-4 text-xs font-medium text-white">
                <li className="cursor-pointer hover:bg-blue-500 px-2 py-1 rounded transition duration-200 ease-in-out">
                    Data View
                </li>
                <li className="cursor-pointer hover:bg-blue-500 px-2 py-1 rounded transition duration-200 ease-in-out">
                    Variable View
                </li>
            </ul>
        </footer>
    );
};

export default Footer;
