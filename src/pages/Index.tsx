import { useState, useMemo } from 'react';
import { CommodityCard } from '@/components/CommodityCard';
import { PriceChart } from '@/components/PriceChart';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { useCommodities } from '@/hooks/useCommodities';
import { Commodity } from '@/types/commodity';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { commodities, categories, priceHistory, loading, error } = useCommodities();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const recordsPerPage = 8;

  // Filter commodities based on search term and market
  const filteredCommodities = useMemo(() => {
    let filtered = commodities;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(commodity =>
        commodity.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by market
    if (selectedMarket && selectedMarket !== 'Semua Pasar') {
      filtered = filtered.filter(commodity => commodity.pasar === selectedMarket);
    }
    
    return filtered;
  }, [commodities, searchTerm, selectedMarket]);

  // Paginate filtered commodities
  const totalPages = Math.ceil(filteredCommodities.length / recordsPerPage);
  const paginatedCommodities = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return filteredCommodities.slice(startIndex, startIndex + recordsPerPage);
  }, [filteredCommodities, currentPage, recordsPerPage]);

  // Reset to first page when search term or market changes
  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleMarketChange = (market: string) => {
    setSelectedMarket(market);
    setCurrentPage(1);
  };

  const handleShowChart = (commodity: Commodity) => {
    setSelectedCommodity(commodity);
  };

  const handleCloseChart = () => {
    setSelectedCommodity(null);
  };

  const getCommodityPriceHistory = (commodityName: string) => {
    // Get data from all markets for this commodity
    return priceHistory.filter(item => 
      item.komoditi.toLowerCase().includes(commodityName.toLowerCase())
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Pemantaauan Pangan Dan Barang Pasar Kabupaten Ciamis
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              Update: <span className="font-medium">{new Date().toLocaleDateString('id-ID', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}</span>
            </p>
          </div>
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-primary mb-2">Sistem Sedang Menggunakan Data Contoh</h2>
            <p className="text-muted-foreground">
              Beberapa API tidak dapat diakses, namun aplikasi tetap dapat digunakan dengan data contoh.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Pemantauan Pangan Dan Barang Pasar Kabupaten Ciamis
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-3">
            Data terbaru harga komoditas di seluruh pasar
          </p>
          <p className="text-sm text-muted-foreground">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </header>

        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-center max-w-5xl mx-auto">
            <div className="flex-1 w-full lg:max-w-2xl">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={handleSearch}
                placeholder="Cari komoditas..."
              />
            </div>
            
            <div className="w-full lg:w-auto lg:min-w-[300px]">
              <Select value={selectedMarket} onValueChange={handleMarketChange}>
                <SelectTrigger className="w-full border-2 border-primary/30 focus:border-primary rounded-full h-12 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Semua Pasar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Pasar</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.nama}>
                      {category.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-card border-2 border-primary/30 rounded-lg p-6 mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Memuat data...</span>
            </div>
          ) : (
            <>
              {/* Commodity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {paginatedCommodities.map((commodity) => (
                  <CommodityCard
                    key={commodity.id}
                    commodity={commodity}
                    onShowChart={handleShowChart}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalRecords={filteredCommodities.length}
                  recordsPerPage={recordsPerPage}
                />
              )}
            </>
          )}
        </div>

        {/* Chart Panel - Now Below Main Content */}
        {selectedCommodity && (
          <div className="w-full">
            <PriceChart
              data={getCommodityPriceHistory(selectedCommodity.nama)}
              commodityName={selectedCommodity.nama}
              onClose={handleCloseChart}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
