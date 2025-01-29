export const colHeaders = [
    'Name',
    'Type',
    'Width',
    'Decimals',
    'Label',
    'Values',
    'Missing',
    'Columns',
    'Align',
    'Measure',
];

export const columns = [
    {
        data: 0,
        type: 'text',
        width: 300,
    },
    {
        data: 1,
        type: 'dropdown',
        source: [
            'Numeric',
            'Comma',
            'Dot',
            'Scientific notation',
            'Date',
            'Dollar',
            'Custom currency',
            'String',
            'Restricted Numeric (integer with leading zeros)',
        ],
        strict: true,
        allowInvalid: false,
        width: 300,
    },
    {
        data: 2,
        type: 'numeric',
        numericFormat: {
            pattern: '0',
        },
        width: 150,
    },
    {
        data: 3,
        type: 'numeric',
        numericFormat: {
            pattern: '0',
        },
        width: 150,
    },
    {
        data: 4,
        type: 'text',
        width: 150,
    },
    {
        data: 5,
        type: 'text',
        width: 225,
    },
    {
        data: 6,
        type: 'text',
        width: 150,
    },
    {
        data: 7,
        type: 'numeric',
        numericFormat: {
            pattern: '0',
        },
        width: 150,
    },
    {
        data: 8,
        type: 'dropdown',
        source: ['Left', 'Right', 'Center'],
        width: 150,
    },
    {
        data: 9,
        type: 'dropdown',
        source: ['Scale', 'Ordinal', 'Nominal'],
        strict: true,
        allowInvalid: false,
        width: 150,
    },
];