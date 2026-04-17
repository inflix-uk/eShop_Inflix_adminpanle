import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

const VisitorsAnalyticsChart = () => {
  const data = {
    labels: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
    datasets: [
      {
        label: 'Visitors Analytics',
        data: [65, 45, 34, 12], // Example percentages
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',   // Blue for Desktop
          'rgba(75, 192, 192, 0.6)',   // Light Blue for Mobile
          'rgba(153, 102, 255, 0.7)',  // Purple for Tablet
          'rgba(255, 205, 86, 0.6)'    // Yellow for Unknown
        ],
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14  // Increase legend label size
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}%`;
          }
        }
      }
    },
    cutout: '60%',  // This creates the hole in the middle (like a doughnut chart)
  };

  return <Doughnut data={data} options={options} />;
};

export default VisitorsAnalyticsChart;
