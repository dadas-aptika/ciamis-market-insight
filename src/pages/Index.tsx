import { useState, useMemo } from 'react';
import { CommodityCard } from '@/components/CommodityCard';
import { PriceChart } from '@/components/PriceChart';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { useCommodities } from '@/hooks/useCommodities';
import { Commodity } from '@/types/commodity';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { commodities, priceHistory, loading, error } = useCommodities();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const recordsPerPage = 8;

  // Filter commodities based on search term
  const filteredCommodities = useMemo(() => {
    if (!searchTerm) return commodities;
    return commodities.filter(commodity =>
      commodity.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [commodities, searchTerm]);

  // Paginate filtered commodities
  const totalPages = Math.ceil(filteredCommodities.length / recordsPerPage);
  const paginatedCommodities = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return filteredCommodities.slice(startIndex, startIndex + recordsPerPage);
  }, [filteredCommodities, currentPage, recordsPerPage]);

  // Reset to first page when search term changes
  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleShowChart = (commodity: Commodity) => {
    setSelectedCommodity(commodity);
  };

  const handleCloseChart = () => {
    setSelectedCommodity(null);
  };

  const getCommodityPriceHistory = (commodityName: string) => {
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
              Pemantauan Pangan Dan Barang Pasar Kabupaten Ciamis
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
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Pemantauan Pangan Dan Barang Pasar Kabupaten Ciamis
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            Update: <span className="font-medium">{new Date().toLocaleDateString('id-ID', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}</span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearch}
            placeholder="Cari di sini..."
          />
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-card border-2 border-primary/30 rounded-lg p-6">
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
          </div>

          {/* Chart Panel */}
          {selectedCommodity && (
            <div className="w-80 lg:w-96">
              <PriceChart
                data={getCommodityPriceHistory(selectedCommodity.nama)}
                commodityName={selectedCommodity.nama}
                onClose={handleCloseChart}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
