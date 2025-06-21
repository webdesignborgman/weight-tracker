// components/WeightChart.tsx
'use client';
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Props {
  data: { date: string; weight: number }[];
  startWeight: number | null;
  goalWeight: number | null;
  startDate: string;
  goalDate: string;
}

export default function WeightChart({ data, startWeight, goalWeight, startDate, goalDate }: Props) {
  const parsedData = data.map((entry) => ({
    date: entry.date,
    Gewicht: entry.weight,
  }));

  const goalLine = (startWeight !== null && goalWeight !== null && startDate && goalDate)
    ? [
        { date: startDate, Gewicht: startWeight },
        { date: goalDate, Gewicht: goalWeight },
      ]
    : [];

  const minY = Math.min(
    ...parsedData.map(d => d.Gewicht),
    startWeight ?? Infinity,
    goalWeight ?? Infinity
  ) - 2;
  const maxY = Math.max(
    ...parsedData.map(d => d.Gewicht),
    startWeight ?? -Infinity,
    goalWeight ?? -Infinity
  ) + 2;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={parsedData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
        <XAxis dataKey="date" stroke="#888" fontSize={12} />
        <YAxis domain={[minY, maxY]} stroke="#888" fontSize={12} />
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
        {goalLine.length > 0 && (
          <Line
            data={goalLine}
            type="monotone"
            dataKey="Gewicht"
            stroke="#999"
            strokeDasharray="4 4"
            dot={false}
            name="Doeltraject"
          />
        )}
        <Line
          type="monotone"
          dataKey="Gewicht"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Gewicht (kg)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
