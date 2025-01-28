// import React from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Bar } from "react-chartjs-2";

// import { populateData, populateOptions } from "components/Charts/Pivot";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const Chart = (props) => {
//   return (
// <Bar
//       data={populateData(props)}
//       options={populateOptions(props)}
//       height={250}
//     />
//   );
// };

// export default Chart;

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import { populateData, populateOptions } from "./Pivot";

// import { populateData, populateOptions } from "components/Charts/Pivot";

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// interface ChartProps {
//   [key: string]: any; // Replace with specific props if available
// }

interface ChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    tension?: number;
  }[];
  title: string;
  yLabel: string;
  xLabel: string;
}

const Chart: React.FC<ChartProps> = ({
  labels,
  datasets,
  title,
  xLabel,
  yLabel,
}) => {
  const data = {
    labels,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      fill: false,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: yLabel,
        },
      },
      x: {
        title: {
          display: true,
          text: xLabel,
        },
      },
    },
  };

  return (
    <>
      <Line data={data} options={options} height={450} />
      {/* <Line
        data={populateData(props)}
        options={populateOptions(props)}
        height={250}
      />
      <Bar
        data={populateData(props)}
        options={populateOptions(props)}
        height={250}
      /> */}
    </>
  );
};

export default Chart;
