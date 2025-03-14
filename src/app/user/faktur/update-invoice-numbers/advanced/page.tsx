// // src/app/faktur/update-invoice-numbers/advanced/page.tsx
// "use client";

// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Loader2, Upload, FileCheck, AlertCircle, Check, X, AlertTriangle } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// interface MatchResult {
//   coretaxReference: string;
//   coretaxBuyer: string;
//   coretaxTIN: string;
//   coretaxInvoiceNumber: string;
//   coretaxDate: string;
//   dbId: string | null;
//   dbReference: string | null;
//   dbBuyer: string | null;
//   dbTIN: string | null;
//   dbInvoiceNumber: string | null;
//   dbDate: string | null;
//   matchQuality: 'exact' | 'partial' | 'none';
//   matchReason: string;
//   actionNeeded: 'update' | 'ignore' | 'manual';
// }

// interface PreviewStats {
//   totalRecords: number;
//   recordsWithInvoiceNumber: number;
//   exactMatches: number;
//   partialMatches: number;
//   noMatches: number;
//   alreadyUpdated: number;
// }

// interface PreviewResult {
//   stats: PreviewStats;
//   matchResults: MatchResult[];
// }

// interface UpdateResult {
//   successful: number;
//   failed: number;
//   errors: string[];
// }

// export default function AdvancedUpdateInvoiceNumbersPage() {
//   const [file, setFile] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
//   const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
//   const [activeTab, setActiveTab] = useState<string>('update');

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setFile(e.target.files[0]);
//       setError(null);
//       setPreviewResult(null);
//       setUpdateResult(null);
//       setSelectedRecords(new Set());
//     }
//   };

//   const handlePreviewSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!file) {
//       setError('Please select a file to upload');
//       return;
//     }

//     try {
//       setIsUploading(true);
//       setError(null);
      
//       // Create form data for upload
//       const formData = new FormData();
//       formData.append('file', file);
      
//       // Call the API route
//       const response = await fetch('/api/faktur/preview-invoice-updates', {
//         method: 'POST',
//         body: formData,
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Error previewing invoice updates');
//       }
      
//       const data = await response.json();
//       setPreviewResult(data);
      
//       // Auto-select exact matches for update
//       const exactMatchIds = new Set(
//         data.matchResults
//           .filter(m => m.matchQuality === 'exact' && m.actionNeeded === 'update')
//           .map(m => m.dbId)
//           .filter(Boolean)
//       );
//       setSelectedRecords(exactMatchIds);
      
//       // Set active tab based on results
//       if (data.matchResults.some(m => m.actionNeeded === 'update')) {
//         setActiveTab('update');
//       } else if (data.matchResults.some(m => m.actionNeeded === 'manual')) {
//         setActiveTab('manual');
//       } else {
//         setActiveTab('ignore');
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An unexpected error occurred');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleApplyUpdates = async () => {
//     if (selectedRecords.size === 0) {
//       setError('No records selected for update');
//       return;
//     }

//     try {
//       setIsUpdating(true);
//       setError(null);
      
//       const recordsToUpdate = previewResult?.matchResults
//         .filter(r => selectedRecords.has(r.dbId || ''))
//         .map(r => ({
//           dbId: r.dbId || '',
//           coretaxInvoiceNumber: r.coretaxInvoiceNumber
//         }));
      
//       // Call the API route
//       const response = await fetch('/api/faktur/apply-invoice-updates', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ records: recordsToUpdate }),
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Error applying invoice updates');
//       }
      
