
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SensorData } from '../types';

interface DataChartProps {
  data: SensorData[];
}

export const DataChart: React.FC<DataChartProps> = ({ data }) => {
  const chartData = data.map((d, index) => ({ ...d, name: index }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
          <XAxis dataKey="name" stroke="#a0a0a0" tick={{ fill: '#a0a0a0' }} tickLine={false} />
          <YAxis stroke="#a0a0a0" tick={{ fill: '#a0a0a0' }} tickLine={false} />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: '#2a2a2a', 
                border: '1px solid #4a4a4a',
                borderRadius: '0.5rem'
            }} 
            labelStyle={{ color: '#f0f0f0' }}
          />
          <Legend wrapperStyle={{ color: '#f0f0f0' }} />
          <Line type="monotone" dataKey="soilMoisture" name="Soil Moisture (%)" stroke="#22d3ee" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#fb923c" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#60a5fa" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
