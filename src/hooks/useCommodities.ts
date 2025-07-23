import { useState, useEffect } from 'react';
import { Commodity, Category, PriceHistory } from '@/types/commodity';
import { useToast } from '@/hooks/use-toast';

export const useCommodities = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://situ.ciamiskab.go.id/get-all-komoditi');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCommodityById = async (id: number): Promise<Commodity | null> => {
    try {
      const response = await fetch(`https://situ.ciamiskab.go.id/api/get-komoditi-by-id/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch commodity ${id}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error fetching commodity ${id}:`, err);
      return null;
    }
  };

  const fetchAllCommodities = async () => {
    try {
      setLoading(true);
      const categoryResponse = await fetch('https://situ.ciamiskab.go.id/get-all-komoditi');
      if (!categoryResponse.ok) throw new Error('Failed to fetch categories');
      const categories = await categoryResponse.json();
      
      const commodityPromises = categories.map((category: Category) => 
        fetchCommodityById(category.id)
      );
      
      const commodityResults = await Promise.all(commodityPromises);
      const validCommodities = commodityResults.filter((commodity): commodity is Commodity => 
        commodity !== null
      );
      
      setCommodities(validCommodities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch commodities';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const response = await fetch('https://situ.ciamiskab.go.id/api/perkembangan-harga-sebulan');
      if (!response.ok) throw new Error('Failed to fetch price history');
      const data = await response.json();
      setPriceHistory(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch price history';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllCommodities();
    fetchPriceHistory();
  }, []);

  return {
    commodities,
    categories,
    priceHistory,
    loading,
    error,
    refetch: () => {
      fetchCategories();
      fetchAllCommodities();
      fetchPriceHistory();
    }
  };
};