//       const data = await response.json();
//       setUpdateResult(data);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An unexpected error occurred');
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const toggleSelectAll = (actionType: 'update' | 'manual' | 'ignore') => {
//     const allRecordsOfType = previewResult?.matchResults
//       .filter(r => r.actionNeeded === actionType && r.dbId)
//       .map(r => r.dbId || '') || [];
    
//     const newSelection = new Set(selectedRecords);
    
//     // Check if all of this type are already selected
//     const allSelected = allRecordsOfType.every(id => selectedRecords.has(id));
    
//     if (allSelected) {
//       // Remove all from selection
//       allRecordsOfType.forEach(id => newSelection.delete(id));
//     } else {
//       // Add all to selection
//       allRecordsOfType.forEach(id => newSelection.add(id));
//     }
    
//     setSelectedRecords(newSelection);
//   };

//   const toggleSelect = (id: string) => {
//     const newSelection = new Set(selectedRecords);
    
//     if (newSelection.has(id)) {
//       newSelection.delete(id);
//     } else {
//       newSelection.add(id);
//     }
    
//     setSelectedRecords(newSelection);
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-6">Advanced Invoice Number Updater</h1>
      
//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>Upload Coretax Export</CardTitle>
//           <CardDescription>
//             Upload the Excel file from Coretax to preview and selectively update invoice numbers.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handlePreviewSubmit}>
//             <div className="grid w-full items-center gap-4">
//               <div className="flex flex-col space-y-1.5">
//                 <Label htmlFor="file">Coretax Export File (Excel)</Label>
//                 <Input 
//                   id="file" 
//                   type="file" 
//                   accept=".xlsx, .xls" 
//                   onChange={handleFileChange}
//                   disabled={isUploading}
//                 />
//               </div>
//             </div>
            
//             {error && (
//               <Alert variant="destructive" className="mt-4">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertTitle>Error</AlertTitle>
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}
            
//             <Button type="submit" className="mt-4" disabled={!file || isUploading}>
//               {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               {isUploading ? 'Analyzing...' : 'Preview Updates'}
//               {!isUploading && <Upload className="ml-2 h-4 w-4" />}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
      
//       {previewResult && !updateResult && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <FileCheck className="mr-2 h-5 w-5 text-blue-500" />
//               Preview Results
//             </CardTitle>
//             <CardDescription>
//               Review the matches and select which records to update
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-3 gap-4 mb-6">
//               <div className="border rounded p-3">
//                 <p className="text-sm text-gray-500">Records to Update</p>
//                 <p className="text-2xl font-bold text-green-600">{previewResult.stats.exactMatches}</p>
//               </div>
//               <div className="border rounded p-3">
//                 <p className="text-sm text-gray-500">Manual Review Needed</p>
//                 <p className="text-2xl font-bold text-amber-600">{previewResult.stats.partialMatches}</p>
//               </div>
//               <div className="border rounded p-3">
//                 <p className="text-sm text-gray-500">No Matches Found</p>
//                 <p className="text-2xl font-bold text-red-600">{previewResult.stats.noMatches}</p>
//               </div>
//               <div className="border rounded p-3">
//                 <p className="text-sm text-gray-500">Total Coretax Records</p>
//                 <p className="text-2xl font-bold">{previewResult.stats.totalRecords}</p>
//               </div>
//               <div className="border rounded p-3">
//                 <p className="text-sm text-gray-500">With Invoice Numbers</p>
//                 <p className="text-2xl font-bold">{previewResult.stats.recordsWithInvoiceNumber}</p>
//               </div>
//               <div className="border rounded p-3">
//                 <p className="text-sm text-gray-500">Already Updated</p>
//                 <p className="text-2xl font-bold text-gray-600">{previewResult.stats.alreadyUpdated}</p>
//               </div>
//             </div>
            
//             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//               <TabsList className="grid w-full grid-cols-3">
//                 <TabsTrigger value="update" className="relative">
//                   Records to Update
//                   {previewResult.stats.exactMatches > 0 && (
//                     <Badge className="ml-2 bg-green-500">{previewResult.stats.exactMatches}</Badge>
//                   )}
//                 </TabsTrigger>
//                 <TabsTrigger value="manual" className="relative">
//                   Manual Review
//                   {previewResult.stats.partialMatches > 0 && (
//                     <Badge className="ml-2 bg-amber-500">{previewResult.stats.partialMatches}</Badge>
//                   )}
//                 </TabsTrigger>
//                 <TabsTrigger value="ignore" className="relative">
//                   No Action Needed
//                   {previewResult.stats.alreadyUpdated > 0 && (
//                     <Badge className="ml-2 bg-gray-500">{previewResult.stats.alreadyUpdated}</Badge>
//                   )}
//                 </TabsTrigger>
//               </TabsList>
              
