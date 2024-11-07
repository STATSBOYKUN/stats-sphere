// components/ComputeVariable.tsx

import React, { useState } from 'react';
import { useVariableStore } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface ComputeVariableProps {
    onClose: () => void;
}

const ComputeVariable: React.FC<ComputeVariableProps> = ({ onClose }) => {
    const [targetVariable, setTargetVariable] = useState('');
    const [numericExpression, setNumericExpression] = useState('');
    const [selectedVariable, setSelectedVariable] = useState('');
    const [functionGroup, setFunctionGroup] = useState('');
    const [selectedFunction, setSelectedFunction] = useState('');
    const [showTypeLabelModal, setShowTypeLabelModal] = useState(false);
    const [additionalInput, setAdditionalInput] = useState('');

    const variables = useVariableStore((state) => state.variables);
    const addVariable = useVariableStore((state) => state.addVariable);

    const handleAddToExpression = (value: string) => {
        setNumericExpression((prev) => prev + value);
    };

    const handleCompute = () => {
        // Here you would parse the numericExpression and compute the new variable values
        // Then, add the new variable to the variable store and data store
        // For now, we'll just add the variable to the variable store

        const newVariable = {
            columnIndex: variables.length,
            name: targetVariable,
            type: 'Numeric', // You can adjust this based on Type & Label settings
            width: 8,
            decimals: 2,
            label: '',
            values: '',
            missing: '',
            columns: 8,
            align: 'Right',
            measure: 'Scale',
        };

        addVariable(newVariable);
        onClose();
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Compute Variable</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-12 gap-4 py-4">
                    {/* Target Variable Input */}
                    <div className="col-span-12 flex items-center space-x-2">
                        <Label htmlFor="target-variable" className="whitespace-nowrap">
                            Target Variable
                        </Label>
                        <Input
                            id="target-variable"
                            value={targetVariable}
                            onChange={(e) => setTargetVariable(e.target.value)}
                            className="flex-grow"
                        />
                        <Button variant="outline" onClick={() => setShowTypeLabelModal(true)}>
                            Type & Label
                        </Button>
                    </div>

                    {/* Variables and Functions Selection */}
                    <div className="col-span-4">
                        <Label>Variables</Label>
                        <Select onValueChange={setSelectedVariable}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Variable"/>
                            </SelectTrigger>
                            <SelectContent>
                                {variables.map((variable) => (
                                    <SelectItem key={variable.columnIndex} value={variable.name}>
                                        {variable.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            className="mt-2 w-full"
                            onClick={() => handleAddToExpression(selectedVariable)}
                            disabled={!selectedVariable}
                        >
                            Add Variable to Expression
                        </Button>
                    </div>

                    <div className="col-span-8">
                        <Label htmlFor="numeric-expression">Numeric Expression</Label>
                        <Textarea
                            id="numeric-expression"
                            value={numericExpression}
                            onChange={(e) => setNumericExpression(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="col-span-12">
                        <Label>Calculator</Label>
                        <div className="grid grid-cols-6 gap-2">
                            <Button variant="outline" onClick={() => handleAddToExpression('+')}>+</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('<')}>&lt;</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('>')}>&gt;</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('7')}>7</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('8')}>8</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('9')}>9</Button>

                            <Button variant="outline" onClick={() => handleAddToExpression('-')}>-</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('<=')}>&lt;=</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('>=')}>&gt;=</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('4')}>4</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('5')}>5</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('6')}>6</Button>

                            {/* Third Row */}
                            <Button variant="outline" onClick={() => handleAddToExpression('*')}>*</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('=')}>=</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('~=')}>~=</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('1')}>1</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('2')}>2</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('3')}>3</Button>

                            <Button variant="outline" onClick={() => handleAddToExpression('/')}>/</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('&')}>&</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('|')}>|</Button>
                            <Button variant="outline" className="col-span-2"
                                    onClick={() => handleAddToExpression('0')}>0</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('.')}>.</Button>

                            <Button variant="outline" onClick={() => handleAddToExpression('**')}>**</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('~')}>~</Button>
                            <Button variant="outline" onClick={() => handleAddToExpression('()')}>( )</Button>
                            <Button variant="outline" className="col-span-3"
                                    onClick={() => setNumericExpression('')}>Delete</Button>
                        </div>
                    </div>

                    <div className="col-span-6">
                        <Label>Function Group</Label>
                        <Select onValueChange={setFunctionGroup}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Function Group"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Math">Math</SelectItem>
                                <SelectItem value="Statistical">Statistical</SelectItem>
                                {/* Add more function groups as needed */}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-6">
                        <Label>Function</Label>
                        <Select onValueChange={setSelectedFunction}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Function"/>
                            </SelectTrigger>
                            <SelectContent>
                                {/* Based on selected function group, list functions */}
                                {functionGroup === 'Math' && (
                                    <>
                                        <SelectItem value="ABS">ABS(number)</SelectItem>
                                        <SelectItem value="SQRT">SQRT(number)</SelectItem>
                                        {/* Add more math functions */}
                                    </>
                                )}
                                {functionGroup === 'Statistical' && (
                                    <>
                                        <SelectItem value="MEAN">MEAN(number1, number2, ...)</SelectItem>
                                        <SelectItem value="STDDEV">STDDEV(number1, number2, ...)</SelectItem>
                                        {/* Add more statistical functions */}
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            className="mt-2 w-full"
                            onClick={() => handleAddToExpression(selectedFunction)}
                            disabled={!selectedFunction}
                        >
                            Add Function to Expression
                        </Button>
                    </div>

                    {/* Additional Input Field */}
                    <div className="col-span-12">
                        <Label htmlFor="additional-input">Additional Input</Label>
                        <Input
                            id="additional-input"
                            value={additionalInput}
                            onChange={(e) => setAdditionalInput(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleCompute} disabled={!targetVariable || !numericExpression}>
                        OK
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Type & Label Modal */}
            {showTypeLabelModal && (
                <Dialog open onOpenChange={() => setShowTypeLabelModal(false)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Type & Label</DialogTitle>
                        </DialogHeader>
                        {/* Implement the type and label settings here */}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowTypeLabelModal(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </Dialog>
    );
};

export default ComputeVariable;
