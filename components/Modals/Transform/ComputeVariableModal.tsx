import React, { useState } from "react";
import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";
import { useResultStore } from "@/stores/useResultStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Variable } from "@/types/Variable";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import math from "@/utils/math/mathUtils";

interface ComputeVariableProps {
  onClose: () => void;
}

const ComputeVariable: React.FC<ComputeVariableProps> = ({ onClose }) => {
  const [targetVariable, setTargetVariable] = useState("");
  const [numericExpression, setNumericExpression] = useState("");
  const [selectedVariable, setSelectedVariable] = useState("");
  const [functionGroup, setFunctionGroup] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");
  const [showTypeLabelModal, setShowTypeLabelModal] = useState(false);
  const [additionalInput, setAdditionalInput] = useState("");
  const { addLog, addAnalytic, addStatistic } = useResultStore();

  // Use the correct type from Variable definition
  const [variableType, setVariableType] = useState<Variable["type"]>("NUMERIC");
  const [variableLabel, setVariableLabel] = useState("");

  const variables = useVariableStore((state) => state.variables);
  const addVariable = useVariableStore((state) => state.addVariable);
  const data = useDataStore((state) => state.data);
  const setData = useDataStore((state) => state.setData);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddToExpression = (value: string) => {
    setNumericExpression((prev) => prev + value);
  };

  const handleCompute = async () => {
    if (!targetVariable || !numericExpression) {
      alert("Target Variable dan Numeric Expression wajib diisi.");
      return;
    }

    const variableExists = variables.find((v) => v.name === targetVariable);
    if (variableExists) {
      alert("Nama variabel target sudah ada. Silakan pilih nama lain.");
      return;
    }

    const variableNames = variables.map((v) => v.name);
    const regex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const exprVariables = numericExpression.match(regex) || [];
    const allowedFunctions = ["mean", "stddev", "abs", "sqrt", "not"];
    const missingVars = exprVariables.filter(
        (varName) =>
            varName && // Pastikan varName tidak null atau undefined
            !variableNames.includes(varName) &&
            !(
                typeof varName === "string" &&
                allowedFunctions.includes(varName.toLowerCase())
            )
    );

    if (missingVars.length > 0) {
      alert(`Variabel berikut tidak ditemukan: ${missingVars.join(", ")}`);
      return;
    }

    setIsCalculating(true); // Set state isCalculating ke true saat proses dimulai

    try {
      // Inisialisasi worker
      const worker = new Worker("/workers/ComputeVariable/ComputeVariable.js");

      worker.postMessage({
        data,
        variables,
        numericExpression,
        variableType,
      });

      worker.onmessage = async (event) => {
        const { success, computedValues, tableData, error } = event.data;

        if (success) {
          try {
            // Tambahkan nilai baru ke baris data di thread utama
            const newData = data.map((row, rowIndex) => {
              const updatedRow = [...row];
              const newColumnIndex = variables.length;

              // Tambahkan kolom baru jika perlu
              if (updatedRow.length <= newColumnIndex) {
                while (updatedRow.length <= newColumnIndex) {
                  updatedRow.push("");
                }
              }

              // Assign nilai hasil komputasi
              updatedRow[newColumnIndex] = computedValues[rowIndex];

              return updatedRow;
            });

            // Create a partial Variable object based on the Variable type
            const newVariable: Partial<Variable> = {
              columnIndex: variables.length,
              name: targetVariable,
              type: variableType,
              width: 8,
              decimals: variableType === "NUMERIC" ? 2 : 0,
              label: variableLabel,
              values: [],
              missing: [],
              columns: 200,
              align: variableType === "NUMERIC" ? "right" : "left",
              measure: variableType === "NUMERIC" ? "scale" : "nominal",
              role: "input",
            };

            await addVariable(newVariable);

            // Perbarui data di store
            newData.forEach((row, rowIndex) => {
              const newColumnIndex = variables.length;
              useDataStore
                  .getState()
                  .updateCell(rowIndex, newColumnIndex, row[newColumnIndex]);
            });

            // Perbarui state
            setData(newData);

            // Tambahkan log dan analytics
            const logMsg = `COMPUTE VARIABLE ${targetVariable} WITH EXPRESSION "${numericExpression}"`;
            const logId = await addLog({ log: logMsg });
            const analyticId = await addAnalytic(logId, {
              title: "Compute Variable",
              note: "",
            });
            await addStatistic(analyticId,{
              title: "Log",
              output_data: JSON.stringify({
                log: [
                  {
                    text: `COMPUTE VARIABLE ${targetVariable} WITH EXPRESSION "${numericExpression}". \nEXECUTED.`,
                  },
                ],
              }),
              components: "Log",
              description: ""
            });

            setIsCalculating(false); // Set isCalculating ke false setelah sukses
            onClose(); // Tutup modal
          } catch (err) {
            console.error("Error during post-compute actions:", err);
            setErrorMsg("Terjadi kesalahan saat menyimpan hasil.");
            setIsCalculating(false); // Set isCalculating ke false jika ada error
          }
        } else {
          setErrorMsg(error || "Worker gagal menghitung variabel.");
          setIsCalculating(false); // Set isCalculating ke false jika worker gagal
        }
        worker.terminate(); // Hentikan worker
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
        setErrorMsg(
            "Terjadi kesalahan pada worker. Periksa konsol untuk detail."
        );
        setIsCalculating(false); // Set isCalculating ke false jika terjadi error pada worker
        worker.terminate();
      };
    } catch (error) {
      console.error("Error during computation:", error);
      setErrorMsg("Gagal memulai proses perhitungan.");
      setIsCalculating(false); // Set isCalculating ke false jika terjadi error
    }
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
              <Button
                  variant="outline"
                  onClick={() => setShowTypeLabelModal(true)}
              >
                Type & Label
              </Button>
            </div>

            {/* Variables and Functions Selection */}
            <div className="col-span-4">
              <Label>Variables</Label>
              <Select onValueChange={setSelectedVariable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Variable" />
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
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("+")}
                >
                  +
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("<")}
                >
                  &lt;
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression(">")}
                >
                  &gt;
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("7")}
                >
                  7
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("8")}
                >
                  8
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("9")}
                >
                  9
                </Button>

                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("-")}
                >
                  -
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("<=")}
                >
                  &lt;=
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression(">=")}
                >
                  &gt;=
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("4")}
                >
                  4
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("5")}
                >
                  5
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("6")}
                >
                  6
                </Button>

                {/* Third Row */}
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("*")}
                >
                  *
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("==")}
                >
                  ==
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("!=")}
                >
                  ≠
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("1")}
                >
                  1
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("2")}
                >
                  2
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("3")}
                >
                  3
                </Button>

                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("/")}
                >
                  /
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("&")}
                >
                  &
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("|")}
                >
                  |
                </Button>
                <Button
                    variant="outline"
                    className="col-span-2"
                    onClick={() => handleAddToExpression("0")}
                >
                  0
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression(".")}
                >
                  .
                </Button>

                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("^")}
                >
                  ^
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("not")}
                >
                  ~
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleAddToExpression("()")}
                >
                  ( )
                </Button>
                <Button
                    variant="outline"
                    className="col-span-3"
                    onClick={() => setNumericExpression("")}
                >
                  Delete
                </Button>
              </div>
            </div>

            <div className="col-span-6">
              <Label>Function Group</Label>
              <Select onValueChange={setFunctionGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Function Group" />
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
                  <SelectValue placeholder="Select Function" />
                </SelectTrigger>
                <SelectContent>
                  {/* Based on selected function group, list functions */}
                  {functionGroup === "Math" && (
                      <>
                        <SelectItem value="ABS">ABS(number)</SelectItem>
                        <SelectItem value="SQRT">SQRT(number)</SelectItem>
                        {/* Add more math functions */}
                      </>
                  )}
                  {functionGroup === "Statistical" && (
                      <>
                        <SelectItem value="MEAN">
                          MEAN(number1, number2, ...)
                        </SelectItem>
                        <SelectItem value="STDDEV">
                          STDDEV(number1, number2, ...)
                        </SelectItem>
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
            <Button
                onClick={handleCompute}
                disabled={!targetVariable || !numericExpression || isCalculating}
            >
              {isCalculating ? "Computing..." : "OK"}
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
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="variable-type">Variable Type</Label>
                    <Select
                        value={variableType}
                        onValueChange={(value) => setVariableType(value as Variable["type"])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NUMERIC">Numeric</SelectItem>
                        <SelectItem value="STRING">String</SelectItem>
                        <SelectItem value="DATE">Date</SelectItem>
                        <SelectItem value="COMMA">Comma</SelectItem>
                        <SelectItem value="DOT">Dot</SelectItem>
                        <SelectItem value="SCIENTIFIC">Scientific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="variable-label">Variable Label</Label>
                    <Input
                        id="variable-label"
                        value={variableLabel}
                        onChange={(e) => setVariableLabel(e.target.value)}
                        placeholder="Enter a descriptive label"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                      variant="outline"
                      onClick={() => setShowTypeLabelModal(false)}
                  >
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