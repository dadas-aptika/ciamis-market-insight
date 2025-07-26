import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useCommodities } from '@/hooks/useCommodities';
import { useMemo } from 'react';

interface MiniChartProps {
  commodityName: string;
}

export const MiniChart = ({ commodityName }: MiniChartProps) => {
  const { priceHistory } = useCommodities();
  
  // Get real data for this commodity and filter for last 7 days
  const weeklyData = useMemo(() => {
    const commodityData = priceHistory.filter(item => 
      item.komoditi.toLowerCase().includes(commodityName.toLowerCase())
    );
    
    // Sort by date and take last 7 entries
    const sortedData = commodityData
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
      .slice(-7);
    
    // If no real data, generate sample data
    if (sortedData.length === 0) {
      const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      const basePrice = Math.floor(Math.random() * 50000) + 10000;
      
      return days.map((day, index) => ({
        day,
        harga: basePrice + (Math.random() - 0.5) * 5000,
        tanggal: `${index + 1} hari lalu`
      }));
    }
    
    // Format real data
    return sortedData.map((item, index) => ({
      day: new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short' }),
      harga: item.harga,
      tanggal: new Date(item.tanggal).toLocaleDateString('id-ID')
    }));
  }, [priceHistory, commodityName]);

  const data = weeklyData;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="harga" 
            stroke="hsl(221 83% 53%)" 
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg text-xs">
                    <p className="font-medium">{label}</p>
                    <p className="text-blue-600">
                      {formatPrice(Number(payload[0].value))}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};