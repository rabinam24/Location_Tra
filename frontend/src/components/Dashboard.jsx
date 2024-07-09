import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import axios from "axios";

const chartSetting = {
  xAxis: [
    {
      label: "distance (kms)",
    },
  ],
  width: 350,
  height: 300,
};

const valueFormatter = (value) => `${value}kms`;

// Function to get the last 7 days in the desired format
const getLast7Days = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push({
      date: date.toISOString().split('T')[0],
      Day: days[date.getDay()],
    });
  }
  return result;
};

export default function HorizontalBars() {
  const [dataset, setDataset] = useState(getLast7Days().map(day => ({ ...day, kms: null })));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/total-distances");
        const data = response.data;

        console.log("Fetched data:", data); // Log the fetched data

        if (data.length > 0) {
          const last7Days = getLast7Days();
          const formattedData = last7Days.map(day => {
            const found = data.find(item => item.date === day.date);
            return {
              ...day,
              kms: found ? found.distance : null,
            };
          });

          console.log("Formatted data:", formattedData); // Log the formatted data

          setDataset(formattedData);
        }
      } catch (error) {
        console.error("Error while fetching the weekly data from the backend:", error);
      }
    };

    fetchData();
  }, []);

  console.log("Dataset:", dataset); // Log the dataset to see what's being passed to BarChart

  return (
    <BarChart
      dataset={dataset}
      yAxis={[{ scaleType: "band", dataKey: "Day" }]}
      series={[{ dataKey: "kms", label: "Total Distance", valueFormatter }]}
      layout="horizontal"
      {...chartSetting}
    />
  );
}
