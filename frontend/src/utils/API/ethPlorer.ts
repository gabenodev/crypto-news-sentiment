// Funcție simplă pentru a face un request la API
export const fetchWalletHoldings = async (address: string) => {
  console.log("FETCH WALLET HOLDINGS PENTRU:", address);

  try {
    console.log("Trimit cerere către API...");
    const response = await fetch(
      `https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`
    );

    if (!response.ok) {
      console.error(`Eroare API: ${response.status} ${response.statusText}`);
      throw new Error(`Eroare API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Date primite de la API");
    return data.tokens || [];
  } catch (error) {
    console.error("Eroare la fetchWalletHoldings:", error);
    throw error;
  }
};

// Funcție pentru a verifica dacă o adresă este validă
export const isValidEthereumAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
