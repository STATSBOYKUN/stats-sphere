import React, { useEffect, useRef, useState } from "react";
import { useDataStore } from "@/stores/useDataStore"; // Mengambil data dari useDataStore
import { useVariableStore } from "@/stores/useVariableStore"; // Mengambil variabel dari useVariableStore
import { chartUtils } from "@/utils/chartBuilder/chartTypes/chartUtils";
import * as d3 from "d3"; // Mengimpor D3.js
import { ChartType } from "@/components/Modals/Graphs/ChartTypes";
import { chartVariableConfig } from "./ChartVariableConfig";
import { number } from "mathjs";

interface ChartPreviewProps {
  chartType: ChartType;
  width: number;
  height: number;
  useaxis: boolean;
  sideVariables: string[];
  side2Variables: string[];
  bottomVariables: string[];
  filterVariables: string[];
  colorVariables: string[];
  lowVariables: string[];
  highVariables: string[];
  closeVariables: string[];
  onDropSide: (newSideVariables: string[]) => void;
  onDropSide2: (newSideVariables: string[]) => void;
  onDropBottom: (newBottomVariables: string[]) => void;
  onDropFilter: (newFilterVariables: string[]) => void;
  onDropColor: (newColorVariables: string[]) => void;
  onDropLow: (newLowVariables: string[]) => void;
  onDropHigh: (newHighVariables: string[]) => void;
  onDropClose: (newCloseVariables: string[]) => void;
  handleRemoveVariable: (
    type: "side" | "bottom" | "low" | "high" | "close" | "side2",
    index: number
  ) => void;
  validateChartVariables: (
    chartType: ChartType,
    sideVariables: string[],
    bottomVariables: string[],
    lowVariables: string[],
    highVariables: string[],
    closeVariables: string[]
  ) => boolean;
}

// Definisi interface untuk data chart
interface ChartData {
  category: string;
  subcategory?: string;
  value: number;
  error?: number;
  x?: number;
  y?: number;
  color?: string;
  group?: string;
  [key: string]: any;
}

