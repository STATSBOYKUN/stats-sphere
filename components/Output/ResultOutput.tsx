"use client";
import React from "react";
import DataTableRenderer from "@/components/Output/Table/data-table";
import { Card } from "@/components/ui/card";
import { useResultStore } from "@/stores/useResultStore";
import GeneralChartContainer from "./Chart/GeneralChartContainer";

const ResultOutput: React.FC = () => {
  const { logs } = useResultStore();

  return (
      <div className="p-6 space-y-8">
        {logs.map((log) => (
            <div key={log.id} className="space-y-6">
              <div id="log" className="text-sm text-gray-600">
                Log {log.id}: {log.log}
              </div>
              {log.analytics?.map((analytic) => (
                  <Card key={analytic.id} className="p-6 shadow-md">
                    <div className="text-xl font-bold text-left mb-4">
                      {analytic.title}
                    </div>
                    {analytic.note && (
                        <div className="text-sm italic text-gray-500 text-center mb-6">
                          {analytic.note}
                        </div>
                    )}
                    {(() => {
                      const renderedComponents = new Set<string>();
                      return analytic.statistics?.map((stat) => {
                        const isFirstAppearance = !renderedComponents.has(
                            stat.components
                        );
                        if (isFirstAppearance) {
                          renderedComponents.add(stat.components);
                        }
                        console.log("Stat Output Data:", stat.output_data);
                        return (
                            <div key={stat.id} className="space-y-4">
                              {isFirstAppearance && (
                                  <div className="text-base font-semibold mt-6 mb-2">
                                    {stat.components}
                                  </div>
                              )}

                              <div
                                  id={`output-${analytic.id}-${stat.id}`}
                                  className="mb-4"
                              >
                                {(() => {
                                  const parsedData =
                                      typeof stat.output_data === "string"
                                          ? JSON.parse(stat.output_data)
                                          : stat.output_data;
                                  if (parsedData.tables) {
                                    return (
                                        <DataTableRenderer data={stat.output_data} />
                                    );
                                  } else if (parsedData.charts) {
                                    return (
                                        <GeneralChartContainer
                                            data={stat.output_data}
                                        />
                                    );
                                  } else {
                                    return (
                                        <div className="text-sm text-red-500">
                                          Data tidak valid
                                        </div>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                        );
                      }) || null;
                    })()}
                  </Card>
              ))}
            </div>
        ))}
      </div>
  );
};

export default ResultOutput;