//               {/* Tab for records to update */}
//               <TabsContent value="update">
//                 <div className="rounded-md border">
//                   {previewResult.matchResults.some(m => m.actionNeeded === 'update') ? (
//                     <>
//                       <div className="p-2 bg-gray-50 border-b">
//                         <Button 
//                           variant="outline" 
//                           size="sm"
//                           onClick={() => toggleSelectAll('update')}
//                         >
//                           Toggle Select All
//                         </Button>
//                       </div>
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead className="w-12">Select</TableHead>
//                             <TableHead>Reference</TableHead>
//                             <TableHead>Buyer</TableHead>
//                             <TableHead>Date</TableHead>
//                             <TableHead>Invoice Number</TableHead>
//                             <TableHead>Match Quality</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {previewResult.matchResults
//                             .filter(match => match.actionNeeded === 'update')
//                             .map(match => (
//                               <TableRow key={`${match.coretaxReference}-${match.dbId}`}>
//                                 <TableCell>
//                                   <Checkbox 
//                                     checked={selectedRecords.has(match.dbId || '')}
//                                     onCheckedChange={() => toggleSelect(match.dbId || '')}
//                                     disabled={!match.dbId}
//                                   />
//                                 </TableCell>
//                                 <TableCell>
//                                   <div className="font-medium">{match.coretaxReference}</div>
//                                 </TableCell>
//                                 <TableCell>
//                                   <div>{match.coretaxBuyer}</div>
//                                   <div className="text-xs text-gray-500">{match.coretaxTIN}</div>
//                                 </TableCell>
//                                 <TableCell>{match.coretaxDate}</TableCell>
//                                 <TableCell>
//                                   <div className="flex flex-col">
//                                     <span className="text-green-600 font-medium">{match.coretaxInvoiceNumber}</span>
//                                     {match.dbInvoiceNumber && (
//                                       <span className="text-xs text-gray-500 line-through">{match.dbInvoiceNumber}</span>
//                                     )}
//                                   </div>
//                                 </TableCell>
//                                 <TableCell>
//                                   <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
//                                     <Check className="h-3 w-3 mr-1" />
//                                     {match.matchQuality}
//                                   </Badge>
//                                 </TableCell>
//                               </TableRow>
//                             ))}
//                         </TableBody>
//                       </Table>
//                     </>
//                   ) : (
//                     <div className="p-8 text-center text-gray-500">
//                       No records found that need updating
//                     </div>
//                   )}
//                 </div>
//               </TabsContent>
              
