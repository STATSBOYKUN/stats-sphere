import React from "react";
import { Label } from "@/components/ui/label";

interface VariableSelectionProps {
  variables: Array<{ columnIndex: number; name: string }>;
  onDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    variableName: string
  ) => void;
}

const VariableSelection: React.FC<VariableSelectionProps> = ({
  variables,
  onDragStart,
}) => {
  return (
    <div className="border p-4 rounded-lg shadow-sm h-[250px]">
      <Label className="font-semibold">Choose Variables</Label>
      <div className="space-y-2 mt-4 overflow-y-auto max-h-[200px]">
        {variables.map(({ columnIndex, name }, index) => (
          <div
            key={columnIndex}
            className="ml-[10px] cursor-pointer hover:bg-gray-200 p-2 rounded-lg"
            draggable="true"
            onDragStart={(e) => onDragStart(e, name)}
          >
            <Label htmlFor={`var${index}`} className="ml-2">
              {name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariableSelection;
