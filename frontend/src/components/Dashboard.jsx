import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';


const chartSetting = {
  xAxis: [
    {
      label: 'distance (kms)',
    },
  ],
  width: 350,
  height: 300,
};
const dataset = [
  {
    kms: 5,
   
    Day: 'Sun',
  },
  {
    kms: 10,
    Day: 'Mon',
  },
  {
    kms: 15,
    Day: 'Tue',
  },
  {
    kms: 3,
    Day: 'Wed',
  },
  {
    kms: 17,
    Day: 'Thu',
  },
  {
    kms: 8,
    Day: 'Fri',
  },
  {
    kms: 27,
    Day: 'Sat',
  },
  
];

const valueFormatter = (value) => `${value}kms`;

export default function HorizontalBars() {
  return (
    
    <BarChart 
      dataset={dataset}
      yAxis={[{ scaleType: 'band', dataKey: 'Day' }]}
      series={[{ dataKey: 'kms', label: 'Total Distance', valueFormatter }]}
      layout="horizontal"
      {...chartSetting}
    />
   
  );
}