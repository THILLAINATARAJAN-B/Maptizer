import React from "react";
import { TrendingUp } from "lucide-react";
import InsightsPanel from "../components/insights/InsightsPanel";
import { useApp } from "../context/AppContext";

const Insights = () => {
  const { selectedLocation } = useApp();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Cultural Insights
          </h1>
          <p className="mt-1 text-gray-600 max-w-xl">
            Discover trending artists, movies, and books in{" "}
            <span className="font-semibold text-orange-600">{selectedLocation?.name}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-100 text-orange-600 font-semibold shadow-sm select-none">
          <TrendingUp className="w-5 h-5" aria-hidden />
          <span>Live Insights</span>
        </div>
      </div>

      {/* InsightsPanel */}
      <InsightsPanel />
    </div>
  );
};

export default Insights;
