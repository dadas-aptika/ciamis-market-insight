import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { Commodity } from "@/types/commodity";

interface CommodityCardProps {
  commodity: Commodity;
  onShowChart: (commodity: Commodity) => void;
}

export const CommodityCard = ({ commodity, onShowChart }: CommodityCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative h-32 bg-muted overflow-hidden">
        {commodity.gambar ? (
          <img
            src={commodity.gambar}
            alt={commodity.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
            <span className="text-2xl font-bold text-secondary-foreground opacity-50">
              {commodity.nama.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onShowChart(commodity);
          }}
        >
          <TrendingUp className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
          {commodity.nama}
        </h3>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-primary">
            {formatPrice(commodity.harga)}
          </p>
          <p className="text-sm text-muted-foreground">
            {commodity.satuan}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};