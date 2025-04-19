export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  [key: string]: any;
}

export interface WhaleTransaction {
  // Definiți aici tipurile pentru tranzacțiile Whale
  // ...
  // Already defined in the WhaleTransaction type components/types.ts
}
