'use client';

import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface SalesData {
  name: string;
  total: number;
}

interface OverviewProps {
  data?: SalesData[];
}

export function Overview({ data }: OverviewProps) {
  // 如果没有提供数据，使用默认的示例数据
  const chartData = data || [
    { name: '1月', total: 1250 },
    { name: '2月', total: 3200 },
    { name: '3月', total: 2900 },
    { name: '4月', total: 4100 },
    { name: '5月', total: 4800 },
    { name: '6月', total: 3800 },
    { name: '7月', total: 5200 },
    { name: '8月', total: 6100 },
    { name: '9月', total: 4800 },
    { name: '10月', total: 5600 },
    { name: '11月', total: 6800 },
    { name: '12月', total: 7900 },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  );
}
