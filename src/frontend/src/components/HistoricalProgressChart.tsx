import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HistoricalDataPoint {
  date: string;
  lettersLearned: number;
  accuracy: number;
}

interface HistoricalProgressChartProps {
  data: HistoricalDataPoint[];
  language: string;
}

const HistoricalProgressChart: React.FC<HistoricalProgressChartProps> = ({ data, language }) => {
  const chartData = {
    labels: data.map(point => point.date),
    datasets: [
      {
        label: 'Letters Learned',
        data: data.map(point => point.lettersLearned),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Accuracy (%)',
        data: data.map(point => point.accuracy),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#F3F4F6',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: `Historical Progress - ${language}`,
        color: '#F3F4F6',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9CA3AF',
        },
        title: {
          display: true,
          text: 'Letters Learned',
          color: '#9CA3AF',
        },
      },
      y1: {
        beginAtZero: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#9CA3AF',
        },
        title: {
          display: true,
          text: 'Accuracy %',
          color: '#9CA3AF',
        },
      },
    },
  };

  return (
    <div className="h-80 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default HistoricalProgressChart;