import React, { useState } from "react";
import { useVariableStore } from "@/stores/useVariableStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SimpleBarModalProps {
  onClose: () => void;
}

const SimpleBarModal: React.FC<SimpleBarModalProps> = ({ onClose }) => {
  const [selectedBarOption, setSelectedBarOption] = useState<string>(""); // Opsi Bar
  const [selectedVariable, setSelectedVariable] = useState<string>(""); // Variabel yang dipilih
  const [barRepresentVariable, setBarRepresentVariable] = useState<string>(""); // Variable untuk Bars Represent
  const [highlightedVariable, setHighlightedVariable] = useState<string>(""); // Variabel terakhir aktif
  const [categoryAxis, setCategoryAxis] = useState<string>(""); // Input kategori
  const [rows, setRows] = useState<string[]>([]); // Variabel di Rows
  const [columns, setColumns] = useState<string[]>([]); // Variabel di Columns

  const variables = useVariableStore((state) => state.variables);

  const handleAddToRows = () => {
    if (selectedVariable && !rows.includes(selectedVariable)) {
      setRows((prev) => [...prev, selectedVariable]); // Tambahkan ke Rows
      setHighlightedVariable(selectedVariable); // Tandai sebagai variabel aktif terakhir
      setSelectedVariable(""); // Kosongkan variabel terpilih
    }
  };

  const handleAddToColumns = () => {
    if (selectedVariable && !columns.includes(selectedVariable)) {
      setColumns((prev) => [...prev, selectedVariable]); // Tambahkan ke Columns
      setHighlightedVariable(selectedVariable); // Tandai sebagai variabel aktif terakhir
      setSelectedVariable(""); // Kosongkan variabel terpilih
    }
  };

  const handleReset = () => {
    setSelectedBarOption("");
    setSelectedVariable("");
    setHighlightedVariable("");
    setCategoryAxis("");
    setRows([]);
    setColumns([]);
  };

  const handleRemoveFromRows = (variable: string) => {
    setRows((prev) => prev.filter((item) => item !== variable));
    setHighlightedVariable(""); // Kosongkan highlight
  };

  const handleRemoveFromColumns = (variable: string) => {
    setColumns((prev) => prev.filter((item) => item !== variable));
    setHighlightedVariable(""); // Kosongkan highlight
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-full max-h-screen w-[50vw] sm:w-[90vw] md:w-[70vw] lg:w-[50vw] xl:w-[50vw] min-w-[300px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Define Simple Bar: Summaries for Groups of Cases
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-12 gap-4 py-4">
          {/* Panel Variables */}
          <div className="col-span-4 border-r pr-4">
            <Label>Variables</Label>
            <div className="overflow-y-auto max-h-[60vh] border rounded-md p-2">
              <ul className="space-y-2">
                {variables.map((variable, index) => (
                  <li
                    key={index}
                    className={`cursor-pointer p-2 rounded-md ${
                      highlightedVariable === variable.name
                        ? "bg-blue-100" // Highlight untuk variabel aktif terakhir
                        : selectedVariable === variable.name
                        ? "bg-gray-200" // Variabel yang dipilih
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setSelectedVariable(variable.name);
                      setHighlightedVariable(variable.name); // Tandai sebagai variabel aktif terakhir
                    }}
                  >
                    {variable.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bars Represent */}
          <div className="col-span-8 space-y-4">
            <div className="border p-4 rounded-md">
              <Label>Bars Represent</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {/* Radio Buttons */}
                {[
                  { id: "n-of-cases", label: "N of cases" },
                  { id: "percent-of-cases", label: "% of cases" },
                  { id: "cum-n", label: "Cum. N" },
                  { id: "cum-percent", label: "Cum. %" },
                  { id: "other-statistic", label: "Other statistic" },
                ].map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={option.id}
                      name="bars-represent"
                      value={option.label}
                      checked={selectedBarOption === option.label}
                      onChange={(e) => setSelectedBarOption(e.target.value)}
                      className="radio-input"
                    />
                    <Label htmlFor={option.id}>{option.label}</Label>
                  </div>
                ))}
              </div>

              {/* Variable Input */}
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="p-2 text-black-500 border-gray-300 bg-gray-200 hover:bg-gray-300"
                    onClick={() => {
                      if (selectedVariable) {
                        setBarRepresentVariable(selectedVariable); // Tambahkan variabel yang dipilih ke Bars Represent
                        setHighlightedVariable(selectedVariable); // Highlight variabel yang baru dimasukkan
                        setSelectedVariable(""); // Kosongkan pilihan
                      }
                    }}
                    disabled={selectedBarOption !== "Other statistic"}
                  >
                    ⮕
                  </Button>
                  <div className="flex flex-col flex-grow">
                    <Label
                      htmlFor="bar-represent-variable"
                      className="text-sm text-gray-500"
                    >
                      Variable:
                    </Label>
                    <Input
                      id="bar-represent-variable"
                      value={barRepresentVariable || ""}
                      placeholder="Select a variable"
                      readOnly
                      className={`flex-grow ${
                        highlightedVariable === barRepresentVariable
                          ? "bg-blue-100"
                          : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Axis */}
            <div>
              <Label>Category Axis</Label>
              <div className="flex items-center space-x-2 mt-2">
                {/* Tombol Add ke Category Axis */}
                <Button
                  variant="outline"
                  className="p-2 text-black-500 border-gray-300 bg-gray-200 hover:bg-gray-300"
                  onClick={() => {
                    if (selectedVariable) {
                      setCategoryAxis(selectedVariable); // Tambahkan variabel yang dipilih ke Category Axis
                      setHighlightedVariable(selectedVariable); // Tandai sebagai variabel terakhir aktif
                      setSelectedVariable(""); // Kosongkan variabel terpilih
                    }
                  }}
                >
                  ⮕
                </Button>

                {/* Input Category Axis */}
                <div className="flex flex-col flex-grow border rounded-md p-2 bg-gray-50 max-h-20 overflow-y-auto">
                  {categoryAxis ? (
                    <div
                      className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer ${
                        highlightedVariable === categoryAxis
                          ? "bg-blue-100"
                          : ""
                      }`}
                      onClick={() => {
                        setCategoryAxis(""); // Hapus Category Axis jika diklik
                        setHighlightedVariable(""); // Kosongkan highlight
                      }}
                    >
                      <span>{categoryAxis}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      No variable selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border p-4 rounded-md">
              {/* <Label className="text-lg font-medium">Panels by</Label> */}
              {/* Panel Rows */}
              <div>
                <Label>Panel by Rows</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    variant="outline"
                    className="p-2 text-black-500 border-gray-300 bg-gray-200 hover:bg-gray-300"
                    onClick={handleAddToRows}
                  >
                    ⮕
                  </Button>
                  <div className="flex flex-col flex-grow border rounded-md p-2 bg-gray-50 max-h-20 overflow-y-auto">
                    {rows.length > 0 ? (
                      rows.map((row, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer ${
                            highlightedVariable === row ? "bg-blue-100" : ""
                          }`}
                          onClick={() => handleRemoveFromRows(row)}
                        >
                          <span>{row}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">
                        No variables added
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Panel Columns */}
              <div>
                <Label>Panel by Columns</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    variant="outline"
                    className="p-2 text-black-500 border-gray-300 bg-gray-200 hover:bg-gray-300"
                    onClick={handleAddToColumns}
                  >
                    ⮕
                  </Button>
                  <div className="flex flex-col flex-grow border rounded-md p-2 bg-gray-50 max-h-20 overflow-y-auto">
                    {columns.length > 0 ? (
                      columns.map((col, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer ${
                            highlightedVariable === col ? "bg-blue-100" : ""
                          }`}
                          onClick={() => handleRemoveFromColumns(col)}
                        >
                          <span>{col}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">
                        No variables added
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Template Section */}
        <div className="border p-4 rounded-md">
          {/* <div className="border-t pt-4 mt-4 grid grid-cols-12 items-center"> */}
          <div className="col-span-12 flex items-center space-x-4">
            {/* Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-template"
                name="use-template"
                className="h-4 w-4 border-gray-300 rounded cursor-pointer"
                // onChange={(e) => setUseChartSpecification(e.target.checked)}
              />
              <Label htmlFor="use-template" className="text-sm text-gray-500">
                Use chart specifications from:
              </Label>
            </div>

            {/* File Button */}
            <Button
              variant="outline"
              className="p-2 text-black-500 border-gray-300 bg-gray-200 hover:bg-gray-300"
              //   disabled={!useChartSpecification} // Disable jika checkbox tidak dicentang
            >
              File...
            </Button>
          </div>
          {/* </div> */}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!selectedBarOption} onClick={() => alert("OK")}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleBarModal;
