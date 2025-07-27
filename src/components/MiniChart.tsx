import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useCommodities } from '@/hooks/useCommodities';
import { useMemo } from 'react';

interface MiniChartProps {
  commodityName: string;
  marketName?: string;
}

export const MiniChart = ({ commodityName, marketName }: MiniChartProps) => {
  const { priceHistory } = useCommodities();
  
  // Get real data for this commodity with multiple markets
  const { chartData, marketList } = useMemo(() => {
    let commodityData = priceHistory.filter(item => 
      item.komoditi.toLowerCase().includes(commodityName.toLowerCase())
    );
    
    // Filter by market if specified
    if (marketName && marketName !== 'all') {
      commodityData = commodityData.filter(item => 
        item.pasar.toLowerCase().includes(marketName.toLowerCase())
      );
    }
    
    // Get unique markets
    const markets = [...new Set(commodityData.map(item => item.pasar))];
    
    // Group by date and market
    const dateMarketData = commodityData.reduce((acc, item) => {
      const date = new Date(item.tanggal).toDateString();
      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][item.pasar] = item.harga;
      acc[date].tanggal = item.tanggal;
      return acc;
    }, {} as Record<string, any>);
    
    // Convert to array and sort by date, take last 7 entries
    const sortedData = Object.entries(dateMarketData)
      .map(([date, data]) => ({
        day: new Date(data.tanggal).toLocaleDateString('id-ID', { weekday: 'short' }),
        tanggal: new Date(data.tanggal).toLocaleDateString('id-ID'),
        date: new Date(data.tanggal),
        ...markets.reduce((acc, market) => {
          acc[market] = data[market] || null;
          return acc;
        }, {} as Record<string, number | null>)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-7);
    
    // If no real data, generate sample data
    if (sortedData.length === 0) {
      const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      const sampleMarkets = ['Pasar Sample 1', 'Pasar Sample 2'];
      const basePrice = Math.floor(Math.random() * 50000) + 10000;
      
      const sampleData = days.map((day, index) => {
        const data: any = {
          day,
          tanggal: `${index + 1} hari lalu`,
          date: new Date()
        };
        sampleMarkets.forEach(market => {
          data[market] = basePrice + (Math.random() - 0.5) * 5000;
        });
        return data;
      });
      
      return { chartData: sampleData, marketList: sampleMarkets };
    }
    
    return { chartData: sortedData, marketList: markets };
  }, [priceHistory, commodityName, marketName]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate colors for different markets
  const getLineColor = (index: number) => {
    const colors = [
      'hsl(221 83% 53%)', // blue
      'hsl(142 76% 36%)', // green  
      'hsl(346 87% 43%)', // red
      'hsl(262 83% 58%)', // purple
      'hsl(32 95% 44%)',  // orange
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          {marketList.map((market, index) => (
            <Line 
              key={market}
              type="monotone" 
              dataKey={market} 
              stroke={getLineColor(index)}
              strokeWidth={2}
              dot={false}
              activeDot={false}
              connectNulls={false}
            />
          ))}
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg text-xs">
                    <p className="font-medium">{data.tanggal}</p>
                    {payload.map((entry, index) => {
                      if (entry.value !== null && entry.value !== undefined) {
                        return (
                          <div key={index} className="mt-1">
                            <p style={{ color: entry.color }}>
                              {formatPrice(Number(entry.value))}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Pasar: {entry.dataKey}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })}
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