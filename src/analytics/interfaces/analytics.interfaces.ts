export interface GapResponse {
  gap: string;
  latestBCVPrice: {
    id: number;
    price: string;
    sourceId: number;
    trend: string;
    variation: number;
    createdAt: string;
    updatedAt: string;
  };
  latestBinancePrice: {
    id: number;
    price: string;
    sourceId: number;
    trend: string;
    variation: number;
    createdAt: string;
    updatedAt: string;
  };
}
