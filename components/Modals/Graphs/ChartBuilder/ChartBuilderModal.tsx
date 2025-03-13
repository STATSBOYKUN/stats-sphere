// src/components/ChartBuilderModal.tsx

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
} from "@/components/ui/tooltip";
import { useVariableStore } from "@/stores/useVariableStore";
import useResultStore from "@/stores/useResultStore";
import { useDataStore } from "@/stores/useDataStore"; // Import useDataStore
import ChartPreview from "./ChartPreview";
import VariableSelection from "./VariableSelection";
import ChartSelection from "./ChartSelection";
import { chartTypes, ChartType } from "@/components/Modals/Graphs/ChartTypes";
import ResultOutput from "@/components/Output/ResultOutput";
import { chartVariableConfig } from "./ChartVariableConfig";

interface ChartBuilderModalProps {
  onClose: () => void;
}

const ChartBuilderModal: React.FC<ChartBuilderModalProps> = ({ onClose }) => {
  const [chartType, setChartType] = useState<ChartType>("Vertical Bar Chart");
  const { variables, loadVariables } = useVariableStore();
  const [sideVariables, setSideVariables] = useState<string[]>([]);
  const [side2Variables, setSide2Variables] = useState<string[]>([]);
  const [bottomVariables, setBottomVariables] = useState<string[]>([]);
  const [colorVariables, setColorVariables] = useState<string[]>([]);
  const [filterVariables, setFilterVariables] = useState<string[]>([]);
  const [lowVariables, setLowVariables] = useState<string[]>([]);
  const [highVariables, setHighVariables] = useState<string[]>([]);
  const [closeVariables, setCloseVariables] = useState<string[]>([]);

  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { addStatistic, addLog, addAnalytic } = useResultStore();
  const { data, loadData } = useDataStore(); // Mengambil data dari store
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const totalVariables = variables.length > 0 ? variables.length : 45;
    loadVariables(totalVariables);
  }, [loadVariables, variables.length]);

  useEffect(() => {
    console.log("Updated Side Variables:", sideVariables);
  }, [sideVariables]);

  useEffect(() => {
    console.log("Updated Bottom Variables:", bottomVariables);
  }, [bottomVariables]);

  useEffect(() => {
    // Memuat data jika belum dimuat
    if (data.length === 0) {
      loadData();
    }
  }, [data, loadData]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    variableName: string
  ) => {
    e.dataTransfer.setData("text/plain", variableName);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleChartTypeChange = (value: ChartType) => {
    setChartType(value);
  };

  const handleDropSide = (newSideVariables: string[]) => {
    setSideVariables(newSideVariables);
    console.log("Updated Side Variables:", newSideVariables);
  };

  const handleDropSide2 = (newSide2Variables: string[]) => {
    setSide2Variables(newSide2Variables);
    console.log("Updated Side2 Variables:", newSide2Variables);
  };

  const handleDropBottom = (newBottomVariables: string[]) => {
    setBottomVariables(newBottomVariables);
    console.log("Updated Bottom Variables:", newBottomVariables);
  };

  const handleDropColor = (newColorVariables: string[]) => {
    setColorVariables(newColorVariables);
    console.log("Updated Color Variables:", newColorVariables);
  };

  const handleDropFilter = (newFilterVariables: string[]) => {
    setFilterVariables(newFilterVariables);
    console.log("Updated Bottom Variables:", newFilterVariables);
  };

  const handleDropLow = (newLowVariables: string[]) => {
    setLowVariables(newLowVariables);
    console.log("Updated Low Variables:", newLowVariables);
  };

  const handleDropHigh = (newHighVariables: string[]) => {
    setHighVariables(newHighVariables);
    console.log("Updated High Variables:", newHighVariables);
  };

  const handleDropClose = (newCloseVariables: string[]) => {
    setCloseVariables(newCloseVariables);
    console.log("Updated Close Variables:", newCloseVariables);
  };

  const handleRemoveVariable = (
    type: "side" | "bottom" | "low" | "high" | "close" | "side2",
    index: number
  ) => {
    if (type === "side") {
      setSideVariables((prev) => prev.filter((_, i) => i !== index));
    } else if (type === "bottom") {
      setBottomVariables((prev) => prev.filter((_, i) => i !== index));
    } else if (type === "low") {
      setLowVariables((prev) => prev.filter((_, i) => i !== index));
    } else if (type === "high") {
      setHighVariables((prev) => prev.filter((_, i) => i !== index));
    } else if (type === "close") {
      setCloseVariables((prev) => prev.filter((_, i) => i !== index));
    } else if (type === "side2") {
      setSide2Variables((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleResetVariables = () => {
    setSideVariables([]);
    setSide2Variables([]);
    setBottomVariables([]);
    setColorVariables([]);
    setFilterVariables([]);
    setLowVariables([]);
    setHighVariables([]);
    setCloseVariables([]);
  };

  const handleGenerateChart = async () => {
    // Validasi Input
    if (
      !validateChartVariables(
        chartType,
        sideVariables,
        bottomVariables,
        lowVariables,
        highVariables,
        closeVariables
      )
    ) {
      return; // Jangan lanjutkan jika validasi gagal
    }

    setIsCalculating(true);
    setErrorMsg(null);

    try {
      // Inisialisasi worker
      const worker = new Worker("/workers/ChartBuilder/DefaultChartPrep.js");

      const chartConfig = {
        width: 800,
        height: 600,
        chartColor: ["red"],
        useAxis: true,
        useLegend: true,
      };

      // Siapkan data yang akan dikirim ke worker
      const workerData = {
        chartType,
        chartVariables: {
          y: sideVariables,
          x: bottomVariables,
          groupBy: colorVariables,
          low: lowVariables,
          high: highVariables,
          close: closeVariables,
          y2: side2Variables,
        },
        chartMetadata: {
          note: "Mengecualikan nilai missing",
        },
        chartConfig,
        data,
        variables,
      };
      console.log("workerData", workerData);

      worker.postMessage(workerData);

      worker.onmessage = async (event) => {
        const { success, chartJSON, error } = event.data;

        if (success) {
          try {
            // 1. Tambahkan Log
            const logMsg = `GENERATE CHART TYPE ${chartType} WITH VARIABLES Y: ${sideVariables.join(
              ", "
            )} X: ${bottomVariables.join(", ")}`;
            const logId = await addLog({ log: logMsg });

            // 2. Tambahkan Analytic
            const analyticId = await addAnalytic({
              log_id: logId,
              title: "Chart Builder",
              note: "",
            });

            // 3. Tambahkan Statistic dengan analytic_id
            await addStatistic({
              analytic_id: analyticId,
              title: chartType,
              output_data: chartJSON,
              components: chartType,
            });

            setIsCalculating(false);
            onClose(); // Tutup modal
            setShowResult(true);
          } catch (err) {
            console.error("Error during post-chart actions:", err);
            setErrorMsg("Terjadi kesalahan saat menyimpan hasil.");
            setIsCalculating(false);
          }
        } else {
          setErrorMsg(error || "Worker gagal menghasilkan chart.");
          setIsCalculating(false);
        }
        worker.terminate();
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
        setErrorMsg(
          "Terjadi kesalahan pada worker. Periksa konsol untuk detail."
        );
        setIsCalculating(false);
        worker.terminate();
      };
    } catch (error) {
      console.error("Error during chart generation:", error);
      setErrorMsg("Gagal memulai proses pembuatan chart.");
      setIsCalculating(false);
    }
  };

  const validateChartVariables = (
    chartType: ChartType,
    sideVariables: string[],
    bottomVariables: string[],
    lowVariables: string[],
    highVariables: string[],
    closeVariables: string[]
  ) => {
    const chartConfig = chartVariableConfig[chartType]; // Ambil konfigurasi untuk chartType yang dipilih

    // Validasi untuk side (sumbu Y)
    if (
      sideVariables.length < chartConfig.side.min ||
      sideVariables.length > chartConfig.side.max
    ) {
      alert(
        `Jumlah variabel untuk sumbu Y (side) harus antara ${chartConfig.side.min} dan ${chartConfig.side.max}.`
      );
      return false;
    }

    // Validasi untuk bottom (sumbu X)
    if (
      bottomVariables.length < chartConfig.bottom.min ||
      bottomVariables.length > chartConfig.bottom.max
    ) {
      alert(
        `Jumlah variabel untuk sumbu X (bottom) harus antara ${chartConfig.bottom.min} dan ${chartConfig.bottom.max}.`
      );
      return false;
    }

    if (
      chartConfig.low &&
      (lowVariables.length < chartConfig.low.min ||
        lowVariables.length > chartConfig.low.max)
    ) {
      alert(
        `Jumlah variabel untuk sumbu low harus antara ${chartConfig.low.min} dan ${chartConfig.low.max}.`
      );
      return false;
    }

    if (
      chartConfig.high &&
      (highVariables.length < chartConfig.high.min ||
        highVariables.length > chartConfig.high.max)
    ) {
      alert(
        `Jumlah variabel untuk sumbu high harus antara ${chartConfig.high.min} dan ${chartConfig.high.max}.`
      );
      return false;
    }

    if (
      chartConfig.close &&
      (closeVariables.length < chartConfig.close.min ||
        closeVariables.length > chartConfig.close.max)
    ) {
      alert(
        `Jumlah variabel untuk sumbu close harus antara ${chartConfig.close.min} dan ${chartConfig.close.max}.`
      );
      return false;
    }

    return true; // Jika semua validasi lolos
  };

  if (showResult) {
    return <ResultOutput />;
  }

  return (
    <DialogContent className="sm:max-h-[90%] max-w-[90%] overflow-auto">
      <DialogHeader className="p-2 m-0">
        <DialogTitle className="text-lg font-semibold m-0">
          Chart Builder
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-3 gap-6 py-4">
        {/* Kolom Kiri - Pilih Variabel dan Jenis Chart */}
        <div className="col-span-1 space-y-6 pr-6 border-r-2 border-gray-100">
          {/* Variable Selection */}
          <VariableSelection
            variables={variables}
            onDragStart={handleDragStart}
          />

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
                              width={80}
                              height={80}
                              useaxis={false}
                            />
                          </div>

                          {/* Chart Name tanpa Line Clamp */}
                          <span className="font-semibold text-xs block">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
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
            sideVariables={sideVariables}
            side2Variables={side2Variables}
            bottomVariables={bottomVariables}
            colorVariables={colorVariables}
            filterVariables={filterVariables}
            lowVariables={lowVariables}
            highVariables={highVariables}
            closeVariables={closeVariables}
            onDropSide={handleDropSide}
            onDropSide2={handleDropSide2}
            onDropBottom={handleDropBottom}
            onDropColor={handleDropColor}
            onDropFilter={handleDropFilter}
            onDropLow={handleDropLow}
            onDropHigh={handleDropHigh}
            onDropClose={handleDropClose}
            handleRemoveVariable={handleRemoveVariable}
            validateChartVariables={validateChartVariables}
          />
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && <div className="text-red-500 text-sm mb-2">{errorMsg}</div>}

      <DialogFooter>
        {/* Reset Button */}
        <Button variant="outline" onClick={handleResetVariables}>
          Reset
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerateChart}
          disabled={isCalculating || data.length === 0}
        >
          {isCalculating ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-gray-900 rounded-full"
                viewBox="0 0 24 24"
              ></svg>
              Generating...
            </>
          ) : (
            "Generate Chart"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ChartBuilderModal;