//               {/* Tab for manual review */}
//               <TabsContent value="manual">
//                 <div className="rounded-md border">
//                   {previewResult.matchResults.some(m => m.actionNeeded === 'manual') ? (
//                     <>
//                       <div className="p-2 bg-gray-50 border-b">
//                         <Button 
//                           variant="outline" 
//                           size="sm"
//                           onClick={() => toggleSelectAll('manual')}
//                         >
//                           Toggle Select All
//                         </Button>
//                       </div>
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead className="w-12">Select</TableHead>
//                             <TableHead>Reference</TableHead>
//                             <TableHead>Coretax Data</TableHead>
//                             <TableHead>Database Data</TableHead>
//                             <TableHead>Invoice Number</TableHead>
//                             <TableHead>Status</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {previewResult.matchResults
//                             .filter(match => match.actionNeeded === 'manual')
//                             .map(match => (
//                               <TableRow key={`${match.coretaxReference}-${match.dbId}`}>
//                                 <TableCell>
//                                   <Checkbox 
//                                     checked={selectedRecords.has(match.dbId || '')}
//                                     onCheckedChange={() => toggleSelect(match.dbId || '')}
//                                     disabled={!match.dbId}
//                                   />
//                                 </TableCell>
//                                 <TableCell>
//                                   <div className="font-medium">{match.coretaxReference}</div>
//                                   <div className="text-xs text-gray-500">{match.dbReference || 'No match'}</div>
//                                 </TableCell>
//                                 <TableCell>
//                                   <div>{match.coretaxBuyer}</div>
//                                   <div className="text-xs text-gray-500">{match.coretaxTIN}</div>
//                                   <div className="text-xs text-gray-500">{match.coretaxDate}</div>
//                                 </TableCell>
//                                 <TableCell>
//                                   {match.dbBuyer ? (
//                                     <>
//                                       <div>{match.dbBuyer}</div>
//                                       <div className="text-xs text-gray-500">{match.dbTIN}</div>
//                                       <div className="text-xs text-gray-500">{match.dbDate}</div>
//                                     </>
//                                   ) : (
//                                     <span className="text-gray-400">No match found</span>
//                                   )}
//                                 </TableCell>
//                                 <TableCell>
//                                   <div className="flex flex-col">
//                                     <span className="text-amber-600 font-medium">{match.coretaxInvoiceNumber}</span>
//                                     {match.dbInvoiceNumber && (
//                                       <span className="text-xs text-gray-500 line-through">{match.dbInvoiceNumber}</span>
//                                     )}
//                                   </div>
//                                 </TableCell>
//                                 <TableCell>
//                                   <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
//                                     <AlertTriangle className="h-3 w-3 mr-1" />
//                                     {match.matchQuality}
//                                   </Badge>
//                                   <p className="text-xs text-gray-500 mt-1">{match.matchReason}</p>
//                                 </TableCell>
//                               </TableRow>
//                             ))}
//                         </TableBody>
//                       </Table>
//                     </>
//                   ) : (
//                     <div className="p-8 text-center text-gray-500">
//                       No records found that need manual review
//                     </div>
//                   )}
//                 </div>
//               </TabsContent>
              
//               {/* Tab for no action needed */}
//               <TabsContent value="ignore">
//                 <div className="rounded-md border">
//                   {previewResult.matchResults.some(m => m.actionNeeded === 'ignore') ? (
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Reference</TableHead>
//                           <TableHead>Buyer</TableHead>
//                           <TableHead>Date</TableHead>
//                           <TableHead>Invoice Number</TableHead>
//                           <TableHead>Status</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {previewResult.matchResults
//                           .filter(match => match.actionNeeded === 'ignore')
//                           .map(match => (
//                             <TableRow key={`${match.coretaxReference}-${match.dbId}`}>
//                               <TableCell>
//                                 <div className="font-medium">{match.coretaxReference}</div>
//                               </TableCell>
//                               <TableCell>
//                                 <div>{match.coretaxBuyer}</div>
//                                 <div className="text-xs text-gray-500">{match.coretaxTIN}</div>
//                               </TableCell>
//                               <TableCell>{match.coretaxDate}</TableCell>
//                               <TableCell>
//                                 <div className="flex flex-col">
//                                   <span className="text-gray-600 font-medium">{match.coretaxInvoiceNumber}</span>
//                                 </div>
//                               </TableCell>
//                               <TableCell>
//                                 <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
//                                   <Check className="h-3 w-3 mr-1" />
//                                   Already updated
//                                 </Badge>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                       </TableBody>
//                     </Table>
//                   ) : (
//                     <div className="p-8 text-center text-gray-500">
//                       No records found that are already up-to-date
//                     </div>
//                   )}
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//           <CardFooter className="flex justify-between border-t pt-4">
//             <div>
//               <p className="text-sm text-gray-500">
//                 {selectedRecords.size} record(s) selected for update
//               </p>
//             </div>
//             <div className="flex space-x-2">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setFile(null);
//                   setPreviewResult(null);
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 disabled={selectedRecords.size === 0 || isUpdating}
//                 onClick={handleApplyUpdates}
//               >
//                 {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Apply Updates
//               </Button>
//             </div>
//           </CardFooter>
//         </Card>
//       )}
      
