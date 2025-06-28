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
import { parseISO, format, addDays, differenceInDays } from 'date-fns';



interface Props {
  data: { date: string; taille: number }[];
  startDate: string;
  goalDate: string;
}

export default function TailleChart({ data, startDate, goalDate }: Props) {
  if (!startDate || !goalDate) return null;

  // Bouw volledige tijdlijn van start tot doel
  const start = parseISO(startDate);
  const end = parseISO(goalDate);
  const days = differenceInDays(end, start);
  const timeline: string[] = Array.from({ length: days + 1 }, (_, i) =>
    format(addDays(start, i), 'yyyy-MM-dd')
  );

  // Merge data met tijdlijn en voeg timestamp toe
  const merged = timeline.map((date) => {
    const match = data.find((d) => d.date === date);
    return {
      timestamp: new Date(date).getTime(),
      taille: match?.taille ?? null,
      isMeasurement: match != null,
    };
  });

  // Ticks enkel op meetmomenten
  const ticks = merged
    .filter((d) => d.isMeasurement)
    .map((d) => d.timestamp)
    .sort((a, b) => a - b);

  // X-as domain
  const minX = ticks[0];
  const maxX = ticks[ticks.length - 1];

  // Y-as domain (nulls genegeerd)
  const tailleValues = merged
    .map((d) => d.taille)
    .filter((v): v is number => v !== null);
  const minY = Math.min(...tailleValues) - 2;
  const maxY = Math.max(...tailleValues) + 2;

  // Formatter voor DD-MM zonder jaar
  const formatTick = (ts: number) =>
    new Date(ts).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' });

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={merged}
        margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
      >
        <XAxis
          type="number"
          dataKey="timestamp"
          scale="time"
          domain={[minX, maxX]}
          ticks={ticks}
          interval={0}
          tickFormatter={formatTick}
          tick={{ fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          tickMargin={12}
          height={50}
          stroke="#888"
        />
        <YAxis
          domain={[minY, maxY]}
          stroke="#888"
          fontSize={12}
        />
        <Tooltip
          labelFormatter={(value) => formatTick(value as number)}
        />
        <Legend verticalAlign="bottom" height={36} />

        <Line
          type="monotone"
          dataKey="taille"
          stroke="#e11d48"
          dot={{ r: 3 }}
          name="Taille (cm)"
          isAnimationActive={false}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
