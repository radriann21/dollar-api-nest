export interface BinanceP2POffer {
  adv: {
    price: string;
    surplusAmount: string;
    tradableQuantity: string;
  };
  advertiser: {
    nickName: string;
    monthOrderCount: number;
    monthFinishRate: number;
  };
}

export interface BinanceP2PResponse {
  data: BinanceP2POffer[];
  total: number;
  success: boolean;
}

export interface BinancePriceData {
  currentPrice: number;
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
  priceChange: number;
  priceChangePercent: number;
  totalOffers: number;
  timestamp: string;
  offers: Array<{
    price: number;
    available: number;
    seller: string;
  }>;
}
