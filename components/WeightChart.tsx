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

export default function WeightChart({
  data,
  startWeight,
  goalWeight,
  startDate,
  goalDate,
}: Props) {
  // Zet data om naar timestamps
  const parsedData = data.map((entry) => ({
    timestamp: new Date(entry.date).getTime(),
    Gewicht: entry.weight,
  }));

  // Doellijn
  const goalLine =
    startWeight !== null &&
    goalWeight !== null &&
    startDate &&
    goalDate
      ? [
          {
            timestamp: new Date(startDate).getTime(),
            Gewicht: startWeight,
          },
          {
            timestamp: new Date(goalDate).getTime(),
            Gewicht: goalWeight,
          },
        ]
      : [];

  // Ticks & domain voor X-as
  const allTimestamps = [
    ...parsedData.map((d) => d.timestamp),
    ...goalLine.map((d) => d.timestamp),
  ];
  const ticks = Array.from(new Set(allTimestamps)).sort((a, b) => a - b);
  const minX = ticks[0];
  const maxX = ticks[ticks.length - 1];

  // Domain voor Y-as
  const weights = parsedData.map((d) => d.Gewicht);
  if (startWeight !== null) weights.push(startWeight);
  if (goalWeight !== null) weights.push(goalWeight);
  const minY = Math.min(...weights) - 2;
  const maxY = Math.max(...weights) + 2;

  // Formatter alleen dag-maand
  const formatTick = (ts: number) =>
    new Date(ts).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
    });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={parsedData}
        margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
      >
        <XAxis
          type="number"
          dataKey="timestamp"
          scale="time"
          domain={[minX, maxX]}
          ticks={ticks}
          interval={0}
          tickFormatter={formatTick}
          tick={{ fontSize: 10 }}    // alleen fontSize in tick
          angle={-45}                // roteren via XAxis prop
          textAnchor="end"           // alignering via XAxis prop
          tickMargin={12}
          height={50}
          stroke="#888"
        />
        <YAxis domain={[minY, maxY]} stroke="#888" fontSize={12} />
        <Tooltip labelFormatter={(value) => formatTick(value as number)} />
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
