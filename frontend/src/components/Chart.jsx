import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from 'chart.js/auto';
import { FaDisplay } from "react-icons/fa6";
import { Colors, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DonutChartPros from "./Donutchartpros";

registerables.push(ChartDataLabels);

function ChartBar() {
  let xValues = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let yValues = [23, 55, 66, 66, 77, 88, 22];
  let barColor = ["Green"];

  const data = {
    labels: xValues,
    datasets: [
      {
        backgroundColor: barColor,
        data: yValues,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: "category",
        axis: "x",
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Weekly Kms",
        font: {
          size: 24,
          weight: "bold",
        },
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        formatter: function(value) {
          return value;
        }
      }
    },
    legend: {
      display: true,
    },
  };

  return (
    <div className="w-1/2 barchart">
      <Bar data={data} options={options} />
      {/* <DonutChartPros /> */}
    </div>
  );
}

export default ChartBar;