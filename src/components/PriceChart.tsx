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

  const chartData = data.map(item => ({
    ...item,
    tanggal: formatDate(item.tanggal)
  }));

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
                formatter={(value) => [formatPrice(Number(value)), 'Harga']}
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="harga" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1"></div>
            <span>Pasar Ciamis Manis</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};