const ChartPreview: React.FC<ChartPreviewProps> = ({
  chartType,
  width,
  height,
  useaxis,
  sideVariables,
  side2Variables,
  bottomVariables,
  filterVariables,
  lowVariables,
  highVariables,
  closeVariables,
  colorVariables,
  onDropSide,
  onDropSide2,
  onDropBottom,
  onDropFilter,
  onDropColor,
  onDropLow,
  onDropHigh,
  onDropClose,
  handleRemoveVariable,
  validateChartVariables,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { data, loadData } = useDataStore(); // Mengambil data dari useDataStore
  const { variables, loadVariables } = useVariableStore(); // Mengambil variabel dari useVariableStore
  const svgRef = useRef<SVGSVGElement | null>(null); // Referensi untuk elemen SVG

  const [modalState, setModalState] = useState<{
    type: string | null;
    isOpen: boolean;
  }>({
    type: null,
    isOpen: false,
  });
  const variablesToShow =
    modalState.type === "side"
      ? sideVariables
      : modalState.type === "side2"
      ? side2Variables
      : modalState.type === "bottom"
      ? bottomVariables
      : modalState.type === "color"
      ? colorVariables
      : modalState.type === "filter"
      ? filterVariables
      : modalState.type === "low"
      ? lowVariables
      : modalState.type === "high"
      ? highVariables
      : modalState.type === "close"
      ? closeVariables
      : []; // default empty array if no match found

  // Fungsi untuk membuka modal
  const handleOpenModal = (
    type: "side" | "bottom" | "low" | "high" | "close" | "side2"
  ) => {
    setModalState({ type, isOpen: true });
  };

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setModalState({ type: null, isOpen: false });
  };

  // Memuat data dan variabel ketika komponen pertama kali dimuat
  useEffect(() => {
    loadData(); // Memuat data dari useDataStore
    loadVariables(45); // Memuat variabel dari useVariableStore
  }, [loadData, loadVariables]);

  // Fungsi untuk menangani drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Mengizinkan drop
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropZone:
      | "side"
      | "bottom"
      | "color"
      | "filter"
      | "high"
      | "low"
      | "close"
      | "side2"
  ) => {
    e.preventDefault();
    const variableName = e.dataTransfer.getData("text/plain");

    if (!variableName) {
      console.warn("No variable detected in drag event");
      return;
    }

    const config = chartVariableConfig[chartType]; // Ambil konfigurasi chartType saat ini

    if (dropZone === "side" && config.side.max > 0) {
      if (sideVariables.length >= config.side.max) {
        // Jika sudah mencapai maksimum, ganti variabel pertama
        const updatedSideVariables = [variableName];
        onDropSide(updatedSideVariables);
        console.log(`Replacing side variables with: ${updatedSideVariables}`);
      } else {
        // Tambahkan variabel jika belum penuh
        const updatedSideVariables = [...sideVariables, variableName];
        onDropSide(updatedSideVariables);
        console.log(`Added to side variables: ${updatedSideVariables}`);
      }
    } else if (dropZone === "bottom" && config.bottom.max > 0) {
      if (bottomVariables.length >= config.bottom.max) {
        // Jika sudah mencapai maksimum, ganti variabel pertama
        const updatedBottomVariables = [variableName];
        onDropBottom(updatedBottomVariables);
        console.log(
          `Replacing bottom variables with: ${updatedBottomVariables}`
        );
      } else {
        // Tambahkan variabel jika belum penuh
        const updatedBottomVariables = [...bottomVariables, variableName];
        onDropBottom(updatedBottomVariables);
        console.log(`Added to bottom variables: ${updatedBottomVariables}`);
      }
    } else if (dropZone === "color" && config.color && config.color.max > 0) {
      if (colorVariables.length >= config.color?.max) {
        const updatedColorVariables = [variableName];
        onDropColor(updatedColorVariables);
        console.log(`Replacing color variables with: ${updatedColorVariables}`);
      } else {
        const updatedColorVariables = [...colorVariables, variableName];
        onDropColor(updatedColorVariables);
        console.log(`Added to color variables: ${updatedColorVariables}`);
      }
    } else if (
      dropZone === "filter" &&
      config.filter &&
      config.filter.max > 0
    ) {
      if (filterVariables.length >= config.filter?.max) {
        const updatedFilterVariables = [variableName];
        onDropFilter(updatedFilterVariables);
        console.log(
          `Replacing filter variables with: ${updatedFilterVariables}`
        );
      } else {
        const updatedFilterVariables = [...filterVariables, variableName];
        onDropFilter(updatedFilterVariables);
        console.log(`Added to filter variables: ${updatedFilterVariables}`);
      }
    } else if (dropZone === "low" && config.low && config.low.max > 0) {
      if (lowVariables.length >= config.low.max) {
        const updatedLowVariables = [variableName];
        onDropLow(updatedLowVariables);
        console.log(`Replacing low variables with: ${updatedLowVariables}`);
      } else {
        const updatedLowVariables = [...lowVariables, variableName];
        onDropLow(updatedLowVariables);
        console.log(`Added to low variables: ${updatedLowVariables}`);
      }
    } else if (dropZone === "high" && config.high && config.high.max > 0) {
      if (highVariables.length >= config.high.max) {
        const updatedHighVariables = [variableName];
        onDropHigh(updatedHighVariables);
        console.log(`Replacing high variables with: ${updatedHighVariables}`);
      } else {
        const updatedHighVariables = [...highVariables, variableName];
        onDropHigh(updatedHighVariables);
        console.log(`Added to high variables: ${updatedHighVariables}`);
      }
    } else if (dropZone === "close" && config.close && config.close.max > 0) {
      if (closeVariables.length >= config.close.max) {
        const updatedCloseVariables = [variableName];
        onDropClose(updatedCloseVariables);
        console.log(`Replacing close variables with: ${updatedCloseVariables}`);
      } else {
        const updatedCloseVariables = [...closeVariables, variableName];
        onDropClose(updatedCloseVariables);
        console.log(`Added to close variables: ${updatedCloseVariables}`);
      }
    } else if (dropZone === "side2" && config.side2 && config.side2.max > 0) {
      if (side2Variables.length >= config.side2.max) {
        const updatedSide2Variables = [variableName];
        onDropSide2(updatedSide2Variables);
        console.log(`Replacing side2 variables with: ${updatedSide2Variables}`);
      } else {
        const updatedSide2Variables = [...side2Variables, variableName];
        onDropSide2(updatedSide2Variables);
        console.log(`Added to side2 variables: ${updatedSide2Variables}`);
      }
    } else {
      console.log(`Penambahan ${dropZone} tidak diizinkan`);
    }
  };

  // Fungsi untuk mengambil data chart
  // const getDataForChart = (): ChartData[] => {
  //   const bottomIndex = variables.findIndex(
  //     (variable) => variable.name === bottomVariables[0]
  //   );

  //   const sideIndices = sideVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   const colorIndex = colorVariables.length
  //     ? variables.findIndex((variable) => variable.name === colorVariables[0])
  //     : -1;

  //   const filterIndices = filterVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   // Cek apakah tidak ada variabel bottom, side, atau color yang valid
  //   if (
  //     bottomIndex === -1 &&
  //     sideIndices.every((index) => index === -1) &&
  //     colorIndex === -1
  //   ) {
  //     return [];
  //   }

  //   // **Cek jika hanya colorVariables yang valid**
  //   if (
  //     colorIndex !== -1 &&
  //     bottomIndex === -1 &&
  //     sideIndices.every((index) => index === -1)
  //   ) {
  //     return data.map((row) => ({
  //       category: "Unknown", // Karena tidak ada bottomVariable, kategori diisi default
  //       value: 0, // Tidak ada nilai terkait karena hanya color yang digunakan
  //       color: row[colorIndex], // Tambahkan warna
  //     }));
  //   }

  //   // Jika hanya ada variabel bottom yang valid
  //   if (bottomIndex !== -1 && sideIndices.every((index) => index === -1)) {
  //     return data.map((row) => ({
  //       category: row[bottomIndex],
  //       value: 0, // Set nilai default jika sideVariables kosong
  //       ...(colorIndex !== -1 ? { color: row[colorIndex] } : {}),
  //     }));
  //   }

  //   // Jika ada variabel side yang valid tetapi tidak ada variabel bottom
  //   if (sideIndices.some((index) => index !== -1) && bottomIndex === -1) {
  //     const results: ChartData[] = [];

  //     data.forEach((row) => {
  //       sideIndices.forEach((index, i) => {
  //         if (index !== -1) {
  //           results.push({
  //             category: "Unknown",
  //             subcategory: sideVariables[i] || "",
  //             value: parseFloat(row[index] || "0"),
  //             ...(colorIndex !== -1 ? { color: row[colorIndex] } : {}),
  //           });
  //         }
  //       });
  //     });

  //     console.log("Hasil akhir (results):", results);
  //     return results;
  //   }

  //   // Jika variabel side dan bottom valid
  //   // Filter indeks variabel side yang valid
  //   const validSideIndices = sideIndices.filter((index) => index !== -1);

  //   if (validSideIndices.length === 1) {
  //     // Kasus satu variabel side
  //     const sideIndex = validSideIndices[0];
  //     const sideVariableName = sideVariables[sideIndices.indexOf(sideIndex)];
  //     return data.map((row) => ({
  //       category: row[bottomIndex],
  //       subcategory: sideVariableName,
  //       value: parseFloat(row[sideIndex] || "0"),
  //       ...(colorIndex !== -1 ? { color: row[colorIndex] } : {}),
  //     }));
  //   } else {
  //     // Kasus lebih dari satu variabel side
  //     const results: ChartData[] = [];

  //     data.forEach((row) => {
  //       sideIndices.forEach((index, i) => {
  //         if (index !== -1) {
  //           results.push({
  //             category: row[bottomIndex],
  //             subcategory: sideVariables[i],
  //             value: parseFloat(row[index] || "0"),
  //             ...(colorIndex !== -1 ? { color: row[colorIndex] } : {}),
  //           });
  //         }
  //       });
  //     });

  //     return results;
  //   }
  // };

  // const getDataForChart = (): ChartData[] => {
  //   const bottomIndices = bottomVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   const sideIndices = sideVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   const lowIndices = lowVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   const highIndices = highVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   const closeIndices = closeVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   const colorIndex = colorVariables.length
  //     ? variables.findIndex((variable) => variable.name === colorVariables[0])
  //     : -1;

  //   const filterIndices = filterVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   // Cek apakah tidak ada variabel bottom, side, atau color yang valid
  //   if (
  //     bottomIndices.every((index) => index === -1) &&
  //     sideIndices.every((index) => index === -1) &&
  //     colorIndex === -1
  //   ) {
  //     return [];
  //   }

  //   // **Cek jika hanya colorVariables yang valid**
  //   if (
  //     colorIndex !== -1 &&
  //     bottomIndices.every((index) => index === -1) &&
  //     sideIndices.every((index) => index === -1)
  //   ) {
  //     return data.map((row) => ({
  //       category: "Unknown", // Karena tidak ada bottomVariable, kategori diisi default
  //       value: 0, // Tidak ada nilai terkait karena hanya color yang digunakan
  //       color: row[colorIndex], // Tambahkan warna
  //     }));
  //   }

  //   // Jika hanya ada variabel bottom yang valid (bisa lebih dari 1 variabel bottom)
  //   if (
  //     bottomIndices.some((index) => index !== -1) &&
  //     sideIndices.every((index) => index === -1)
  //   ) {
  //     return data.map((row) => {
  //       const result: ChartData = { category: "", value: 0 }; // Set nilai default jika sideVariables kosong

  //       // Iterasi untuk mengembalikan semua kategori bottom yang valid
  //       bottomIndices.forEach((index, i) => {
  //         if (index !== -1) {
  //           result[`bottom_${i}`] = row[index]; // Menyimpan nilai bottom dengan key yang berbeda
  //         }
  //       });

  //       // Jika colorIndex valid, tambahkan warna
  //       if (colorIndex !== -1) {
  //         result.color = row[colorIndex];
  //       }

  //       return result;
  //     });
  //   }

  //   // Jika ada variabel side yang valid tetapi tidak ada variabel bottom
  //   if (
  //     sideIndices.some((index) => index !== -1) &&
  //     bottomIndices.every((index) => index === -1)
  //   ) {
  //     const results: ChartData[] = [];

  //     data.forEach((row) => {
  //       sideIndices.forEach((index, i) => {
  //         if (index !== -1) {
  //           const result: ChartData = {
  //             category: "Unknown", // Diisi dengan nilai default
  //             value: parseFloat(row[index] || "0"),
  //             subcategory: sideVariables[i] || "",
  //           };

  //           if (colorIndex !== -1) {
  //             result.color = row[colorIndex];
  //           }

  //           results.push(result);
  //         }
  //       });
  //     });

  //     console.log("Hasil akhir (results):", results);
  //     return results;
  //   }

  //   // Jika variabel side dan bottom valid
  //   const validSideIndices = sideIndices.filter((index) => index !== -1);

  //   if (validSideIndices.length === 1) {
  //     // Kasus satu variabel side
  //     const sideIndex = validSideIndices[0];
  //     const sideVariableName = sideVariables[sideIndices.indexOf(sideIndex)];
  //     return data.map((row) => ({
  //       category: row[bottomIndices[0]], // Menggunakan index bottom pertama
  //       subcategory: sideVariableName,
  //       value: parseFloat(row[sideIndex] || "0"),
  //       ...(colorIndex !== -1 ? { color: row[colorIndex] } : {}),
  //     }));
  //   } else {
  //     // Kasus lebih dari satu variabel side
  //     const results: ChartData[] = [];

  //     data.forEach((row) => {
  //       sideIndices.forEach((index, i) => {
  //         if (index !== -1) {
  //           const result: ChartData = {
  //             category: row[bottomIndices[0]], // Menggunakan index bottom pertama
  //             subcategory: sideVariables[i],
  //             value: parseFloat(row[index] || "0"),
  //           };

  //           if (colorIndex !== -1) {
  //             result.color = row[colorIndex];
  //           }

  //           results.push(result);
  //         }
  //       });
  //     });

  //     return results;
  //   }
  // };

  const getDataForChart = (): ChartData[] => {
    const bottomIndices = bottomVariables.map((varName) =>
      variables.findIndex((variable) => variable.name === varName)
    );

    const sideIndices = sideVariables.map((varName) =>
      variables.findIndex((variable) => variable.name === varName)
    );

    const side2Indices = side2Variables.map((varName) =>
      variables.findIndex((variable) => variable.name === varName)
    );

    const lowIndices = lowVariables.map((varName) =>
      variables.findIndex((variable) => variable.name === varName)
    );

    const highIndices = highVariables.map((varName) =>
      variables.findIndex((variable) => variable.name === varName)
    );

    const closeIndices = closeVariables.map((varName) =>
      variables.findIndex((variable) => variable.name === varName)
    );

    const colorIndex = colorVariables.length
      ? variables.findIndex((variable) => variable.name === colorVariables[0])
      : -1;

    const filterIndices = filterVariables.map((varName) =>
      variables.findIndex((variable) => variable.name === varName)
    );

    // **Ensure that low, high, or close can still be processed even if no bottom or side variables are valid**
    if (
      lowIndices.every((index) => index === -1) &&
      highIndices.every((index) => index === -1) &&
      closeIndices.every((index) => index === -1) &&
      bottomIndices.every((index) => index === -1) &&
      sideIndices.every((index) => index === -1)
    ) {
      return [];
    }

    // **Cek jika hanya colorVariables yang valid**
    if (
      colorIndex !== -1 &&
      bottomIndices.every((index) => index === -1) &&
      sideIndices.every((index) => index === -1)
    ) {
      return data.map((row) => ({
        category: "Unknown", // Karena tidak ada bottomVariable, kategori diisi default
        value: 0, // Tidak ada nilai terkait karena hanya color yang digunakan
        color: row[colorIndex], // Tambahkan warna
      }));
    }

    // **Handle only low, high, or close variables**
    if (
      lowIndices.some((index) => index !== -1) &&
      highIndices.every((index) => index === -1) &&
      closeIndices.every((index) => index === -1)
    ) {
      return data.map((row) => {
        const result: ChartData = { category: "Unknown", value: 0 }; // Ensure category and value are present

        lowIndices.forEach((index, i) => {
          if (index !== -1) {
            result[`low_${i}`] = parseFloat(row[index]);
          }
        });

        if (colorIndex !== -1) {
          result.color = row[colorIndex];
        }

        return result;
      });
    }

    if (
      highIndices.some((index) => index !== -1) &&
      lowIndices.every((index) => index === -1) &&
      closeIndices.every((index) => index === -1)
    ) {
      return data.map((row) => {
        const result: ChartData = { category: "Unknown", value: 0 }; // Ensure category and value are present

        highIndices.forEach((index, i) => {
          if (index !== -1) {
            result[`high_${i}`] = parseFloat(row[index]);
          }
        });

        if (colorIndex !== -1) {
          result.color = row[colorIndex];
        }

        return result;
      });
    }

    if (
      closeIndices.some((index) => index !== -1) &&
      lowIndices.every((index) => index === -1) &&
      highIndices.every((index) => index === -1)
    ) {
      return data.map((row) => {
        const result: ChartData = { category: "Unknown", value: 0 }; // Ensure category and value are present

        closeIndices.forEach((index, i) => {
          if (index !== -1) {
            result[`close_${i}`] = parseFloat(row[index]);
          }
        });

        if (colorIndex !== -1) {
          result.color = row[colorIndex];
        }

        return result;
      });
    }

    // Jika hanya ada variabel bottom yang valid (bisa lebih dari 1 variabel bottom)
    if (
      bottomIndices.some((index) => index !== -1) &&
      sideIndices.every((index) => index === -1)
    ) {
      return data.map((row) => {
        const result: ChartData = { category: "", value: 0 }; // Set nilai default jika sideVariables kosong

        // Iterasi untuk mengembalikan semua kategori bottom yang valid
        bottomIndices.forEach((index, i) => {
          if (index !== -1) {
            result[`bottom_${i}`] = row[index]; // Menyimpan nilai bottom dengan key yang berbeda
          }
        });

        // Jika colorIndex valid, tambahkan warna
        if (colorIndex !== -1) {
          result.color = row[colorIndex];
        }

        // Handle low, high, close variables
        lowIndices.forEach((index, i) => {
          if (index !== -1) {
            result[`low_${i}`] = parseFloat(row[index]);
          }
        });

        highIndices.forEach((index, i) => {
          if (index !== -1) {
            result[`high_${i}`] = parseFloat(row[index]);
          }
        });

        closeIndices.forEach((index, i) => {
          if (index !== -1) {
            result[`close_${i}`] = parseFloat(row[index]);
          }
        });

        return result;
      });
    }

    // Jika ada variabel side yang valid tetapi tidak ada variabel bottom
    if (
      sideIndices.some((index) => index !== -1) &&
      bottomIndices.every((index) => index === -1)
    ) {
      const results: ChartData[] = [];

      data.forEach((row) => {
        sideIndices.forEach((index, i) => {
          if (index !== -1) {
            const result: ChartData = {
              category: "Unknown", // Diisi dengan nilai default
              value: parseFloat(row[index] || "0"),
              subcategory: sideVariables[i] || "",
            };

            if (colorIndex !== -1) {
              result.color = row[colorIndex];
            }

            // Handle low, high, close variables
            lowIndices.forEach((index, i) => {
              if (index !== -1) {
                result[`low_${i}`] = parseFloat(row[index]);
              }
            });

            highIndices.forEach((index, i) => {
              if (index !== -1) {
                result[`high_${i}`] = parseFloat(row[index]);
              }
            });

            closeIndices.forEach((index, i) => {
              if (index !== -1) {
                result[`close_${i}`] = parseFloat(row[index]);
              }
            });

            results.push(result);
          }
        });
      });

      console.log("Hasil akhir (results):", results);
      return results;
    }

    // Jika variabel side dan bottom valid
    const validSideIndices = sideIndices.filter((index) => index !== -1);

    if (validSideIndices.length === 1) {
      // Kasus satu variabel side
      const sideIndex = validSideIndices[0];
      const sideVariableName = sideVariables[sideIndices.indexOf(sideIndex)];

      return data.map((row) => {
        const result: ChartData = {
          category: row[bottomIndices[0]], // Menggunakan index bottom pertama
          subcategory: sideVariableName,
          value: parseFloat(row[sideIndex] || "0"),
          ...(colorIndex !== -1 ? { color: row[colorIndex] } : {}),
        };
        // Handle low, high, close variables
        if (side2Indices[0] !== -1) {
          result.side2 = parseFloat(row[side2Indices[0]]) || 0;
        }
        // Handle low, high, close variables
        if (lowIndices[0] !== -1) {
          result.low_0 = parseFloat(row[lowIndices[0]]) || 0;
        }
        if (highIndices[0] !== -1) {
          result.high_0 = parseFloat(row[highIndices[0]]) || 0;
        }
        if (closeIndices[0] !== -1) {
          result.close_0 = parseFloat(row[closeIndices[0]]) || 0;
        }

        return result;
      });
    } else {
      // Kasus lebih dari satu variabel side
      const results: ChartData[] = [];

      data.forEach((row) => {
        sideIndices.forEach((index, i) => {
          if (index !== -1) {
            const result: ChartData = {
              category: row[bottomIndices[0]], // Menggunakan index bottom pertama
              subcategory: sideVariables[i],
              value: parseFloat(row[index] || "0"),
            };

            if (colorIndex !== -1) {
              result.color = row[colorIndex];
            }

            // Handle low, high, close variables
            if (lowIndices[i] !== -1) {
              result[`low_${i}`] = parseFloat(row[lowIndices[i]]) || 0;
            }
            if (highIndices[i] !== -1) {
              result[`high_${i}`] = parseFloat(row[highIndices[i]]) || 0;
            }
            if (closeIndices[i] !== -1) {
              result[`close_${i}`] = parseFloat(row[closeIndices[i]]) || 0;
            }

            results.push(result);
          }
        });
      });

      return results;
    }
  };

  // const getDataForChart = (): ChartData[] => {
  //   const bottomIndices = bottomVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   const sideIndices = sideVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   const lowIndices = lowVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   const highIndices = highVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   const closeIndices = closeVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   const colorIndex = colorVariables.length
  //     ? variables.findIndex((variable) => variable.name === colorVariables[0])
  //     : -1;

  //   const filterIndices = filterVariables.map((varName) =>
  //     variables.findIndex((variable) => variable.name === varName)
  //   );

  //   // **Ensure that low, high, or close can still be processed even if no bottom or side variables are valid**
  //   if (
  //     lowIndices.every((index) => index === -1) &&
  //     highIndices.every((index) => index === -1) &&
  //     closeIndices.every((index) => index === -1) &&
  //     bottomIndices.every((index) => index === -1) &&
  //     sideIndices.every((index) => index === -1)
  //   ) {
  //     return [];
  //   }

  //   // **Handle only low, high, or close variables**
  //   if (
  //     lowIndices.some((index) => index !== -1) &&
  //     highIndices.every((index) => index === -1) &&
  //     closeIndices.every((index) => index === -1)
  //   ) {
  //     return data.map((row) => {
  //       const result: ChartData = { category: "Unknown", value: 0 }; // Ensure category and value are present

  //       lowIndices.forEach((index, i) => {
  //         if (index !== -1) {
  //           result[`low_${i}`] = row[index];
  //         }
  //       });

  //       if (colorIndex !== -1) {
  //         result.color = row[colorIndex];
  //       }

  //       return result;
  //     });
  //   }

  //   if (
  //     highIndices.some((index) => index !== -1) &&
  //     lowIndices.every((index) => index === -1) &&
  //     closeIndices.every((index) => index === -1)
  //   ) {
  //     return data.map((row) => {
  //       const result: ChartData = { category: "Unknown", value: 0 }; // Ensure category and value are present

  //       highIndices.forEach((index, i) => {
  //         if (index !== -1) {
  //           result[`high_${i}`] = row[index];
  //         }
  //       });

  //       if (colorIndex !== -1) {
  //         result.color = row[colorIndex];
  //       }

  //       return result;
  //     });
  //   }

  //   if (
  //     closeIndices.some((index) => index !== -1) &&
  //     lowIndices.every((index) => index === -1) &&
  //     highIndices.every((index) => index === -1)
  //   ) {
  //     return data.map((row) => {
  //       const result: ChartData = { category: "Unknown", value: 0 }; // Ensure category and value are present

  //       closeIndices.forEach((index, i) => {
  //         if (index !== -1) {
  //           result[`close_${i}`] = row[index];
  //         }
  //       });

  //       if (colorIndex !== -1) {
  //         result.color = row[colorIndex];
  //       }

  //       return result;
  //     });
  //   }

  //   // Handle cases when low, high, or close are mixed with other variables (like bottom or side)
  //   const results: ChartData[] = [];

  //   data.forEach((row) => {
  //     const result: ChartData = { category: "Unknown", value: 0 }; // Ensure category and value are present

  //     // Handle bottom and side variables as before
  //     bottomIndices.forEach((index, i) => {
  //       if (index !== -1) {
  //         result[`bottom_${i}`] = row[index];
  //       }
  //     });

  //     sideIndices.forEach((index, i) => {
  //       if (index !== -1) {
  //         result[`side_${i}`] = row[index];
  //       }
  //     });

  //     // Handle low, high, close variables
  //     lowIndices.forEach((index, i) => {
  //       if (index !== -1) {
  //         result[`low_${i}`] = row[index];
  //       }
  //     });

  //     highIndices.forEach((index, i) => {
  //       if (index !== -1) {
  //         result[`high_${i}`] = row[index];
  //       }
  //     });

  //     closeIndices.forEach((index, i) => {
  //       if (index !== -1) {
  //         result[`close_${i}`] = row[index];
  //       }
  //     });

  //     // Add color if present
  //     if (colorIndex !== -1) {
  //       result.color = row[colorIndex];
  //     }

  //     results.push(result);
  //   });

  //   return results;
  // };

  const getLowVariableData = (chartData: ChartData[]): ChartData[] => {
    const lowIndices = lowVariables.map((varName) =>
      variables.findIndex((variable) => variable.name === varName)
    );
    return chartData.map((row) => {
      const updatedRow = { ...row }; // Make a copy of the row to modify

      // Add low value if the index is valid
      lowIndices.forEach((index) => {
        if (index !== -1) {
          updatedRow.low = parseFloat(row[index] || "0"); // Add low value to the row
        }
      });

      return updatedRow; // Return the updated row
    });
  };

  const getHighVariableData = (chartData: ChartData[]): ChartData[] => {
    // Find indices for high variables in the data
    const highIndices = highVariables.map((varName) =>
      variables.findIndex((variable) => variable.name === varName)
    );
    console.log("highIndices", highIndices);

    return chartData.map((row) => {
      const updatedRow = { ...row }; // Copy row to modify
      console.log("update row", updatedRow);
      console.log("row:", row); // Debug untuk melihat struktur row

      // Add high value if the index is valid
      highIndices.forEach((index) => {
        if (index !== -1) {
          const variableName = variables[index].name;
          const value = row[index];
          console.log(`Value for ${variableName}:`, value); // Debugging untuk melihat nilai yang diambil
          updatedRow.high = parseFloat(value || "0");
        }
      });

      return updatedRow; // Return the updated row with high value
    });
  };

  // Process close values
  const getCloseVariableData = (chartData: ChartData[]): ChartData[] => {
    const closeIndices = closeVariables.map((varName) =>
      variables.findIndex((variable) => variable.name === varName)
    );
    return chartData.map((row) => {
      const updatedRow = { ...row }; // Copy row to modify

      // Add close value if the index is valid
      closeIndices.forEach((index) => {
        if (index !== -1) {
          updatedRow.close = parseFloat(row[index] || "0"); // Add close value to the row
        }
      });

      return updatedRow; // Return the updated row with close value
    });
  };

  const getJSONForChart = async () => {
    // Validasi Input
    // if (!validateChartVariables(chartType, sideVariables, bottomVariables)) {
    //   return null; // Kembalikan null jika validasi gagal
    // }

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
        },
        chartMetadata: {
          note: "Mengecualikan nilai missing",
        },
        chartConfig,
        data,
        variables,
      };

      worker.postMessage(workerData);

      return new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
          const { success, chartJSON, error } = event.data;

          if (success) {
            setIsCalculating(false);
            resolve(chartJSON); // Kembalikan chartJSON jika sukses
          } else {
            setErrorMsg(error || "Worker gagal menghasilkan chart.");
            setIsCalculating(false);
            reject(error || "Worker gagal menghasilkan chart.");
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
          reject("Worker error");
        };
      });
    } catch (error) {
      console.error("Error during chart generation:", error);
      setErrorMsg("Gagal memulai proses pembuatan chart.");
      setIsCalculating(false);
      return null; // Kembalikan null jika terjadi kesalahan
    }
  };

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Menghapus chart sebelumnya

      // Ambil data untuk chart, jika variabel tidak ada gunakan data default
      const chartData = getDataForChart();

      // const chartJSON = getJSONForChart();
      console.log("JSON chart", chartData);

      // Switch case untuk memilih jenis chart berdasarkan chartType
      let chartNode = null;

      switch (chartType) {
        case "Vertical Bar Chart":
          chartNode =
            chartData.length === 0
              ? chartUtils.createVerticalBarChart2(
                  [
                    // Default data jika tidak ada variabel yang dipilih
                    { category: "A", value: 30 },
                    { category: "B", value: 80 },
                    { category: "C", value: 45 },
                    { category: "D", value: 60 },
                    { category: "E", value: 20 },
                    { category: "F", value: 90 },
                  ],
                  width,
                  height,
                  useaxis
                )
              : chartUtils.createVerticalBarChart2(
                  chartData,
                  width,
                  height,
                  useaxis
                );
          break;

        case "Horizontal Bar Chart":
          chartNode =
            chartData.length === 0
              ? chartUtils.createHorizontalBarChart(
                  [
                    // Default data jika tidak ada variabel yang dipilih
                    { category: "A", value: 30 },
                    { category: "B", value: 80 },
                    { category: "C", value: 45 },
                    { category: "D", value: 60 },
                    { category: "E", value: 20 },
                    { category: "F", value: 90 },
                  ],
                  width,
                  height,
                  useaxis
                )
              : chartUtils.createHorizontalBarChart(
                  chartData,
                  width,
                  height,
                  useaxis
                );
          break;

        case "Vertical Stacked Bar Chart": {
          const formattedData =
            chartData.length === 0
              ? [
                  { category: "male", subcategory: "blue", value: 30 },
                  { category: "male", subcategory: "white", value: 20 },
                  { category: "male", subcategory: "green", value: 10 },
                  { category: "female", subcategory: "blue", value: 25 },
                  { category: "female", subcategory: "white", value: 15 },
                  { category: "female", subcategory: "green", value: 10 },
                ]
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.subcategory || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createVerticalStackedBarChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Horizontal Stacked Bar Chart": {
          const formattedData =
            chartData.length === 0
              ? [
                  { category: "male", subcategory: "blue", value: 30 },
                  { category: "male", subcategory: "white", value: 20 },
                  { category: "male", subcategory: "green", value: 10 },
                  { category: "female", subcategory: "blue", value: 25 },
                  { category: "female", subcategory: "white", value: 15 },
                  { category: "female", subcategory: "green", value: 10 },
                ]
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.subcategory || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createHorizontalStackedBarChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Grouped Bar Chart": {
          const formattedData =
            chartData.length === 0
              ? [
                  { category: "male", subcategory: "blue", value: 30 },
                  { category: "male", subcategory: "white", value: 20 },
                  { category: "male", subcategory: "green", value: 10 },
                  { category: "female", subcategory: "blue", value: 25 },
                  { category: "female", subcategory: "white", value: 15 },
                  { category: "female", subcategory: "green", value: 10 },
                ]
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.subcategory || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createGroupedBarChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Line Chart":
          chartNode =
            chartData.length === 0
              ? chartUtils.createLineChart(
                  [
                    // Default data jika tidak ada variabel yang dipilih
                    { category: "2023-01-01", value: 10 },
                    { category: "2023-01-02", value: 30 },
                    { category: "2023-01-03", value: 55 },
                    { category: "2023-01-04", value: 60 },
                    { category: "2023-01-05", value: 70 },
                    { category: "2023-01-06", value: 90 },
                    { category: "2023-01-07", value: 55 },
                    { category: "2023-01-08", value: 30 },
                    { category: "2023-01-09", value: 50 },
                    { category: "2023-01-10", value: 20 },
                    { category: "2023-01-11", value: 25 },
                  ],
                  width,
                  height,
                  useaxis
                )
              : chartUtils.createLineChart(chartData, width, height, useaxis);
          break;

        case "Multiple Line Chart": {
          const formattedData =
            chartData.length === 0
              ? [
                  {
                    category: "Product A",
                    subcategory: "Division 1",
                    value: 30,
                  },
                  {
                    category: "Product A",
                    subcategory: "Division 2",
                    value: 20,
                  },
                  {
                    category: "Product B",
                    subcategory: "Division 1",
                    value: 25,
                  },
                  {
                    category: "Product B",
                    subcategory: "Division 2",
                    value: 15,
                  },
                  {
                    category: "Product C",
                    subcategory: "Division 1",
                    value: 40,
                  },
                  {
                    category: "Product C",
                    subcategory: "Division 2",
                    value: 10,
                  },
                ]
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.subcategory || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createMultilineChart(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Pie Chart":
          chartNode =
            chartData.length === 0
              ? chartUtils.createPieChart(
                  [
                    // Data default jika tidak ada variabel yang dipilih
                    { category: "A", value: 30 },
                    { category: "B", value: 80 },
                    { category: "C", value: 45 },
                    { category: "D", value: 60 },
                    { category: "E", value: 20 },
                    { category: "F", value: 90 },
                  ],
                  width,
                  height
                )
              : chartUtils.createPieChart(chartData, width, height);
          break;

        case "Area Chart":
          chartNode =
            chartData.length === 0
              ? chartUtils.createAreaChart(
                  [
                    // Default data jika tidak ada variabel yang dipilih
                    { category: "2023-01-01", value: 10 },
                    { category: "2023-01-02", value: 30 },
                    { category: "2023-01-03", value: 55 },
                    { category: "2023-01-04", value: 60 },
                    { category: "2023-01-05", value: 70 },
                    { category: "2023-01-06", value: 90 },
                    { category: "2023-01-07", value: 55 },
                    { category: "2023-01-08", value: 30 },
                    { category: "2023-01-09", value: 50 },
                    { category: "2023-01-10", value: 20 },
                    { category: "2023-01-11", value: 25 },
                  ],
                  width,
                  height,
                  useaxis
                )
              : chartUtils.createAreaChart(chartData, width, height, useaxis);
          break;

        case "Histogram": // Menambahkan case baru untuk Histogram
          // Mengambil hanya nilai 'value' dari chartData
          const histogramData =
            chartData.length === 0
              ? [5, 8, 9, 7, 3, 6, 3, 7, 3, 2, 9, 1, 4, 2, 5]
              : chartData.map((d) => d.value); // Mengambil hanya nilai dari chartData

          chartNode = chartUtils.createHistogram(
            histogramData, // Pastikan ini hanya array angka
            width,
            height,
            useaxis
          );
          break;

        case "Scatter Plot": // Menambahkan case baru untuk Scatter plot
          // Ambil data scatter jika tidak ada data default
          const scatterData =
            chartData.length === 0
              ? [
                  { x: 15, y: 50 },
                  { x: 20, y: 200 },
                  { x: 60, y: 100 },
                  { x: 200, y: 325 },
                  { x: 80, y: 150 },
                  { x: 130, y: 275 },
                  { x: 50, y: 220 },
                  { x: 170, y: 300 },
                  { x: 100, y: 30 },
                  { x: 170, y: 125 },
                  { x: 150, y: 80 },
                  { x: 100, y: 190 },
                  { x: 95, y: 75 },
                ]
              : chartData.map((d) => ({
                  x: Number(d.category), // Konversi category ke number
                  y: d.value, // Tetap gunakan value sebagai y
                }));

          chartNode = chartUtils.createScatterPlot(
            scatterData, // Data untuk Scatter plot
            width,
            height,
            useaxis
          );
          break;

        case "Scatter Plot With Fit Line": // Menambahkan case baru untuk Scatter plot dengan Fit Line
          // Ambil data scatter dengan fit line jika tidak ada data default
          const scatterWithFitLineData =
            chartData.length === 0
              ? [
                  { x: 15, y: 50 },
                  { x: 20, y: 200 },
                  { x: 60, y: 100 },
                  { x: 200, y: 325 },
                  { x: 80, y: 150 },
                  { x: 130, y: 275 },
                  { x: 50, y: 220 },
                  { x: 170, y: 300 },
                  { x: 100, y: 30 },
                  { x: 170, y: 125 },
                  { x: 150, y: 80 },
                  { x: 100, y: 190 },
                  { x: 95, y: 75 },
                ]
              : chartData.map((d) => ({
                  x: Number(d.category), // Konversi category ke number
                  y: d.value, // Tetap gunakan value sebagai y
                }));

          chartNode = chartUtils.createScatterPlotWithFitLine(
            scatterWithFitLineData, // Data untuk Scatter plot dengan Fit Line
            width,
            height,
            useaxis
          );
          break;

        case "Boxplot": // Menambahkan case baru untuk BoxPlot
          // Ambil data box plot jika tidak ada data default
          const boxPlotData =
            chartData.length === 0
              ? [
                  { category: "A", value: 20 },
                  { category: "A", value: 40 },
                  { category: "A", value: 60 },
                  { category: "A", value: 80 },
                  { category: "B", value: 30 },
                  { category: "B", value: 50 },
                  { category: "B", value: 70 },
                  { category: "B", value: 90 },
                ]
              : chartData.map((d) => ({
                  category: d.category, // Gunakan category untuk mengganti x
                  value: d.value, // Gunakan value untuk mengganti y
                }));

          // Memanggil fungsi untuk membuat BoxPlot
          chartNode = chartUtils.createBoxplot(
            boxPlotData, // Data untuk Box Plot
            width,
            height,
            useaxis // Pilihan untuk menampilkan sumbu
          );
          break;

        case "Error Bar Chart": // Menambahkan case baru untuk BoxPlot
          // Ambil data box plot jika tidak ada data default
          const errorBardata =
            chartData.length === 0
              ? [
                  { category: "A", value: 30, error: 5 },
                  { category: "B", value: 80, error: 10 },
                  { category: "C", value: 45, error: 4 },
                  { category: "D", value: 60, error: 6 },
                  { category: "E", value: 20, error: 3 },
                  { category: "F", value: 90, error: 7 },
                ]
              : chartData.map((d) => ({
                  category: d.category, // Gunakan category untuk mengganti x
                  value: d.value, // Gunakan value untuk mengganti y
                  error: 2,
                }));

          // Memanggil fungsi untuk membuat BoxPlot
          chartNode = chartUtils.createErrorBarChart(
            errorBardata, // Data untuk Box Plot
            width,
            height,
            useaxis // Pilihan untuk menampilkan sumbu
          );
          break;

        case "Stacked Area Chart":
          const stackedAreaData =
            chartData.length === 0
              ? [
                  { category: "Sun", subcategory: "Product 1", value: 30 },
                  { category: "Sun", subcategory: "Product 2", value: 20 },
                  { category: "Sun", subcategory: "Product 3", value: 25 },
                  { category: "Mon", subcategory: "Product 1", value: 15 },
                  { category: "Mon", subcategory: "Product 2", value: 40 },
                  { category: "Mon", subcategory: "Product 3", value: 10 },
                  { category: "Tue", subcategory: "Product 1", value: 20 },
                  { category: "Tue", subcategory: "Product 2", value: 30 },
                  { category: "Tue", subcategory: "Product 3", value: 15 },
                  { category: "Wed", subcategory: "Product 1", value: 10 },
                  { category: "Wed", subcategory: "Product 2", value: 25 },
                  { category: "Wed", subcategory: "Product 3", value: 40 },
                ]
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.subcategory || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createStackedAreaChart(
            stackedAreaData,
            width,
            height,
            useaxis
          );
          break;

        case "Grouped Scatter Plot":
          const groupedScatterData =
            chartData.length === 0
              ? [
                  { category: "A", x: 5.1, y: 3.5 },
                  { category: "B", x: 4.9, y: 3.0 },
                  { category: "A", x: 4.7, y: 3.2 },
                  { category: "C", x: 4.6, y: 3.1 },
                  { category: "B", x: 5.0, y: 3.6 },
                  { category: "C", x: 5.4, y: 3.9 },
                  { category: "A", x: 4.6, y: 3.4 },
                  { category: "B", x: 5.0, y: 3.4 },
                  { category: "C", x: 4.4, y: 2.9 },
                  { category: "A", x: 4.9, y: 3.1 },
                  { category: "B", x: 5.4, y: 3.7 },
                  { category: "C", x: 4.8, y: 3.4 },
                  { category: "A", x: 4.8, y: 3.0 },
                  { category: "B", x: 4.3, y: 3.0 },
                  { category: "C", x: 5.8, y: 4.0 },
                  { category: "A", x: 5.7, y: 4.4 },
                  { category: "B", x: 5.4, y: 3.9 },
                  { category: "C", x: 5.1, y: 3.5 },
                  { category: "A", x: 5.1, y: 3.8 },
                  { category: "B", x: 5.0, y: 3.3 },
                ]
              : chartData
                  // .filter((d) => d.x !== undefined && d.y !== undefined) // Pastikan x dan y ada
                  .map((d) => ({
                    x: Number(d.category) || 0, // Gunakan nilai default jika undefined
                    y: Number(d.value) || 0,
                    category: d.color || d.subcategory || "unknown",
                  }));
          console.log("Data scatter", groupedScatterData);
          chartNode = chartUtils.createGroupedScatterPlot(
            groupedScatterData,
            width,
            height,
            useaxis
          );
          break;

        case "Dot Plot":
          chartNode =
            chartData.length === 0
              ? chartUtils.createDotPlot(
                  [
                    // Default data jika tidak ada variabel yang dipilih
                    { category: "A", value: 10 },
                    { category: "B", value: 40 },
                    { category: "C", value: 45 },
                    { category: "D", value: 55 },
                    { category: "E", value: 70 },
                    { category: "F", value: 75 },
                  ],
                  width,
                  height,
                  useaxis
                )
              : chartUtils.createDotPlot(chartData, width, height, useaxis);
          break;

        case "Population Pyramid": {
          const formattedData =
            chartData.length === 0
              ? [
                  { category: "0-4", subcategory: "M", value: 9736305 },
                  { category: "0-4", subcategory: "F", value: 10031835 },
                  { category: "5-9", subcategory: "M", value: 10117913 },
                  { category: "5-9", subcategory: "F", value: 10411857 },
                  { category: "10-14", subcategory: "M", value: 10470147 },
                  { category: "10-14", subcategory: "F", value: 11027820 },
                  { category: "15-19", subcategory: "M", value: 10561873 },
                  { category: "15-19", subcategory: "F", value: 11094262 },
                  { category: "20-24", subcategory: "M", value: 11576412 },
                  { category: "20-24", subcategory: "F", value: 10889596 },
                  { category: "25-29", subcategory: "M", value: 10625791 },
                  { category: "25-29", subcategory: "F", value: 9889569 },
                  { category: "30-34", subcategory: "M", value: 9899569 },
                  { category: "30-34", subcategory: "F", value: 10330988 },
                  { category: "35-39", subcategory: "M", value: 10330988 },
                  { category: "35-39", subcategory: "F", value: 10571884 },
                  { category: "40-44", subcategory: "M", value: 10571884 },
                  { category: "40-44", subcategory: "F", value: 11051409 },
                  { category: "45-49", subcategory: "M", value: 10173646 },
                  { category: "45-49", subcategory: "F", value: 8824852 },
                  { category: "50-54", subcategory: "M", value: 8824852 },
                  { category: "50-54", subcategory: "F", value: 6876271 },
                  { category: "55-59", subcategory: "M", value: 6876271 },
                  { category: "55-59", subcategory: "F", value: 4867513 },
                  { category: "60-64", subcategory: "M", value: 4867513 },
                  { category: "60-64", subcategory: "F", value: 3416432 },
                  { category: "65-69", subcategory: "M", value: 3416432 },
                  { category: "65-69", subcategory: "F", value: 2378691 },
                  { category: "70-74", subcategory: "M", value: 2378691 },
                  { category: "70-74", subcategory: "F", value: 2000771 },
                  { category: "75-79", subcategory: "M", value: 2000771 },
                  { category: "75-79", subcategory: "F", value: 4313687 },
                  { category: "80-84", subcategory: "M", value: 4313687 },
                  { category: "80-84", subcategory: "F", value: 3432738 },
                ]
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.subcategory || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createPopulationPyramid(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Frequency Polygon": {
          const formattedData =
            chartData.length === 0
              ? [
                  { category: "-0", value: 0 },
                  { category: "0-10", value: 5 },
                  { category: "10-20", value: 15 },
                  { category: "20-30", value: 25 },
                  { category: "30-40", value: 30 },
                  { category: "40-50", value: 20 },
                  { category: "50-60", value: 10 },
                  { category: "60-70", value: 5 },
                  { category: "80+", value: 0 },
                ]
              : chartData.map((d) => ({
                  category: d.category,
                  value: d.value,
                }));

          chartNode = chartUtils.createFrequencyPolygon(
            formattedData,
            width,
            height,
            useaxis
          );
          break;
        }

        case "Clustered Error Bar Chart": // Menambahkan case baru untuk BoxPlot
          // Ambil data box plot jika tidak ada data default
          const clusteredErrorBardata =
            chartData.length === 0
              ? [
                  { category: "A", subcategory: "A1", value: 20, error: 2 },
                  { category: "A", subcategory: "A2", value: 30, error: 3 },
                  { category: "A", subcategory: "A3", value: 50, error: 1 },
                  { category: "B", subcategory: "A1", value: 25, error: 2 },
                  { category: "B", subcategory: "A2", value: 35, error: 3 },
                  { category: "B", subcategory: "A3", value: 53, error: 1 },
                  { category: "C", subcategory: "A1", value: 22, error: 2 },
                  { category: "C", subcategory: "A2", value: 40, error: 1 },
                  { category: "C", subcategory: "A3", value: 49, error: 3 },
                ]
              : chartData.map((d) => ({
                  category: d.category || "", // Gunakan category untuk mengganti x
                  subcategory: d.color || "",
                  value: d.value, // Gunakan value untuk mengganti y
                  error: 2,
                }));

          // Memanggil fungsi untuk membuat BoxPlot
          chartNode = chartUtils.createClusteredErrorBarChart(
            clusteredErrorBardata, // Data untuk Box Plot
            width,
            height,
            useaxis // Pilihan untuk menampilkan sumbu
          );
          break;

        case "Scatter Plot Matrix":
          const scatterPlotMatrixData =
            chartData.length === 0
              ? [
                  { A: 15, B: 50, C: 20 },
                  { A: 20, B: 200, C: 30 },
                  { A: 60, B: 100, C: 70 },
                  { A: 200, B: 325, C: 180 },
                  { A: 80, B: 150, C: 60 },
                  { A: 130, B: 275, C: 110 },
                ]
              : chartData.map((d) => {
                  // Dinamis: Ambil semua nilai bottom yang ada
                  const transformedData: { [key: string]: any } = {};

                  // Memetakan variabel bottom ke dalam format A, B, C, dst.
                  bottomVariables.forEach((variable, i) => {
                    transformedData[`bottom_${i}`] =
                      Number(d[`bottom_${i}`]) || 0;
                  });

                  return transformedData;
                });

          chartNode = chartUtils.createScatterPlotMatrix(
            scatterPlotMatrixData, // Data untuk Scatter Plot Matrix
            width,
            height,
            useaxis
          );
          break;

        case "Stacked Histogram":
          const stackedHistogramData =
            chartData.length === 0
              ? [
                  { value: 10, category: "A" },
                  { value: 12, category: "B" },
                  { value: 15, category: "A" },
                  { value: 18, category: "C" },
                  { value: 20, category: "B" },
                  { value: 25, category: "C" },
                  { value: 30, category: "A" },
                  { value: 10, category: "B" },
                  { value: 12, category: "C" },
                  { value: 15, category: "A" },
                  { value: 22, category: "B" },
                  { value: 28, category: "C" },
                  { value: 32, category: "A" },
                  { value: 35, category: "B" },
                  { value: 38, category: "C" },
                ]
              : chartData.map((d) => ({
                  category: d.color || "unknown", // Gunakan category untuk mengganti x
                  // subcategory: d.color || "",
                  value: Number(d.bottom_0), // Gunakan value untuk mengganti y
                  // error: 2,
                }));

          chartNode = chartUtils.createStackedHistogram(
            stackedHistogramData, // Data untuk Scatter Plot Matrix
            width,
            height
          );
          break;

        case "Frequency Polygon":
          const frequencyPolygonData =
            chartData.length === 0
              ? [
                  { category: "-0", value: 0 },
                  { category: "0-10", value: 5 },
                  { category: "10-20", value: 15 },
                  { category: "20-30", value: 25 },
                  { category: "30-40", value: 30 },
                  { category: "40-50", value: 20 },
                  { category: "50-60", value: 10 },
                  { category: "60-70", value: 5 },
                  { category: "80+", value: 0 },
                ]
              : [];

          chartNode = chartUtils.createFrequencyPolygon(
            frequencyPolygonData, // Data untuk Scatter Plot Matrix
            width,
            height
          );
          break;

        case "Clustered Boxplot":
          const clusteredBoxplotData =
            chartData.length === 0
              ? [
                  { category: "A", subcategory: "X", value: 10 },
                  { category: "A", subcategory: "X", value: 12 },
                  { category: "A", subcategory: "Y", value: 15 },
                  { category: "A", subcategory: "Y", value: 18 },
                  { category: "B", subcategory: "X", value: 20 },
                  { category: "B", subcategory: "X", value: 25 },
                  { category: "B", subcategory: "Y", value: 30 },
                  { category: "B", subcategory: "Y", value: 35 },
                ]
              : chartData.map((d) => ({
                  category: d.category,
                  subcategory: d.color || "",
                  value: d.value,
                }));

          chartNode = chartUtils.createClusteredBoxplot(
            clusteredBoxplotData,
            width,
            height,
            useaxis
          );
          break;

        case "1-D Boxplot": // Menambahkan case baru untuk BoxPlot
          // Ambil data box plot jika tidak ada data default
          const oneDBoxPlotData =
            chartData.length === 0
              ? [
                  { value: 20 },
                  { value: 40 },
                  { value: 60 },
                  { value: 80 },
                  { value: 30 },
                  { value: 50 },
                  { value: 70 },
                  { value: 90 },
                ]
              : chartData.map((d) => ({
                  value: d.value, // Gunakan value untuk mengganti y
                }));

          // Memanggil fungsi untuk membuat BoxPlot
          chartNode = chartUtils.create1DBoxplot(
            oneDBoxPlotData, // Data untuk Box Plot
            width,
            height,
            useaxis // Pilihan untuk menampilkan sumbu
          );
          break;

        case "Simple Range Bar": // Menambahkan case baru untuk BoxPlot
          // Ambil data box plot jika tidak ada data default
          const simpleRangeBarData =
            chartData.length === 0
              ? [
                  { category: "Jan", high: 100, low: 50, close: 75 },
                  { category: "Feb", high: 110, low: 60, close: 80 },
                  { category: "Mar", high: 120, low: 70, close: 95 },
                  { category: "Apr", high: 130, low: 80, close: 100 },
                  { category: "May", high: 125, low: 75, close: 110 },
                  { category: "Jun", high: 140, low: 90, close: 120 },
                  { category: "Jul", high: 150, low: 100, close: 130 },
                  { category: "Aug", high: 145, low: 95, close: 125 },
                  { category: "Sep", high: 135, low: 85, close: 115 },
                  { category: "Oct", high: 125, low: 75, close: 105 },
                  { category: "Nov", high: 115, low: 65, close: 95 },
                  { category: "Dec", high: 105, low: 55, close: 85 },
                ]
              : chartData.map((d) => ({
                  category: d.bottom_0 || "unknown",
                  high: d.high_0 || null,
                  low: d.low_0 || null,
                  close: d.close_0 || null,
                }));
          // Memanggil fungsi untuk membuat BoxPlot
          chartNode = chartUtils.createSimpleRangeBar(
            simpleRangeBarData, // Data untuk Box Plot
            width,
            height,
            useaxis // Pilihan untuk menampilkan sumbu
          );
          break;

        case "Clustered Range Bar": // Menambahkan case baru untuk BoxPlot
          // Ambil data box plot jika tidak ada data default
          const clusteredRangeBarData =
            chartData.length === 0
              ? [
                  {
                    category: "A",
                    subcategory: "X",
                    low: 20,
                    high: 50,
                    close: 35,
                  },
                  {
                    category: "A",
                    subcategory: "Y",
                    low: 25,
                    high: 55,
                    close: 40,
                  },
                  {
                    category: "B",
                    subcategory: "X",
                    low: 15,
                    high: 45,
                    close: 30,
                  },
                  {
                    category: "B",
                    subcategory: "Y",
                    low: 18,
                    high: 48,
                    close: 33,
                  },
                  {
                    category: "C",
                    subcategory: "X",
                    low: 22,
                    high: 60,
                    close: 42,
                  },
                  {
                    category: "C",
                    subcategory: "Y",
                    low: 27,
                    high: 65,
                    close: 46,
                  },
                  {
                    category: "D",
                    subcategory: "X",
                    low: 12,
                    high: 40,
                    close: 28,
                  },
                  {
                    category: "D",
                    subcategory: "Y",
                    low: 14,
                    high: 42,
                    close: 30,
                  },
                  {
                    category: "E",
                    subcategory: "X",
                    low: 30,
                    high: 70,
                    close: 50,
                  },
                  {
                    category: "E",
                    subcategory: "Y",
                    low: 35,
                    high: 75,
                    close: 55,
                  },
                ]
              : chartData.map((d) => ({
                  category: d.bottom_0 || "unknown",
                  subcategory: d.color || "unknown",
                  high: d.high_0 || 0,
                  low: d.low_0 || 0,
                  close: d.close_0 || 0,
                }));
          // Memanggil fungsi untuk membuat BoxPlot
          chartNode = chartUtils.createClusteredRangeBar(
            clusteredRangeBarData, // Data untuk Box Plot
            width,
            height,
            useaxis // Pilihan untuk menampilkan sumbu
          );
          break;

        case "High-Low-Close Chart": // Menambahkan case baru untuk BoxPlot
          // Ambil data box plot jika tidak ada data default
          const highLowCloseBarData =
            chartData.length === 0
              ? [
                  { category: "Jan", high: 100, low: 50, close: 75 },
                  { category: "Feb", high: 110, low: 60, close: 80 },
                  { category: "Mar", high: 120, low: 70, close: 95 },
                  { category: "Apr", high: 130, low: 80, close: 100 },
                  { category: "May", high: 125, low: 75, close: 110 },
                  { category: "Jun", high: 140, low: 90, close: 120 },
                  { category: "Jul", high: 150, low: 100, close: 130 },
                  { category: "Aug", high: 145, low: 95, close: 125 },
                  { category: "Sep", high: 135, low: 85, close: 115 },
                  { category: "Oct", high: 125, low: 75, close: 105 },
                  { category: "Nov", high: 115, low: 65, close: 95 },
                  { category: "Dec", high: 105, low: 55, close: 85 },
                ]
              : chartData.map((d) => ({
                  category: d.bottom_0 || "unknown",
                  high: d.high_0 || 0,
                  low: d.low_0 || 0,
                  close: d.close_0 || 0,
                }));
          // Memanggil fungsi untuk membuat BoxPlot
          chartNode = chartUtils.createHighLowCloseChart(
            highLowCloseBarData, // Data untuk Box Plot
            width,
            height,
            useaxis // Pilihan untuk menampilkan sumbu
          );
          break;

        case "Difference Area": // Menambahkan case baru untuk BoxPlot
          // Ambil data box plot jika tidak ada data default
          const differencedAreaData =
            chartData.length === 0
              ? [
                  { category: "A", value0: 62.7, value1: 63.4 },
                  { category: "B", value0: 59.9, value1: 58 },
                  { category: "C", value0: 59.1, value1: 53.3 },
                  { category: "D", value0: 58.8, value1: 55.7 },
                  { category: "E", value0: 58.7, value1: 64.2 },
                  { category: "F", value0: 57, value1: 58.8 },
                  { category: "G", value0: 56.7, value1: 57.9 },
                  { category: "H", value0: 56.8, value1: 61.8 },
                  { category: "I", value0: 56.7, value1: 69.3 },
                  { category: "J", value0: 60.1, value1: 71.2 },
                  { category: "K", value0: 61.1, value1: 68.7 },
                  { category: "L", value0: 61.5, value1: 61.8 },
                  { category: "M", value0: 64.3, value1: 63 },
                  { category: "N", value0: 67.1, value1: 66.9 },
                  { category: "O", value0: 64.6, value1: 61.7 },
                  { category: "P", value0: 61.6, value1: 61.8 },
                  { category: "Q", value0: 61.1, value1: 62.8 },
                  { category: "R", value0: 59.2, value1: 60.8 },
                  { category: "S", value0: 58.9, value1: 62.1 },
                  { category: "T", value0: 57.2, value1: 65.1 },
                ]
              : chartData.map((d) => ({
                  category: d.bottom_0 || "unknown",
                  value0: d.low_0 || null,
                  value1: d.high_0 || null,
                }));
          // Memanggil fungsi untuk membuat BoxPlot
          chartNode = chartUtils.createDifferenceArea(
            differencedAreaData, // Data untuk Box Plot
            width,
            height
            // useaxis // Pilihan untuk menampilkan sumbu
          );
          // console.log(y.range(), y.domain());
          console.log(d3.select("#above").node());
          console.log(d3.select("#below").node());
          break;

        case "Vertical Bar & Line Chart":
          const barAndLineData =
            chartData.length === 0
              ? [
                  { category: "A", barValue: 20, lineValue: 30 },
                  { category: "B", barValue: 40, lineValue: 50 },
                  { category: "C", barValue: 60, lineValue: 70 },
                  { category: "D", barValue: 40, lineValue: 30 },
                  { category: "E", barValue: 30, lineValue: 30 },
                  { category: "F", barValue: 70, lineValue: 80 },
                ]
              : chartData.map((d) => ({
                  category: d.category || "unknown",
                  barValue: Number(d.value),
                  lineValue: Number(d.side2),
                }));

          chartNode = chartUtils.createBarAndLineChart(
            barAndLineData,
            width,
            height,
            useaxis
          );
          break;

        case "Dual Axes Scatter Plot":
          const dualAxesScatterPlotData =
            chartData.length === 0
              ? [
                  { x: 6, y1: 22, y2: 75 }, // Data pertama
                  { x: 8, y1: 25, y2: 78 },
                  { x: 10, y1: 28, y2: 80 },
                  { x: 12, y1: 30, y2: 82 },
                  { x: 14, y1: 26, y2: 79 },
                  { x: 16, y1: 24, y2: 74 },
                  { x: 18, y1: 27, y2: 76 },
                  { x: 20, y1: 25, y2: 70 },
                ]
              : chartData.map((d) => ({
                  x: Number(d.category),
                  y1: Number(d.value),
                  y2: Number(d.side2),
                }));

          chartNode = chartUtils.createDualAxesScatterPlot(
            dualAxesScatterPlotData,
            width,
            height,
            useaxis
          );
          break;

        case "Drop Line Chart":
          const dropLineChartData =
            chartData.length === 0
              ? [
                  { x: "A", y: 70, category: "1" },
                  { x: "A", y: 15, category: "2" },
                  { x: "A", y: 25, category: "3" },
                  { x: "B", y: 25, category: "1" },
                  { x: "B", y: 45, category: "3" },
                  { x: "C", y: 40, category: "1" },
                  { x: "D", y: 25, category: "1" },
                  { x: "D", y: 60, category: "2" },
                  { x: "E", y: 20, category: "1" },
                  { x: "E", y: 65, category: "2" },
                  { x: "E", y: 80, category: "3" },
                ]
              : chartData.map((d) => ({
                  x: d.category,
                  y: Number(d.value),
                  category: d.color || "unknown",
                }));

          chartNode = chartUtils.createDropLineChart(
            dropLineChartData,
            width,
            height,
            useaxis
          );
          break;

        case "Summary Point Plot":
          const statistics = "median";
          chartNode =
            chartData.length === 0
              ? chartUtils.createSummaryPointPlot(
                  [
                    { category: "A", value: 25 },
                    { category: "A", value: 30 },
                    { category: "A", value: 10 },
                    { category: "B", value: 28 },
                    { category: "B", value: 22 },
                    { category: "C", value: 29 },
                    { category: "C", value: 32 },
                    { category: "D", value: 33 },
                  ],
                  width,
                  height,
                  useaxis,
                  statistics
                )
              : chartUtils.createSummaryPointPlot(
                  chartData,
                  width,
                  height,
                  useaxis
                );
          break;

        // case "Word Cloud": // Menambahkan case baru untuk WordCloud
        //   // Ambil data Word Cloud jika tidak ada data default
        //   const WordCloudData =
        //     chartData.length === 0
        //       ? [
        //           "freedom",
        //           "justice",
        //           "hope",
        //           "equality",
        //           "peace",
        //           "love",
        //           "future",
        //           "strength",
        //           "courage",
        //           "change",
        //           "believe",
        //           "together",
        //           "unity",
        //           "progress",
        //           "rights",
        //           "voice",
        //           "inspire",
        //           "power",
        //           "action",
        //           "liberty",
        //           "truth",
        //           "vision",
        //           "solidarity",
        //           "respect",
        //           "opportunity",
        //           "compassion",
        //           "dignity",
        //           "empower",
        //           "diversity",
        //           "inclusion",
        //           "harmony",
        //           "bravery",
        //           "dream",
        //           "empowerment",
        //           "respect",
        //           "transformation",
        //           "justice",
        //           "courageous",
        //           "success",
        //           "tolerance",
        //           "love",
        //           "equality",
        //           "togetherness",
        //           "sustainability",
        //           "strength",
        //           "freedom",
        //           "grace",
        //           "compassion",
        //           "positivity",
        //           "honor",
        //           "equality",
        //           "hopeful",
        //           "change",
        //           "belonging",
        //           "resilience",
        //           "opportunity",
        //           "solidarity",
        //           "endurance",
        //           "achieve",
        //           "perseverance",
        //           "justice",
        //           "unity",
        //           "growth",
        //           "excellence",
        //           "balance",
        //           "progress",
        //           "healing",
        //           "visionary",
        //           "potential",
        //           "action",
        //           "purpose",
        //           "liberation",
        //           "peaceful",
        //           "dignified",
        //           "openness",
        //           "knowledge",
        //           "wisdom",
        //           "contribution",
        //           "forward",
        //           "enlightenment",
        //           "optimism",
        //           "legacy",
        //           "respectful",
        //           "development",
        //           "inspiration",
        //           "leadership",
        //           "positivity",
        //           "sacrifice",
        //           "honesty",
        //           "wellbeing",
        //           "together",
        //           "unity",
        //         ].flatMap((word) => Array(25).fill(word))
        //       : []; // If chartData is available, use it as the data source.

        //   // Memanggil fungsi untuk membuat Word Cloud
        //   chartNode = chartUtils.createWordCloud(
        //     WordCloudData, // Data untuk Word Cloud
        //     width,
        //     height,
        //     {
        //       size: (group) => group.length, // Calculate the size based on the frequency of each word
        //       word: (d) => d, // The word itself
        //       marginTop: 10, // Margin for top
        //       marginRight: 10, // Margin for right
        //       marginBottom: 10, // Margin for bottom
        //       marginLeft: 10, // Margin for left
        //       // maxWords: 100, // Maximum number of words in the Word Cloud
        //       fontFamily: "sans-serif", // Font family
        //       fontScale: 5, // Font scaling factor
        //       fill: "black", // Word color
        //       padding: 5, // Padding between words
        //       rotate: 0, // Rotation for words (can be dynamic if needed)
        //     }
        //   );
        //   break;

        default:
          console.error("Unknown chart type:", chartType);
          break;
      }

      // Jika chartNode valid, append ke svgRef
      if (chartNode && svgRef.current) {
        svgRef.current.appendChild(chartNode); // Menambahkan node hasil dari fungsi ke dalam svgRef
      }
    }
  }, [
    chartType,
    sideVariables,
    side2Variables,
    bottomVariables,
    colorVariables,
    filterVariables,
    lowVariables,
    highVariables,
    closeVariables,
    data,
    useaxis,
    width,
    height,
    variables,
  ]);

  return (
    <div className="flex justify-center items-center p-5 border-2 border-gray-200 rounded-lg">
      <div className="relative bg-gray-100 border-2 border-gray-300 rounded-lg p-2 w-[780px] h-[550px] flex flex-col justify-between">
        <h3 className="text-lg font-semibold text-black text-center mb-4">
          CHART PREVIEW
        </h3>

        {/* Label "Set Color" */}
        {chartVariableConfig[chartType]?.color &&
          (chartVariableConfig[chartType].color?.min !== 0 ||
            chartVariableConfig[chartType].color?.max !== 0) && (
            <div
              className="absolute top-4 right-4 p-2 border border-dashed border-gray-400 rounded-lg text-gray-500"
              onDrop={(e) => handleDrop(e, "color")}
              onDragOver={handleDragOver}
            >
              {colorVariables.length === 0 ? (
                <div className="bg-gray-300 text-gray-500 p-2 rounded-md text-sm shadow-md">
                  Group by
                </div>
              ) : (
                colorVariables.map((variable, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 text-white p-2 rounded-md text-sm shadow-md"
                  >
                    {variable}
                  </div>
                ))
              )}
            </div>
          )}

        {/* Label "Filter" */}
        {chartVariableConfig[chartType]?.filter &&
          (chartVariableConfig[chartType].filter?.min !== 0 ||
            chartVariableConfig[chartType].filter?.max !== 0) && (
            <div
              className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 flex justify-center items-center w-[100px] h-auto"
              onDrop={(e) => handleDrop(e, "filter")}
              onDragOver={handleDragOver}
            >
              {filterVariables.length === 0 ? (
                <div className="bg-gray-300 text-gray-500 p-2 rounded-md text-sm shadow-md rotate-90 w-full text-center">
                  Filter?
                </div>
              ) : (
                filterVariables.map((variable, index) => (
                  <div
                    key={index}
                    className="bg-green-500 text-white p-2 rounded-md text-sm shadow-md rotate-90 w-full text-center"
                  >
                    {variable}
                  </div>
                ))
              )}
            </div>
          )}

        {/* Label "Side" */}
        {chartVariableConfig[chartType]?.side &&
          (chartVariableConfig[chartType].side?.min !== 0 ||
            chartVariableConfig[chartType].side?.max !== 0) && (
            <div
              className="absolute top-1/2 left-[-60px] transform -translate-y-1/2 rotate-90 flex flex-wrap space-x-1 w-[200px] justify-center items-center border border-gray-400 rounded-md p-1 cursor-pointer"
              onDrop={(e) => handleDrop(e, "side")}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => handleOpenModal("side")} // Bisa klik di mana saja
            >
              {sideVariables.length === 0 ? (
                <div className="bg-gray-300 text-gray-500 p-2 rounded-md text-sm shadow-md w-full text-center">
                  No variables selected
                </div>
              ) : (
                (() => {
                  const maxWidth = 100; // Lebar maksimal container
                  let totalWidth = 0;
                  let displayedVars = [];
                  const spaceBetween = 4;
                  let hiddenCount = 0;

                  const estimateButtonWidth = (text: string) =>
                    Math.max(40, text.length * 8);

                  for (let i = 0; i < sideVariables.length; i++) {
                    let btnWidth = estimateButtonWidth(sideVariables[i]);

                    if (totalWidth + btnWidth + spaceBetween <= maxWidth) {
                      displayedVars.push(sideVariables[i]);
                      totalWidth += btnWidth + spaceBetween;
                    } else {
                      hiddenCount = sideVariables.length - i;
                      break;
                    }
                  }

                  return (
                    <div className="flex flex-wrap space-x-1 justify-center w-full">
                      {/* Semua ini bisa diklik karena ada onClick di parent */}
                      {displayedVars.map((variable, index) => (
                        <div
                          key={index}
                          className="bg-blue-500 text-white p-2 rounded-md text-sm shadow-md text-center"
                          style={{ minWidth: "40px" }}
                        >
                          {variable}
                        </div>
                      ))}

                      {hiddenCount > 0 && (
                        <div className="bg-gray-500 text-white p-2 rounded-md text-sm shadow-md text-center">
                          +{hiddenCount} more
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          )}

        {/* Label "Side2" */}
        {chartVariableConfig[chartType]?.side2 &&
          (chartVariableConfig[chartType].side2?.min !== 0 ||
            chartVariableConfig[chartType].side2?.max !== 0) && (
            <div
              className="absolute top-1/2 right-[-60px] transform -translate-y-1/2 rotate-90 flex flex-wrap space-x-1 w-[200px] justify-center items-center border border-gray-400 rounded-md p-1 cursor-pointer"
              onDrop={(e) => handleDrop(e, "side2")}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => handleOpenModal("side2")} // Bisa klik di mana saja
            >
              {side2Variables.length === 0 ? (
                <div className="bg-gray-300 text-gray-500 p-2 rounded-md text-sm shadow-md w-full text-center">
                  No variables selected
                </div>
              ) : (
                (() => {
                  const maxWidth = 100; // Lebar maksimal container
                  let totalWidth = 0;
                  let displayedVars = [];
                  const spaceBetween = 4;
                  let hiddenCount = 0;

                  const estimateButtonWidth = (text: string) =>
                    Math.max(40, text.length * 8);

                  for (let i = 0; i < side2Variables.length; i++) {
                    let btnWidth = estimateButtonWidth(side2Variables[i]);

                    if (totalWidth + btnWidth + spaceBetween <= maxWidth) {
                      displayedVars.push(side2Variables[i]);
                      totalWidth += btnWidth + spaceBetween;
                    } else {
                      hiddenCount = side2Variables.length - i;
                      break;
                    }
                  }

                  return (
                    <div className="flex flex-wrap space-x-1 justify-center w-full">
                      {/* Semua ini bisa diklik karena ada onClick di parent */}
                      {displayedVars.map((variable, index) => (
                        <div
                          key={index}
                          className="bg-blue-500 text-white p-2 rounded-md text-sm shadow-md text-center"
                          style={{ minWidth: "40px" }}
                        >
                          {variable}
                        </div>
                      ))}

                      {hiddenCount > 0 && (
                        <div className="bg-gray-500 text-white p-2 rounded-md text-sm shadow-md text-center">
                          +{hiddenCount} more
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          )}

        {/* Label "Bottom" */}
        {chartVariableConfig[chartType]?.bottom &&
          (chartVariableConfig[chartType].bottom?.min !== 0 ||
            chartVariableConfig[chartType].bottom?.max !== 0) && (
            <div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center space-x-1 w-[200px] border border-gray-400 rounded-md p-1 cursor-pointer"
              onDrop={(e) => handleDrop(e, "bottom")}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => handleOpenModal("bottom")} // Klik bisa di mana saja
            >
              {bottomVariables.length === 0 ? (
                <div className="bg-gray-300 text-gray-500 p-2 rounded-md text-sm shadow-md w-full text-center">
                  No variables selected
                </div>
              ) : (
                (() => {
                  const maxWidth = 100;
                  let totalWidth = 0;
                  let displayedVars = [];
                  const spaceBetween = 4;
                  let hiddenCount = 0;

                  const estimateButtonWidth = (text: string) =>
                    Math.max(40, text.length * 8);

                  for (let i = 0; i < bottomVariables.length; i++) {
                    let btnWidth = estimateButtonWidth(bottomVariables[i]);

                    if (totalWidth + btnWidth + spaceBetween <= maxWidth) {
                      displayedVars.push(bottomVariables[i]);
                      totalWidth += btnWidth + spaceBetween;
                    } else {
                      hiddenCount = bottomVariables.length - i;
                      break;
                    }
                  }

                  return (
                    <div className="flex flex-wrap space-x-1 justify-center w-full">
                      {/* Semua ini bisa diklik karena ada onClick di parent */}
                      {displayedVars.map((variable, index) => (
                        <div
                          key={index}
                          className="bg-blue-500 text-white p-2 rounded-md text-sm shadow-md text-center"
                          style={{ minWidth: "40px" }}
                        >
                          {variable}
                        </div>
                      ))}

                      {hiddenCount > 0 && (
                        <div className="bg-gray-500 text-white p-2 rounded-md text-sm shadow-md text-center">
                          +{hiddenCount} more
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          )}

        {/* Label "High" */}
        {(() => {
          const variables = [];

          if (
            (chartVariableConfig[chartType]?.high?.min ?? 0) >= 1 ||
            (chartVariableConfig[chartType]?.high?.max ?? 0) >= 1
          ) {
            variables.push("High Variable?");
          }
          if (
            (chartVariableConfig[chartType]?.low?.min ?? 0) >= 1 ||
            (chartVariableConfig[chartType]?.low?.max ?? 0) >= 1
          ) {
            variables.push("Low Variable?");
          }
          if (
            (chartVariableConfig[chartType]?.close?.min ?? 0) >= 1 ||
            (chartVariableConfig[chartType]?.close?.max ?? 0) >= 1
          ) {
            variables.push("Close Variable?");
          }

          if (variables.length === 0) return null;

          const containerWidth = 400; // Lebar maksimum kontainer
          const itemWidth = `${(containerWidth - 20) / variables.length}px`; // Lebar tiap item berdasarkan jumlah

          return (
            <div className="absolute top-1/2 left-[-160px] transform -translate-y-1/2 rotate-90 flex flex-wrap justify-center items-center w-[400px] gap-1 cursor-pointer">
              {variables.map((label, index) => {
                // Create the simplified drop zone for handleDrop (e.g. "high", "low", "close")
                const dropZone = label
                  .toLowerCase()
                  .replace(" variable?", "") as "high" | "low" | "close";

                return (
                  <div
                    key={index}
                    className={`${
                      dropZone === "high" && highVariables.length > 0
                        ? "bg-blue-500 text-white border-blue-500"
                        : dropZone === "low" && lowVariables.length > 0
                        ? "bg-blue-500 text-white border-blue-500"
                        : dropZone === "close" && closeVariables.length > 0
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-300 text-gray-500 border-gray-500"
                    } p-2 rounded-md text-sm shadow-md text-center border border-dashed`}
                    style={{ width: itemWidth }} // Set width based on number of elements
                    onDrop={(e) => handleDrop(e, dropZone)} // Pass simplified drop zone (e.g. "high", "low", "close")
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => handleOpenModal(dropZone)} // Klik bisa di mana saja
                  >
                    {/* Menampilkan variabel yang sudah di-drop atau label default */}
                    {
                      dropZone === "high" && highVariables.length > 0
                        ? highVariables.join(", ") // Jika ada variabel, tampilkan
                        : dropZone === "low" && lowVariables.length > 0
                        ? lowVariables.join(", ") // Jika ada variabel, tampilkan
                        : dropZone === "close" && closeVariables.length > 0
                        ? closeVariables.join(", ") // Jika ada variabel, tampilkan
                        : label // Jika tidak ada variabel, tampilkan label default
                    }
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Modal untuk semua variabel */}
        {modalState.isOpen && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center rounded-lg">
            <div className="bg-white p-4 rounded-lg shadow-lg w-64">
              <h2 className="text-lg font-bold mb-2 text-center">
                All{" "}
                {modalState.type === "side"
                  ? "Side"
                  : modalState.type === "side2"
                  ? "Side2"
                  : modalState.type === "bottom"
                  ? "Bottom"
                  : modalState.type === "color"
                  ? "Color"
                  : modalState.type === "filter"
                  ? "Filter"
                  : modalState.type === "low"
                  ? "Low"
                  : modalState.type === "high"
                  ? "High"
                  : modalState.type === "close"
                  ? "Close"
                  : "Undefined"}{" "}
                Variables
              </h2>
              <ul className="space-y-1">
                {variablesToShow.map((variable: string, index: number) => (
                  <li
                    key={index}
                    className="p-1 bg-gray-200 rounded text-sm flex justify-between items-center"
                  >
                    <span>{variable}</span>
                    <button
                      className="text-red-500 font-bold text-xs"
                      onClick={() =>
                        handleRemoveVariable(
                          modalState.type as
                            | "side"
                            | "bottom"
                            | "low"
                            | "high"
                            | "close"
                            | "side2",
                          index
                        )
                      }
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded w-full"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* SVG Chart */}
        <svg
          ref={svgRef}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 650 500"
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      </div>
    </div>
  );
};

export default ChartPreview;
