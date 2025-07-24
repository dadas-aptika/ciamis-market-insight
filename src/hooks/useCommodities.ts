import { useState, useEffect } from 'react';
import { Commodity, Category, PriceHistory } from '@/types/commodity';
import { useToast } from '@/hooks/use-toast';

interface ApiPriceData {
  id: number;
  komoditi_id: number;
  nama: string;
  foto: string;
  tanggal: string;
  harga: number;
  harga_sebelumnya: number;
  nama_satuan: string;
  nama_pasar: string;
}

export const useCommodities = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPriceHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://situ.ciamiskab.go.id/api/perkembangan-harga-sebulan');
      if (!response.ok) throw new Error('Failed to fetch price history');
      
      const result = await response.json();
      const data: ApiPriceData[] = result.data || result;
      
      // Group by commodity name and market to get all combinations
      const commodityMap = new Map<string, Commodity>();
      const priceHistoryList: PriceHistory[] = [];
      const marketSet = new Set<string>();

      data.forEach((item: ApiPriceData) => {
        const commodityKey = `${item.nama}-${item.nama_pasar}`;
        const commodity: Commodity = {
          id: item.id,
          nama: item.nama,
          harga: item.harga,
          satuan: item.nama_satuan,
          gambar: item.foto ? `https://situ.ciamiskab.go.id/storage/${item.foto}` : undefined,
          pasar: item.nama_pasar,
        };

        // Keep unique commodity-market combinations
        if (!commodityMap.has(commodityKey)) {
          commodityMap.set(commodityKey, commodity);
        }

        // Track all markets
        marketSet.add(item.nama_pasar);

        // Add to price history
        priceHistoryList.push({
          tanggal: item.tanggal,
          harga: item.harga,
          komoditi: item.nama,
          pasar: item.nama_pasar
        });
      });

      setCommodities(Array.from(commodityMap.values()));
      setPriceHistory(priceHistoryList);
      
      // Set categories as markets for filtering
      setCategories([
        { id: 0, nama: 'Semua Pasar' },
        ...Array.from(marketSet).map((market, index) => ({
          id: index + 1,
          nama: market
        }))
      ]);
      
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      
      // Fallback: Use sample data to show the interface
      const sampleCommodities: Commodity[] = [
        {
          id: 1,
          nama: "Beras Premium",
          harga: 16000,
          satuan: "Rp/Kg",
        },
        {
          id: 2,
          nama: "Beras Medium", 
          harga: 14500,
          satuan: "Rp/Kg",
        },
        {
          id: 5,
          nama: "Cabe Merah Lokal",
          harga: 80000,
          satuan: "Rp/Kg",
        },
        {
          id: 6,
          nama: "Cabe Merah Keriting",
          harga: 60000,
          satuan: "Rp/Kg",
        },
        {
          id: 7,
          nama: "Cabe Hijau",
          harga: 32500,
          satuan: "Rp/Kg",
        },
        {
          id: 8,
          nama: "Cabe Rawit Merah",
          harga: 60000,
          satuan: "Rp/Kg",
        }
      ];
      
      setCommodities(sampleCommodities);
      
      toast({
        title: "Peringatan",
        description: "Menggunakan data contoh karena API tidak dapat diakses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceHistory();
  }, []);

  return {
    commodities,
    categories,
    priceHistory,
    loading,
    error,
    refetch: fetchPriceHistory
  };
};