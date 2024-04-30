import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart  } from 'chart.js/auto';

function DonutCharts({ data, title }) {
  const options = {
    plugins: {
      title: {
        display: true,
        text: title
      },
      legend: {
        display: true
      }
    }
  };

  return (
    <div className='flex w-1/2 donutchart py-5 px-20 '>
      <Doughnut
        data={data}
        options={options}
      />
    </div>
  );
}

export default DonutCharts;