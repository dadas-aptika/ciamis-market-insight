import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X, Download } from "lucide-react";
import { PriceHistory } from "@/types/commodity";

interface PriceChartProps {
  data: PriceHistory[];
  commodityName: string;
  onClose: () => void;
}

export const PriceChart = ({ data, commodityName, onClose }: PriceChartProps) => {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short'
    });
  };

  // Group data by market and format dates
  const marketData = data.reduce((acc, item) => {
    const market = item.pasar;
    if (!acc[market]) {
      acc[market] = [];
    }
    acc[market].push({
      ...item,
      tanggal: formatDate(item.tanggal)
    });
    return acc;
  }, {} as Record<string, typeof data>);

  // Get all unique dates and create combined chart data
  const allDates = [...new Set(data.map(item => formatDate(item.tanggal)))];
  const chartData = allDates.map(date => {
    const entry: any = { tanggal: date };
    Object.keys(marketData).forEach(market => {
      const marketItem = marketData[market].find(item => item.tanggal === date);
      entry[market] = marketItem ? marketItem.harga : null;
    });
    return entry;
  });

  const markets = Object.keys(marketData);
  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  const downloadSVG = () => {
    const chartElement = document.querySelector('.recharts-wrapper svg');
    if (chartElement) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(chartElement);
      const blob = new Blob([source], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${commodityName}-chart.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadPNG = () => {
    const chartElement = document.querySelector('.recharts-wrapper svg');
    if (chartElement) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const serializer = new XMLSerializer();
      const svgData = serializer.serializeToString(chartElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `${commodityName}-chart.png`;
            a.click();
            URL.revokeObjectURL(pngUrl);
          }
        });
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    }
  };

  const downloadCSV = () => {
    const csvContent = [
      ['Tanggal', 'Harga', 'Komoditas'],
      ...data.map(item => [item.tanggal, item.harga, commodityName])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${commodityName}-data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          {commodityName} (Konsumsi)
        </CardTitle>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadSVG}>
                Download SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadPNG}>
                Download PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadCSV}>
                Download CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="tanggal" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatPrice}
              />
              <Tooltip 
                formatter={(value, name) => [
                  value ? formatPrice(Number(value)) : 'Tidak ada data', 
                  `${name}`
                ]}
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              {markets.map((market, index) => (
                <Line 
                  key={market}
                  type="monotone" 
                  dataKey={market}
                  stroke={chartColors[index % chartColors.length]}
                  strokeWidth={2}
                  dot={{ fill: chartColors[index % chartColors.length], strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: chartColors[index % chartColors.length], strokeWidth: 2 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {markets.map((market, index) => (
            <div key={market} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              ></div>
              <span>{market}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};