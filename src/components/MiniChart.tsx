import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useCommodities } from '@/hooks/useCommodities';
import { useMemo } from 'react';

interface MiniChartProps {
  commodityName: string;
  marketName?: string;
}

export const MiniChart = ({ commodityName, marketName }: MiniChartProps) => {
  const { priceHistory } = useCommodities();
  
  // Get real data for this commodity filtered by market and last 7 days
  const weeklyData = useMemo(() => {
    let commodityData = priceHistory.filter(item => 
      item.komoditi.toLowerCase().includes(commodityName.toLowerCase())
    );
    
    // Filter by market if specified
    if (marketName && marketName !== 'all') {
      commodityData = commodityData.filter(item => 
        item.pasar.toLowerCase().includes(marketName.toLowerCase())
      );
    }
    
    // Group by market and get latest price for each market
    const marketData = commodityData.reduce((acc, item) => {
      const market = item.pasar;
      if (!acc[market] || new Date(item.tanggal) > new Date(acc[market].tanggal)) {
        acc[market] = item;
      }
      return acc;
    }, {} as Record<string, any>);
    
    // Convert to array and sort by date, take last 7 entries
    const sortedData = Object.values(marketData)
      .sort((a: any, b: any) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
      .slice(-7);
    
    // If no real data, generate sample data
    if (sortedData.length === 0) {
      const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      const basePrice = Math.floor(Math.random() * 50000) + 10000;
      
      return days.map((day, index) => ({
        day,
        harga: basePrice + (Math.random() - 0.5) * 5000,
        tanggal: `${index + 1} hari lalu`,
        pasar: 'Sample Market'
      }));
    }
    
    // Format real data
    return sortedData.map((item: any) => ({
      day: new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short' }),
      harga: item.harga,
      tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
      pasar: item.pasar
    }));
  }, [priceHistory, commodityName, marketName]);

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
              if (active && payload && payload.length && payload[0].payload) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg text-xs">
                    <p className="font-medium">{data.tanggal}</p>
                    <p className="text-blue-600">
                      {formatPrice(Number(payload[0].value))}
                    </p>
                    {data.pasar && (
                      <p className="text-gray-500 mt-1">
                        Pasar: {data.pasar}
                      </p>
                    )}
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