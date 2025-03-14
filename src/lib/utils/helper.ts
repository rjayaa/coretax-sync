interface InvoiceRelation {
  invoiceNumber: string;
  amendedInvoiceNumber: string | null;
  status: string;
  reference: string;
  date: string;
}

interface InvoiceChain {
  reference: string;
  invoices: {
    invoiceNumber: string;
    status: string;
    date: string;
    isLatest: boolean;
  }[];
}

// /**
//  * Build invoice chains from invoice relations
//  */
// function buildInvoiceChains(relations: InvoiceRelation[]): InvoiceChain[] {
//   // First, group by reference
//   const referenceGroups = new Map<string, InvoiceRelation[]>();
  
//   for (const relation of relations) {
//     if (!referenceGroups.has(relation.reference)) {
//       referenceGroups.set(relation.reference, []);
//     }
//     referenceGroups.get(relation.reference)!.push(relation);
//   }
  
//   // Build amendment chains
//   const chains: InvoiceChain[] = [];
  
//   for (const [reference, invoices] of referenceGroups.entries()) {
//     // Create forward map (invoice -> amended invoice)
//     const forwardMap = new Map<string, string>();
    
//     for (const invoice of invoices) {
//       if (invoice.amendedInvoiceNumber) {
//         forwardMap.set(invoice.invoiceNumber, invoice.amendedInvoiceNumber);
//       }
//     }
    
//     // Create reverse map (amended invoice -> original invoice)
//     const reverseMap = new Map<string, string>();
    
//     for (const [original, amended] of forwardMap.entries()) {
//       reverseMap.set(amended, original);
//     }
    
//     // Find the root invoices (not amendments of anything)
//     const roots = invoices
//       .filter(inv => !reverseMap.has(inv.invoiceNumber))
//       .map(inv => inv.invoiceNumber);
    
//     // For each root, build its amendment chain
//     for (const root of roots) {
//       const chain: string[] = [root];
//       let current = root;
      
//       // Follow the chain forward
//       while (forwardMap.has(current)) {
//         current = forwardMap.get(current)!;
//         chain.push(current);
//       }
      
//       // Create the chain object
//       const invoiceChain: InvoiceChain = {
//         reference,
//         invoices: chain.map((invoiceNumber, index) => {
//           const invoiceData = invoices.find(inv => inv.invoiceNumber === invoiceNumber)!;
//           return {
//             invoiceNumber,
//             status: invoiceData.status,
//             date: invoiceData.date,
//             isLatest: index === chain.length - 1
//           };
//         }).reverse() // Newest first
//       };
      
//       chains.push(invoiceChain);
//     }
//   }
  
//   // Sort chains: longest chains first, then by reference
//   return chains.sort((a, b) => {
//     const lengthDiff = b.invoices.length - a.invoices.length;
//     if (lengthDiff !== 0) return lengthDiff;
//     return a.reference.localeCompare(b.reference);
//   });
// }