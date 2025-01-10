import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"; // Sesuaikan path-nya
import { useVariableStore } from "@/stores/useVariableStore";
import ChartPreview from "./ChartPreview"; // Import ChartPreview yang baru saja dibuat
import ChartSelection from "./ChartSelection";
import { chartTypes, ChartType } from "@/components/Modals/Graphs/ChartTypes";

interface ChartBuilderModalProps {
  onClose: () => void;
}

const ChartBuilderModal: React.FC<ChartBuilderModalProps> = ({ onClose }) => {
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartType>("bar2");
  const { variables, loadVariables } = useVariableStore(); // Mengambil variabel dari store

  useEffect(() => {
    const totalVariables = variables.length > 0 ? variables.length : 45; // Memuat jumlah variabel yang ada, default 45
    loadVariables(totalVariables); // Memuat variabel sesuai jumlah yang ada
  }, [loadVariables, variables.length]); // Menambahkan dependensi ke panjang array variabel

  // Fungsi untuk menangani drag start
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    variableName: string
  ) => {
    e.dataTransfer.setData("text/plain", variableName); // Menyimpan variabel yang di-drag
    e.dataTransfer.effectAllowed = "move";
  };

  const handleChartTypeChange = (value: ChartType) => {
    setChartType(value);
  };

  return (
    <DialogContent className="sm:max-h-[650px] max-w-[90%] overflow-auto">
      <DialogHeader className="p-2 m-0">
        <DialogTitle className="text-lg font-semibold m-0">
          Chart Builder
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-3 gap-6 py-4">
        {/* Kolom Kiri - Pilih Variabel dan Jenis Chart */}
        <div className="col-span-1 space-y-6 pr-6 border-r-2 border-gray-100">
          <div className="border p-4 rounded-lg shadow-sm h-[250px]">
            <div className="mb-2">
              <Label>Choose Variables</Label>
            </div>
            <div className="space-y-2 mt-4 overflow-y-auto max-h-[200px]">
              {variables.map((variable, index) => (
                <div
                  key={variable.columnIndex}
                  className="ml-[10px] cursor-pointer"
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, variable.name)} // Menggunakan onDragStart
                >
                  <Label htmlFor={`var${index}`} className="ml-2">
                    {variable.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <TooltipProvider>
            <div className="border p-4 rounded-lg shadow-sm h-[300px] mt-4">
              <div className="mb-2">
                <Label>Choose Graph</Label>
              </div>
              <div className="overflow-y-auto max-h-[220px]">
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {chartTypes.map((type, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div
                          className={`relative cursor-pointer p-4 border-2 rounded-lg text-center flex flex-col items-center justify-center h-[150px] w-full ${
                            chartType === type
                              ? "bg-gray-300 text-black"
                              : "bg-gray-100"
                          }`}
                          onClick={() => handleChartTypeChange(type)}
                        >
                          {/* Chart Icon */}
                          <div className="flex justify-center items-center overflow-hidden mb-2">
                            <ChartSelection
                              chartType={type}
                              width={50}
                              height={50}
                              useaxis={false}
                            />
                          </div>

                          {/* Chart Name tanpa Line Clamp */}
                          <span className="font-semibold text-xs block">
                            {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                          </span>
                        </div>
                      </TooltipTrigger>

                      {/* Tooltip Content */}
                      <TooltipContent side="top">
                        {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          </TooltipProvider>
        </div>

        {/* Kolom Kanan - Preview Chart */}
        <div className="col-span-2 flex justify-center items-center">
          <ChartPreview
            chartType={chartType}
            width={600}
            height={400}
            useaxis={true}
            variableNames={selectedVariables} // Kirim nama variabel yang dipilih
            setVariableNames={setSelectedVariables}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Generate Chart</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ChartBuilderModal;
