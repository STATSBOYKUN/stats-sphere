import React from 'react';

const Navbar: React.FC = () => {
    return (
        <nav className="bg-blue-600 p-2 shadow-md">
            <ul className="flex space-x-4 text-xs lg:text-sm font-medium text-white">
                {['File', 'Edit', 'View', 'Data', 'Transform', 'Analyze', 'Graphs', 'Utilities', 'Extensions', 'Window', 'Help'].map((item) => (
                    <li key={item} className="cursor-pointer hover:bg-blue-500 px-2 py-1 rounded transition duration-200 ease-in-out">
                        {item}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const Toolbar: React.FC = () => {
    const icons = [
        { name: 'File', icon: '📂' },
        { name: 'Save', icon: '💾' },
        { name: 'Print', icon: '🖨️' },
        { name: 'Undo', icon: '↩️' },
        { name: 'Redo', icon: '↪️' },
        { name: 'View Data', icon: '📊' },
        { name: 'Graphs', icon: '📈' },
        { name: 'Utilities', icon: '⚙️' },
        { name: 'Extensions', icon: '🔌' },
        { name: 'Search', icon: '🔍' },
    ];

    return (
        <div className="bg-gray-100 p-1 shadow-md flex space-x-3 items-center">
            {icons.map((tool) => (
                <button
                    key={tool.name}
                    className="text-lg bg-white p-1 rounded-md shadow hover:bg-gray-200 focus:outline-none transition duration-150"
                    title={tool.name}
                >
                    {tool.icon}
                </button>
            ))}
        </div>
    );
};

const NavbarToolbar: React.FC = () => {
    return (
        <div>
            <Navbar />
            <Toolbar />
        </div>
    );
};

export default NavbarToolbar;