//       {updateResult && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <FileCheck className="mr-2 h-5 w-5 text-green-500" />
//               Update Results
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <div className="border rounded p-3">
//                 <p className="text-sm text-gray-500">Successfully Updated</p>
//                 <p className="text-2xl font-bold text-green-600">{updateResult.successful}</p>
//               </div>
//               <div className="border rounded p-3">
//                 <p className="text-sm text-gray-500">Failed Updates</p>
//                 <p className="text-2xl font-bold text-red-600">{updateResult.failed}</p>
//               </div>
//             </div>
            
//             {updateResult.errors.length > 0 && (
//               <div className="mt-4">
//                 <h3 className="text-lg font-semibold mb-2">Errors</h3>
//                 <div className="bg-red-50 border border-red-200 rounded-md p-3">
//                   <ul className="list-disc list-inside text-sm text-red-700">
//                     {updateResult.errors.map((error, index) => (
//                       <li key={index}>{error}</li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//           <CardFooter className="flex justify-between border-t pt-4">
//             <p className="text-sm text-gray-500">
//               {updateResult.successful} invoice numbers have been successfully updated.
//             </p>
//             <Button variant="outline" onClick={() => window.location.reload()}>
//               Upload Another File
//             </Button>
//           </CardFooter>
//         </Card>
//       )}
//     </div>
//   );
// }
// src/app/faktur/update-invoice-numbers/advanced/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, FileCheck, AlertCircle, Check, X, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MatchResult {
  coretaxReference: string;
  coretaxBuyer: string;
  coretaxTIN: string;
  coretaxInvoiceNumber: string;
  coretaxDate: string;
  coretaxStatus: string;
  dbId: string | null;
  dbReference: string | null;
  dbBuyer: string | null;
  dbTIN: string | null;
  dbInvoiceNumber: string | null;
  dbStatus: string | null;
  dbDate: string | null;
  matchQuality: 'exact' | 'partial' | 'none';
  matchReason: string;
  actionNeeded: 'update' | 'ignore' | 'manual';
}

interface PreviewStats {
  totalRecords: number;
  recordsWithInvoiceNumber: number;
  exactMatches: number;
  partialMatches: number;
  noMatches: number;
  alreadyUpdated: number;
}

interface PreviewResult {
  stats: PreviewStats;
  matchResults: MatchResult[];
}

interface UpdateResult {
  successful: number;
  failed: number;
  errors: string[];
}

export default function AdvancedUpdateInvoiceNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('update');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setPreviewResult(null);
      setUpdateResult(null);
      setSelectedRecords(new Set());
    }
  };

  const handlePreviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the API route
      const response = await fetch('/api/faktur/preview-invoice-updates', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error previewing invoice updates');
      }
      
      const data = await response.json();
      setPreviewResult(data);
      
      // Auto-select exact matches for update
      const exactMatchIds = new Set(
        data.matchResults
          .filter(m => m.matchQuality === 'exact' && m.actionNeeded === 'update')
          .map(m => m.dbId)
          .filter(Boolean)
      );
      setSelectedRecords(exactMatchIds);
      
      // Set active tab based on results
      if (data.matchResults.some(m => m.actionNeeded === 'update')) {
        setActiveTab('update');
      } else if (data.matchResults.some(m => m.actionNeeded === 'manual')) {
        setActiveTab('manual');
      } else {
        setActiveTab('ignore');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUpdates = async () => {
    if (selectedRecords.size === 0) {
      setError('No records selected for update');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      
              const recordsToUpdate = previewResult?.matchResults
        .filter(r => selectedRecords.has(r.dbId || ''))
        .map(r => ({
          dbId: r.dbId || '',
          coretaxInvoiceNumber: r.coretaxInvoiceNumber,
          coretaxStatus: r.coretaxStatus
        }));
      
      // Call the API route
      const response = await fetch('/api/faktur/apply-invoice-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: recordsToUpdate }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error applying invoice updates');
      }
      
      const data = await response.json();
      setUpdateResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleSelectAll = (actionType: 'update' | 'manual' | 'ignore') => {
    const allRecordsOfType = previewResult?.matchResults
      .filter(r => r.actionNeeded === actionType && r.dbId)
      .map(r => r.dbId || '') || [];
    
    const newSelection = new Set(selectedRecords);
    
    // Check if all of this type are already selected
    const allSelected = allRecordsOfType.every(id => selectedRecords.has(id));
    
    if (allSelected) {
      // Remove all from selection
      allRecordsOfType.forEach(id => newSelection.delete(id));
    } else {
      // Add all to selection
      allRecordsOfType.forEach(id => newSelection.add(id));
    }
    
    setSelectedRecords(newSelection);
  };

  const toggleSelect = (id: string) => {
    const newSelection = new Set(selectedRecords);
    
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    
    setSelectedRecords(newSelection);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Advanced Invoice Number Updater</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Coretax Export</CardTitle>
          <CardDescription>
            Upload the Excel file from Coretax to preview and selectively update invoice numbers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePreviewSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="file">Coretax Export File (Excel)</Label>
                <Input 
                  id="file" 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="mt-4" disabled={!file || isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Analyzing...' : 'Preview Updates'}
              {!isUploading && <Upload className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {previewResult && !updateResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-blue-500" />
              Preview Results
            </CardTitle>
            <CardDescription>
              Review the matches and select which records to update
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Records to Update</p>
                <p className="text-2xl font-bold text-green-600">{previewResult.stats.exactMatches}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Manual Review Needed</p>
                <p className="text-2xl font-bold text-amber-600">{previewResult.stats.partialMatches}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">No Matches Found</p>
                <p className="text-2xl font-bold text-red-600">{previewResult.stats.noMatches}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Total Coretax Records</p>
                <p className="text-2xl font-bold">{previewResult.stats.totalRecords}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">With Invoice Numbers</p>
                <p className="text-2xl font-bold">{previewResult.stats.recordsWithInvoiceNumber}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Already Updated</p>
                <p className="text-2xl font-bold text-gray-600">{previewResult.stats.alreadyUpdated}</p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="update" className="relative">
                  Records to Update
                  {previewResult.stats.exactMatches > 0 && (
                    <Badge className="ml-2 bg-green-500">{previewResult.stats.exactMatches}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="manual" className="relative">
                  Manual Review
                  {previewResult.stats.partialMatches > 0 && (
                    <Badge className="ml-2 bg-amber-500">{previewResult.stats.partialMatches}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="ignore" className="relative">
                  No Action Needed
                  {previewResult.stats.alreadyUpdated > 0 && (
                    <Badge className="ml-2 bg-gray-500">{previewResult.stats.alreadyUpdated}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              {/* Tab for records to update */}
              <TabsContent value="update">
                <div className="rounded-md border">
                  {previewResult.matchResults.some(m => m.actionNeeded === 'update') ? (
                    <>
                      <div className="p-2 bg-gray-50 border-b">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleSelectAll('update')}
                        >
                          Toggle Select All
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Buyer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Invoice Number</TableHead>
                            <TableHead>Match Quality</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewResult.matchResults
                            .filter(match => match.actionNeeded === 'update')
                            .map(match => (
                              <TableRow key={`${match.coretaxReference}-${match.dbId}`}>
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedRecords.has(match.dbId || '')}
                                    onCheckedChange={() => toggleSelect(match.dbId || '')}
                                    disabled={!match.dbId}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{match.coretaxReference}</div>
                                </TableCell>
                                <TableCell>
                                  <div>{match.coretaxBuyer}</div>
                                  <div className="text-xs text-gray-500">{match.coretaxTIN}</div>
                                </TableCell>
                                <TableCell>{match.coretaxDate}</TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-green-600 font-medium">{match.coretaxInvoiceNumber}</span>
                                    {match.dbInvoiceNumber && (
                                      <span className="text-xs text-gray-500 line-through">{match.dbInvoiceNumber}</span>
                                    )}
                                    <div className="mt-1">
                                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                        {match.coretaxStatus}
                                      </Badge>
                                      {match.dbStatus && match.dbStatus !== match.coretaxStatus && (
                                        <span className="text-xs text-gray-500 ml-2 line-through">{match.dbStatus}</span>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <Check className="h-3 w-3 mr-1" />
                                    {match.matchQuality}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No records found that need updating
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Tab for manual review */}
              <TabsContent value="manual">
                <div className="rounded-md border">
                  {previewResult.matchResults.some(m => m.actionNeeded === 'manual') ? (
                    <>
                      <div className="p-2 bg-gray-50 border-b">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleSelectAll('manual')}
                        >
                          Toggle Select All
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Coretax Data</TableHead>
                            <TableHead>Database Data</TableHead>
                            <TableHead>Invoice Number</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewResult.matchResults
                            .filter(match => match.actionNeeded === 'manual')
                            .map(match => (
                              <TableRow key={`${match.coretaxReference}-${match.dbId}`}>
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedRecords.has(match.dbId || '')}
                                    onCheckedChange={() => toggleSelect(match.dbId || '')}
                                    disabled={!match.dbId}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{match.coretaxReference}</div>
                                  <div className="text-xs text-gray-500">{match.dbReference || 'No match'}</div>
                                </TableCell>
                                <TableCell>
                                  <div>{match.coretaxBuyer}</div>
                                  <div className="text-xs text-gray-500">{match.coretaxTIN}</div>
                                  <div className="text-xs text-gray-500">{match.coretaxDate}</div>
                                </TableCell>
                                <TableCell>
                                  {match.dbBuyer ? (
                                    <>
                                      <div>{match.dbBuyer}</div>
                                      <div className="text-xs text-gray-500">{match.dbTIN}</div>
                                      <div className="text-xs text-gray-500">{match.dbDate}</div>
                                    </>
                                  ) : (
                                    <span className="text-gray-400">No match found</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-amber-600 font-medium">{match.coretaxInvoiceNumber}</span>
                                    {match.dbInvoiceNumber && (
                                      <span className="text-xs text-gray-500 line-through">{match.dbInvoiceNumber}</span>
                                    )}
                                    <div className="mt-1">
                                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                        {match.coretaxStatus}
                                      </Badge>
                                      {match.dbStatus && match.dbStatus !== match.coretaxStatus && (
                                        <span className="text-xs text-gray-500 ml-2 line-through">{match.dbStatus}</span>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {match.matchQuality}
                                  </Badge>
                                  <p className="text-xs text-gray-500 mt-1">{match.matchReason}</p>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No records found that need manual review
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Tab for no action needed */}
              <TabsContent value="ignore">
                <div className="rounded-md border">
                  {previewResult.matchResults.some(m => m.actionNeeded === 'ignore') ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference</TableHead>
                          <TableHead>Buyer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Invoice Number</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewResult.matchResults
                          .filter(match => match.actionNeeded === 'ignore')
                          .map(match => (
                            <TableRow key={`${match.coretaxReference}-${match.dbId}`}>
                              <TableCell>
                                <div className="font-medium">{match.coretaxReference}</div>
                              </TableCell>
                              <TableCell>
                                <div>{match.coretaxBuyer}</div>
                                <div className="text-xs text-gray-500">{match.coretaxTIN}</div>
                              </TableCell>
                              <TableCell>{match.coretaxDate}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-gray-600 font-medium">{match.coretaxInvoiceNumber}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                  <Check className="h-3 w-3 mr-1" />
                                  Already updated
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No records found that are already up-to-date
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div>
              <p className="text-sm text-gray-500">
                {selectedRecords.size} record(s) selected for update
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setPreviewResult(null);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={selectedRecords.size === 0 || isUpdating}
                onClick={handleApplyUpdates}
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Apply Updates
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      
      {updateResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-green-500" />
              Update Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Successfully Updated</p>
                <p className="text-2xl font-bold text-green-600">{updateResult.successful}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Failed Updates</p>
                <p className="text-2xl font-bold text-red-600">{updateResult.failed}</p>
              </div>
            </div>
            
            {updateResult.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Errors</h3>
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {updateResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <p className="text-sm text-gray-500">
              {updateResult.successful} invoice numbers have been successfully updated.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Upload Another File
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}