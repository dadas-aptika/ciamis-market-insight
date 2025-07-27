import { useState, useMemo } from 'react';
import { CommodityCard } from '@/components/CommodityCard';
import { PriceChart } from '@/components/PriceChart';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { MiniChart } from '@/components/MiniChart';
import { useCommodities } from '@/hooks/useCommodities';
import { Commodity } from '@/types/commodity';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, Info, ChevronDown } from 'lucide-react';

const Index = () => {
  const { commodities, categories, priceHistory, loading, error } = useCommodities();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [priceCondition, setPriceCondition] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const recordsPerPage = 8;

  // Get real price trend for commodity using price history data
  const getPriceTrend = (commodity: Commodity) => {
    let commodityData = priceHistory.filter(item => 
      item.komoditi.toLowerCase().includes(commodity.nama.toLowerCase())
    );
    
    // Filter by selected market if not 'all'
    if (selectedMarket !== 'all') {
      commodityData = commodityData.filter(item => 
        item.pasar.toLowerCase().includes(selectedMarket.toLowerCase())
      );
    }
    
    if (commodityData.length < 2) return 'tetap';
    
    // Sort by date and get last two entries for comparison
    const sortedData = commodityData
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    
    if (sortedData.length < 2) return 'tetap';
    
    // Compare latest price with previous week's average
    const latest = sortedData[sortedData.length - 1];
    const previousWeek = sortedData.slice(-8, -1); // Previous 7 days
    
    if (previousWeek.length === 0) return 'tetap';
    
    const avgPrevious = previousWeek.reduce((sum, item) => sum + item.harga, 0) / previousWeek.length;
    const priceDiff = latest.harga - avgPrevious;
    const threshold = avgPrevious * 0.02; // 2% threshold for more accurate trend
    
    if (priceDiff > threshold) return 'naik';
    if (priceDiff < -threshold) return 'turun';
    return 'tetap';
  };

  // Get price change data for commodity
  const getPriceChange = (commodity: Commodity) => {
    let commodityData = priceHistory.filter(item => 
      item.komoditi.toLowerCase().includes(commodity.nama.toLowerCase())
    );
    
    // Filter by selected market if not 'all'
    if (selectedMarket !== 'all') {
      commodityData = commodityData.filter(item => 
        item.pasar.toLowerCase().includes(selectedMarket.toLowerCase())
      );
    }
    
    if (commodityData.length < 2) return { amount: 0, percentage: 0 };
    
    const sortedData = commodityData
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    
    if (sortedData.length < 2) return { amount: 0, percentage: 0 };
    
    // Compare latest with previous week average
    const latest = sortedData[sortedData.length - 1];
    const previousWeek = sortedData.slice(-8, -1);
    
    if (previousWeek.length === 0) return { amount: 0, percentage: 0 };
    
    const avgPrevious = previousWeek.reduce((sum, item) => sum + item.harga, 0) / previousWeek.length;
    const amount = latest.harga - avgPrevious;
    const percentage = ((amount / avgPrevious) * 100);
    
    return { amount: Math.abs(amount), percentage: Math.abs(percentage) };
  };

  // Filter commodities based on search term, market, and price condition
  const filteredCommodities = useMemo(() => {
    let filtered = commodities;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(commodity =>
        commodity.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by market
    if (selectedMarket && selectedMarket !== 'all') {
      filtered = filtered.filter(commodity => commodity.pasar === selectedMarket);
    }
    
    // Filter by price condition
    if (priceCondition !== 'semua') {
      filtered = filtered.filter(commodity => {
        const trend = getPriceTrend(commodity);
        return trend === priceCondition;
      });
    }
    
    return filtered;
  }, [commodities, searchTerm, selectedMarket, priceCondition, priceHistory]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                <span className="text-xs font-bold">S</span>
              </div>
              <div>
                <div className="text-xs opacity-90">DASHBOARD</div>
                <div className="font-semibold">SIMANIS</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Perkembangan Harga</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            Beranda → Eksplorasi Dashboard → Dashboard Pangan
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Dashboard Pangan Kabupaten Ciamis
        </h1>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Cari Komoditas"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-4 pr-10 h-10 border border-gray-300 rounded"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Pilih Pasar</span>
            <Select value={selectedMarket} onValueChange={handleMarketChange}>
              <SelectTrigger className="w-48 h-10 border border-gray-300">
                <SelectValue placeholder="Semua Pasar" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="all">Semua Pasar</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.nama}>
                    {category.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-gray-600">Kondisi Harga</span>
            <Select value={priceCondition} onValueChange={setPriceCondition}>
              <SelectTrigger className="w-48 h-10 border border-gray-300">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="semua">Semua</SelectItem>
                <SelectItem value="naik">Naik</SelectItem>
                <SelectItem value="turun">Turun</SelectItem>
                <SelectItem value="tetap">Tetap</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Legend */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Harga Turun</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Harga Naik</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <span className="text-sm text-gray-600">Harga Tetap</span>
          </div>
        </div>

        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6">
          <div className="flex items-center gap-2 text-blue-700">
            <Info className="w-4 h-4" />
            <span className="text-sm">
              Menampilkan harga rata-rata di Ciamis, pilih pasar untuk harga yang lebih akurat
            </span>
          </div>
        </div>

        {/* Market Tabs */}
        <Tabs value={selectedMarket} onValueChange={handleMarketChange} className="mb-6">
          <TabsList className="bg-gray-100 p-1 rounded">
            <TabsTrigger value="all" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Semua Pasar
            </TabsTrigger>
            {categories.slice(0, 5).map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.nama}
                className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {category.nama}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : (
          <>
            {/* Commodity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedCommodities.map((commodity) => (
                <div key={commodity.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={commodity.gambar || "/placeholder.svg"} 
                        alt={commodity.nama}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">{commodity.nama}</h3>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        Rp {commodity.harga?.toLocaleString('id-ID') || '0'} / {commodity.satuan}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {(() => {
                          const trend = getPriceTrend(commodity);
                          const { amount, percentage } = getPriceChange(commodity);
                          
                          if (trend === 'naik') {
                            return <span className="text-red-500">↗ +{percentage.toFixed(2)}% (Rp {amount.toLocaleString('id-ID')})</span>;
                          } else if (trend === 'turun') {
                            return <span className="text-green-500">↘ -{percentage.toFixed(2)}% (Rp {amount.toLocaleString('id-ID')})</span>;
                          } else {
                            return <span className="text-gray-500">→ 0.00% (Rp 0)</span>;
                          }
                        })()}
                      </div>
                      
                      {/* Mini trend indicator */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">Tren Harga</span>
                        <div className={`text-xs ${
                          getPriceTrend(commodity) === 'naik' ? 'text-red-500' : 
                          getPriceTrend(commodity) === 'turun' ? 'text-green-500' : 
                          'text-gray-500'
                        }`}>
                          {getPriceTrend(commodity) === 'naik' ? 'Naik' : 
                           getPriceTrend(commodity) === 'turun' ? 'Turun' : 
                           'Tetap'}
                        </div>
                      </div>
                      
                      {/* Mini chart with tooltip */}
                      <div className="bg-gray-50 rounded mb-2 p-1">
                      <MiniChart 
                        commodityName={commodity.nama} 
                        marketName={selectedMarket} 
                      />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShowChart(commodity)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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

        {/* Chart Modal */}
        <Dialog open={!!selectedCommodity} onOpenChange={() => setSelectedCommodity(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Grafik Harga - {selectedCommodity?.nama}</DialogTitle>
            </DialogHeader>
            {selectedCommodity && (
              <PriceChart
                data={getCommodityPriceHistory(selectedCommodity.nama)}
                commodityName={selectedCommodity.nama}
                onClose={handleCloseChart}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Footer */}
      <footer className="bg-blue-600 text-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                <span className="text-xs font-bold">S</span>
              </div>
              <div>
                <div className="font-semibold">SIMANIS</div>
                <div className="text-xs opacity-90">Sistem Informasi Manajemen Harga Pangan</div>
              </div>
            </div>
            <div className="text-sm opacity-90">
              © 2024 Kabupaten Ciamis. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
