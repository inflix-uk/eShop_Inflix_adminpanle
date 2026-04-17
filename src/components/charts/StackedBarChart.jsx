
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StackedBarChart = () => {
  const data = {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [
      {
        label: 'Sales',
        data: [40, 60, 50, 70, 20, 60, 70], 
        backgroundColor: 'rgba(54, 162, 235, 0.8)', 
      },
      {
        label: 'Revenue',
        data: [30, 20, 40, 20, 30, 40, 30], 
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 16,
          },
        },
      },
      title: {
        display: true,
        text: 'Profit this week',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: {
            size: 14,
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default StackedBarChart;
