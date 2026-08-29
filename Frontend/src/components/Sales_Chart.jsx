import React, { useMemo, useState } from "react";
import {
  TrendingUp,
  CalendarDays,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const Sales_Chart = () => {
  const [period, setPeriod] = useState("7");

  // ==========================================
  // SAMPLE SALES DATA
  // ==========================================

  const salesData = {
    7: [
      { date: "Mon", sales: 8500 },
      { date: "Tue", sales: 12000 },
      { date: "Wed", sales: 9800 },
      { date: "Thu", sales: 15400 },
      { date: "Fri", sales: 18700 },
      { date: "Sat", sales: 22100 },
      { date: "Sun", sales: 19600 },
    ],

    30: [
      { date: "Aug 1", sales: 5200 },
      { date: "Aug 5", sales: 8400 },
      { date: "Aug 10", sales: 12500 },
      { date: "Aug 15", sales: 10800 },
      { date: "Aug 20", sales: 17600 },
      { date: "Aug 25", sales: 22100 },
      { date: "Aug 29", sales: 19600 },
    ],

    90: [
      { date: "Jun", sales: 85000 },
      { date: "Jul", sales: 112000 },
      { date: "Aug", sales: 145000 },
    ],
  };

  const currentData = salesData[period];

  // ==========================================
  // TOTAL SALES
  // ==========================================

  const totalSales = useMemo(() => {
    return currentData.reduce(
      (total, item) => total + item.sales,
      0
    );
  }, [currentData]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#255DD0]">
              <TrendingUp size={19} />
            </div>

            <h2 className="text-lg font-bold text-gray-900">
              Sales Overview
            </h2>

          </div>

          <p className="mt-2 text-sm text-gray-500">
            Track your sales performance over time.
          </p>

        </div>

        {/* PERIOD SELECTOR */}

        <div className="flex items-center gap-2">

          <CalendarDays
            size={17}
            className="text-gray-400"
          />

          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value)
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
          >
            <option value="7">
              Last 7 Days
            </option>

            <option value="30">
              Last 30 Days
            </option>

            <option value="90">
              Last 3 Months
            </option>
          </select>

        </div>

      </div>

      {/* ==========================================
          TOTAL
      ========================================== */}

      <div className="mt-6">

        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Sales
        </p>

        <p className="mt-1 text-3xl font-bold text-gray-900">
          PKR {totalSales.toLocaleString()}
        </p>

      </div>

      {/* ==========================================
          CHART
      ========================================== */}

      <div className="mt-6 h-[320px] w-full">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <AreaChart
            data={currentData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
              }}
              tickFormatter={(value) =>
                `${value / 1000}k`
              }
            />

            <Tooltip
              formatter={(value) => [
                `PKR ${Number(
                  value
                ).toLocaleString()}`,
                "Sales",
              ]}
              labelStyle={{
                fontWeight: 600,
              }}
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />

            <Area
              type="monotone"
              dataKey="sales"
              stroke="#255DD0"
              fill="#255DD0"
              fillOpacity={0.08}
              strokeWidth={2}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default Sales_Chart;