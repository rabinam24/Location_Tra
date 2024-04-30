import React from 'react';
import DonutCharts from './DonutChart';

function DonutChartPros() {
  const data1 = {
    labels: ["Red", "Blue", "Yellow"],
    datasets: [{
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      data: [300, 50, 100]
    }]
  };

  const data2 = {
    labels: ["Green", "Orange", "Purple"],
    datasets: [{
      backgroundColor: ["#32CD32", "#FFA07A", "#7A288A"],
      data: [200, 150, 250]
    }]
  };

  return (
    <div className='flex w-1/2'>
      
      <DonutCharts data={data1} title="Donut Chart 1"  />
      <DonutCharts data={data2} title="Donut Chart 2"  />
      {/* //wanna add the image in the side of the donut,  */}

      <img src='../assets/react.svg' className='w-32 h-32 ml-10' alt='react logo' />
      
    </div>
  );
}

export default DonutChartPros;