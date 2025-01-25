'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for the missing Leaflet marker icon
const icon = L.icon({
  iconUrl: '/gps.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface EnvironmentalData {
  id: number;
  timestamp: string;
  temperature: number;
  humidity: number;
  soundIntensity: number;
  rainIntensity: number;
  co: number;
  co2: number;
  smoke: number;
  nh3: number;
  lpg: number;
  benzene: number;
  latitude: number;
  longitude: number;
}

export default function Home() {
  const [data, setData] = useState<EnvironmentalData[]>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('environmentalData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const fiveMinutesAgo = new Date();
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
        // Filter out data older than 5 minutes
        return parsedData.filter((item: EnvironmentalData) => new Date(item.timestamp) > fiveMinutesAgo);
      }
    }
    return [];
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newData = await response.json();
        if (!newData || typeof newData !== 'object' || !('id' in newData)) {
          throw new Error('Invalid data format received from API');
        }
        setData(prev => {
          const fiveMinutesAgo = new Date();
          fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
          // Keep only data from the last 5 minutes
          const filteredPrev = prev.filter(item => new Date(item.timestamp) > fiveMinutesAgo);
          const updatedData = [...filteredPrev, newData];
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('environmentalData', JSON.stringify(updatedData));
          }
          return updatedData;
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch environmental data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: window.innerWidth < 768 ? 1.2 : 2,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          stepSize: window.innerWidth < 768 ? 2 : 1,
          displayFormats: {
            minute: 'HH:mm',
            second: 'HH:mm:ss'
          }
        },
        display: true,
        title: {
          display: window.innerWidth >= 768,
          text: 'Time'
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: window.innerWidth < 768 ? 4 : 8,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        },
        min: function() {
          const now = new Date();
          now.setMinutes(now.getMinutes() - 5);
          return now;
        }(),
        max: new Date()
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          display: true
        },
        position: 'left',
        title: {
          display: window.innerWidth >= 768,
          text: 'Value'
        },
        ticks: {
          maxTicksLimit: window.innerWidth < 768 ? 5 : 8,
          padding: window.innerWidth < 768 ? 5 : 10,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          callback: function(value) {
            return Math.round(value * 100) / 100;
          }
        },
        display: true
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: window.innerWidth < 768 ? 10 : 20,
          boxWidth: window.innerWidth < 768 ? 15 : 30,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }
    },
    animation: {
      duration: 0
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const chartData = {
    labels: data.map(d => new Date(d.timestamp)),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: data.map(d => d.temperature),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      {
        label: 'Humidity (%)',
        data: data.map(d => d.humidity),
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1
      }
    ]
  };

  const gasChartData = {
    labels: data.map(d => new Date(d.timestamp)),
    datasets: [
      {
        label: 'CO (ppm)',
        data: data.map(d => d.co),
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1
      },
      {
        label: 'CO2 (ppm)',
        data: data.map(d => d.co2),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'NH3 (ppm)',
        data: data.map(d => d.nh3),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  };

  const latestData = data[data.length - 1];

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-100">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Environmental Monitoring Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Temperature & Humidity</h2>
          <div className="relative w-full h-[250px] sm:h-[300px]">
            <Line data={chartData} options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  x: {
                    ...chartOptions.scales.x,
                    ticks: {
                      maxRotation: 0,
                      autoSkip: true,
                      maxTicksLimit: window.innerWidth < 768 ? 4 : 8
                    }
                  },
                  y: {
                    ...chartOptions.scales.y,
                    ticks: {
                      ...chartOptions.scales.y.ticks,
                      padding: 10,
                      maxTicksLimit: window.innerWidth < 768 ? 4 : 8
                    }
                  }
                },
                maintainAspectRatio: true,
                responsive: true,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    labels: {
                      ...chartOptions.plugins.legend.labels,
                      boxWidth: window.innerWidth < 768 ? 20 : 30,
                      padding: window.innerWidth < 768 ? 10 : 20
                    }
                  },
                  zoom: {
                    pan: {
                      enabled: true,
                      mode: 'x'
                    },
                    zoom: {
                      wheel: {
                        enabled: true
                      },
                      pinch: {
                        enabled: true
                      },
                      mode: 'x'
                    }
                  }
                }
              }} height={window.innerWidth < 768 ? 250 : 300} />
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Gas Levels</h2>
          <div className="relative w-full h-[250px] sm:h-[300px]">
            <Line data={gasChartData} options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  x: {
                    ...chartOptions.scales.x,
                    ticks: {
                      maxRotation: 0,
                      autoSkip: true,
                      maxTicksLimit: window.innerWidth < 768 ? 4 : 8
                    }
                  },
                  y: {
                    ...chartOptions.scales.y,
                    ticks: {
                      ...chartOptions.scales.y.ticks,
                      padding: 10,
                      maxTicksLimit: window.innerWidth < 768 ? 4 : 8
                    }
                  }
                },
                maintainAspectRatio: true,
                responsive: true,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    labels: {
                      ...chartOptions.plugins.legend.labels,
                      boxWidth: window.innerWidth < 768 ? 20 : 30,
                      padding: window.innerWidth < 768 ? 10 : 20
                    }
                  },
                  zoom: {
                    pan: {
                      enabled: true,
                      mode: 'x'
                    },
                    zoom: {
                      wheel: {
                        enabled: true
                      },
                      pinch: {
                        enabled: true
                      },
                      mode: 'x'
                    }
                  }
                }
              }} height={window.innerWidth < 768 ? 250 : 300} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-4 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Sound & Rain Intensity</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Sound Intensity</p>
              <p className="text-xl sm:text-2xl font-bold">{latestData?.soundIntensity || 0} dB</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Rain Intensity</p>
              <p className="text-xl sm:text-2xl font-bold">{latestData?.rainIntensity || 0} mm/h</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Other Gases</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Smoke</p>
              <p className="text-xl sm:text-2xl font-bold">{latestData?.smoke || 0} ppm</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm sm:text-base">LPG</p>
              <p className="text-xl sm:text-2xl font-bold">{latestData?.lpg || 0} ppm</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Benzene</p>
              <p className="text-xl sm:text-2xl font-bold">{latestData?.benzene || 0} ppm</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow md:col-span-2 lg:col-span-1">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Location</h2>
          {latestData && (
            <div className="h-[250px] sm:h-[300px]">
              <MapContainer
                center={[latestData.latitude, latestData.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[latestData.latitude, latestData.longitude]} icon={icon}>
                  <Popup>
                    Sensor Location
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
