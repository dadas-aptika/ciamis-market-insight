export interface Commodity {
  id: number;
  nama: string;
  harga: number;
  satuan: string;
  gambar?: string;
  kategori?: string;
}

export interface Category {
  id: number;
  nama: string;
}

export interface PriceHistory {
  tanggal: string;
  harga: number;
  komoditi: string;
}