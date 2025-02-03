// lib/utils/duplicate-checker.ts

export interface ItemData {
  id: string;
  goods_services: string;
  section?: string;
  chapter?: string;
  group?: string;
  english?: string;
  bahasa: string;
}

export function checkDuplicateBahasa(items: ItemData[]): {
  hasDuplicates: boolean;
  duplicates: Map<string, ItemData[]>;
  uniqueItems: ItemData[];
} {
  const bahasaMap = new Map<string, ItemData[]>();
  
  // Group items by bahasa
  items.forEach(item => {
    const bahasa = item.bahasa.trim().toLowerCase(); // Normalize bahasa string
    if (!bahasaMap.has(bahasa)) {
      bahasaMap.set(bahasa, []);
    }
    bahasaMap.get(bahasa)?.push(item);
  });
  
  // Filter out non-duplicates
  const duplicates = new Map<string, ItemData[]>();
  let uniqueItems: ItemData[] = [];
  
  bahasaMap.forEach((items, bahasa) => {
    if (items.length > 1) {
      duplicates.set(bahasa, items);
    } else {
      uniqueItems.push(items[0]);
    }
  });
  
  return {
    hasDuplicates: duplicates.size > 0,
    duplicates,
    uniqueItems
  };
}

export function mergeItems(items: ItemData[]): ItemData {
  // Always use the first item as base, but log all duplicates
  console.log(`Merging ${items.length} items with same 'bahasa':`, items);
  
  return {
    ...items[0],
    // You can add additional merge logic here if needed
  };
}

// Helper function to handle duplicates in API response
export async function handleDuplicatesInResponse(items: ItemData[]) {
  const { hasDuplicates, duplicates, uniqueItems } = checkDuplicateBahasa(items);
  
  if (hasDuplicates) {
    console.warn(`Found ${duplicates.size} duplicate bahasa entries`);
    
    // Merge duplicates
    duplicates.forEach((dupeItems, bahasa) => {
      uniqueItems.push(mergeItems(dupeItems));
    });
  }
  
  return uniqueItems;
}