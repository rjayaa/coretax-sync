// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { FormField } from '../FakturForm/FormField';
// import { DetailFakturData } from '@/types/faktur';
// import { validateDetailData } from '@/lib/utils/validation';
// import { INITIAL_DETAIL_STATE } from '@/constants/faktur';
// import { calculateDetailValues } from '@/lib/utils/calculations';
// import { useSatuanUkur } from '@/hooks/use-satuan-ukur';
// import { useMasterDataBarang } from '@/hooks/use-master-barang';
// import { useMasterDataJasa } from '@/hooks/use-master-jasa';
// import { SelectField } from './SelectField';
// import { CurrencyField } from './CurrencyField';
// import { SearchModal } from './SearchBarangJasaModal';
// import SearchSatuanModal from './SearchSatuanModal';
// import { Search, Download, AlertTriangle, Save, Bug } from 'lucide-react';
// import { Label } from '../ui/label';
// import { v4 as uuidv4 } from 'uuid';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { toast } from '@/hooks/use-toast';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// interface DetailFakturFormProps {
//   fakturId: string;
//   onSubmit: (data: DetailFakturData & { id_detail_faktur: string }) => void;
//   initialData?: DetailFakturData;
//   isEdit?: boolean;
//   hideFormTitle?: boolean;
// }

// const DetailFakturForm: React.FC<DetailFakturFormProps> = ({
//   fakturId,
//   onSubmit,
//   initialData,
//   isEdit = false,
//   hideFormTitle = false
// }) => {
//   const [detailData, setDetailData] = useState<DetailFakturData & { selectedItem?: any, id_detail_faktur?: string }>({
//     ...INITIAL_DETAIL_STATE,
//     id_faktur: fakturId
//   });
  
//   const { data: satuanUkurList = [], isLoading: isLoadingSatuanUkur } = useSatuanUkur();
//   const { data: masterBarangList = [], isLoading: isLoadingBarang } = useMasterDataBarang();
//   const { data: masterJasaList = [], isLoading: isLoadingJasa } = useMasterDataJasa();
//   const [errors, setErrors] = useState<Partial<Record<keyof DetailFakturData, string>>>({});
//   const [searchModalOpen, setSearchModalOpen] = useState(false);
//   const [searchSatuanModalOpen, setSearchSatuanModalOpen] = useState(false);
//   const [fakturWarning, setFakturWarning] = useState<boolean>(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showDebug, setShowDebug] = useState(false);
  
//   // Ref to track if satuan options are loaded
//   const satuanOptionsLoaded = useRef(false);

//   // Memastikan fakturId valid
//   const isFakturIdValid = fakturId && fakturId.length > 0;

//   // Initialize form with initial data if provided (edit mode)
//   useEffect(() => {
//     if (initialData) {
//       console.log("Setting initial detail data:", initialData);
      
//       // If we're in edit mode, make sure to include the id_detail_faktur
//       setDetailData({
//         ...initialData,
//         id_detail_faktur: initialData.id_detail_faktur,
//         id_faktur: fakturId
//       });
//     } else {
//       // Reset form for create mode
//       setDetailData({
//         ...INITIAL_DETAIL_STATE,
//         id_faktur: fakturId
//       });
//     }
//   }, [initialData, fakturId]);

//   // Track when satuan options are loaded
//   useEffect(() => {
//     if (satuanUkurList.length > 0) {
//       satuanOptionsLoaded.current = true;
//       console.log('Satuan ukur options loaded:', satuanUkurList);
//     }
//   }, [satuanUkurList]);

//   // Pastikan fakturId diperbarui di state saat props berubah
//   useEffect(() => {
//     if (fakturId) {
//       setDetailData(prev => ({
//         ...prev,
//         id_faktur: fakturId
//       }));
//       setFakturWarning(false);
//     } else {
//       setFakturWarning(true);
//     }
//   }, [fakturId]);

//   useEffect(() => {
//     if (detailData.harga_satuan && detailData.jumlah_barang_jasa) {
//       const { dpp, dpp_nilai_lain, ppn } = calculateDetailValues(
//         parseFloat(detailData.harga_satuan),
//         parseFloat(detailData.jumlah_barang_jasa),
//         parseFloat(detailData.total_diskon)
//       );

//       setDetailData(prev => ({
//         ...prev,
//         dpp: dpp.toString(),
//         dpp_nilai_lain: dpp_nilai_lain.toString(),
//         ppn: ppn.toString()
//       }));
//     }
//   }, [detailData.harga_satuan, detailData.jumlah_barang_jasa, detailData.total_diskon]);

//   // Recalculate PPnBM when tarif changes
//   useEffect(() => {
//     if (detailData.dpp && detailData.tarif_ppnbm) {
//       const ppnbm = (parseFloat(detailData.dpp) * parseFloat(detailData.tarif_ppnbm)) / 100;
//       setDetailData(prev => ({
//         ...prev,
//         ppnbm: ppnbm.toString()
//       }));
//     }
//   }, [detailData.dpp, detailData.tarif_ppnbm]);
  
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const validationErrors = validateDetailData(detailData);
    
//     // Tambahan validasi untuk fakturId
//     if (!isFakturIdValid) {
//       setFakturWarning(true);
//       toast({
//         title: "Error",
//         description: "Faktur ID tidak valid. Silakan simpan faktur utama terlebih dahulu.",
//         variant: "destructive"
//       });
//       return;
//     }
    
//     if (Object.keys(validationErrors).length === 0) {
//       setIsSubmitting(true);
      
//       try {
//         // Calculate data for different fields based on barang or jasa
//         const submissionData = {
//           ...detailData,
//           id_detail_faktur: isEdit ? detailData.id_detail_faktur! : uuidv4(),
//           id_faktur: fakturId,
//           jumlah_barang: detailData.barang_or_jasa === 'a' ? detailData.jumlah_barang_jasa : null,
//           jumlah_jasa: detailData.barang_or_jasa === 'b' ? detailData.jumlah_barang_jasa : null,
//         };
        
//         console.log('Final submission data:', submissionData);
//         onSubmit(submissionData);
        
//         // Only reset form if we're not in edit mode
//         if (!isEdit) {
//           setDetailData({ 
//             ...INITIAL_DETAIL_STATE, 
//             id_faktur: fakturId 
//           });
//         }
        
//         setErrors({});
//       } finally {
//         setIsSubmitting(false);
//       }
//     } else {
//       setErrors(validationErrors);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setDetailData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     if (errors[name as keyof DetailFakturData]) {
//       setErrors(prev => ({ ...prev, [name]: undefined }));
//     }
//   };

//   const handleSelectChange = (field: string, value: string) => {
//     console.log(`Changing ${field} to:`, value);
    
//     setDetailData(prev => {
//       const newData = { ...prev, [field]: value };
      
//       if (field === 'barang_or_jasa') {
//         newData.nama_barang_or_jasa = '';
//         newData.kode_barang_or_jasa = '';
//       }
      
//       return newData;
//     });
    
//     if (errors[field as keyof DetailFakturData]) {
//       setErrors(prev => ({ ...prev, [field]: undefined }));
//     }
//   };

//   const handleCurrencyChange = (field: keyof DetailFakturData) => (value: string) => {
//     setDetailData(prev => ({
//       ...prev,
//       [field]: value
//     }));
    
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: undefined }));
//     }
//   };

//   // Get the display name for the selected satuan
//   const getSelectedSatuanUkur = () => {
//     if (!detailData.nama_satuan_ukur) return "Pilih satuan";
    
//     const found = satuanUkurList.find(su => su.id === detailData.nama_satuan_ukur);
//     return found ? `${found.id} - ${found.satuan}` : detailData.nama_satuan_ukur;
//   };

//   // Calculated total price
//   const totalPrice = detailData.harga_satuan && detailData.jumlah_barang_jasa
//     ? parseFloat(detailData.harga_satuan) * parseFloat(detailData.jumlah_barang_jasa)
//     : 0;

//   // Header content with optional debug button
//   const formHeader = !hideFormTitle && (
//     <CardHeader className="pb-3 flex flex-row justify-between items-center">
//       <CardTitle>{isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</CardTitle>
//       {isEdit && (
//         <Button 
//           variant="ghost" 
//           size="sm" 
//           onClick={() => setShowDebug(!showDebug)}
//           className="text-xs"
//         >
//           <Bug className="h-3 w-3 mr-1" />
//           {showDebug ? 'Hide' : 'Debug'}
//         </Button>
//       )}
//       {fakturWarning && (
//         <Alert variant="destructive" className="mt-2">
//           <AlertTriangle className="h-4 w-4" />
//           <AlertDescription>
//             Pastikan Anda menyimpan Faktur terlebih dahulu sebelum menambahkan Detail Faktur.
//           </AlertDescription>
//         </Alert>
//       )}
//     </CardHeader>
//   );

//   // Debug info section
//   const debugSection = showDebug && (
//     <div className="px-6 py-2 bg-black text-green-400 text-xs font-mono overflow-auto rounded mx-6 mb-4" style={{maxHeight: '200px'}}>
//       <p>detailData: {JSON.stringify(detailData, null, 2)}</p>
//       <p>satuan List: {JSON.stringify(satuanUkurList.map(s => ({id: s.id, satuan: s.satuan})), null, 2)}</p>
//     </div>
//   );

//   // Render content inside or outside Card based on hideFormTitle
//   const formContent = (
//     <>
//       {debugSection}
      
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Hidden field for fakturId */}
//         <input 
//           type="hidden" 
//           name="id_faktur" 
//           value={fakturId} 
//         />
        
//         {/* Hidden field for detail ID if in edit mode */}
//         {isEdit && detailData.id_detail_faktur && (
//           <input 
//             type="hidden" 
//             name="id_detail_faktur" 
//             value={detailData.id_detail_faktur} 
//           />
//         )}
        
//         <div className="grid grid-cols-2 gap-8">
//           {/* Left Column */}
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>Tipe</Label>
//               <RadioGroup
//                 value={detailData.barang_or_jasa}
//                 onValueChange={(value) => handleSelectChange('barang_or_jasa', value)}
//                 className="flex space-x-6"
//               >
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="a" id="barang" />
//                   <Label htmlFor="barang" className="cursor-pointer">Barang</Label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="b" id="jasa" />
//                   <Label htmlFor="jasa" className="cursor-pointer">Jasa</Label>
//                 </div>
//               </RadioGroup>
//               {errors.barang_or_jasa && (
//                 <p className="text-sm text-red-500">{errors.barang_or_jasa}</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="kode_barang_or_jasa">Kode</Label>
//               <div className="flex gap-2">
//                 <div className="flex-grow">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="w-full justify-between"
//                     onClick={() => setSearchModalOpen(true)}
//                     disabled={!detailData.barang_or_jasa}
//                   >
//                     {detailData.kode_barang_or_jasa ? (
//                       <span className="truncate max-w-[300px] inline-block">{detailData.kode_barang_or_jasa}</span>
//                     ) : (
//                       <span className="text-muted-foreground">
//                         {`Pilih kode ${detailData.barang_or_jasa === 'a' ? 'barang' : detailData.barang_or_jasa === 'b' ? 'jasa' : ''}`}
//                       </span>
//                     )}
//                     <Search className="h-4 w-4 ml-2" />
//                   </Button>
//                 </div>
             
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="nama_barang_or_jasa">
//                 Nama {detailData.barang_or_jasa === 'a' ? 'Barang' : 'Jasa'} *
//                 {detailData.kode_barang_or_jasa && (
//                   <span className="text-xs text-muted-foreground ml-1">(nama dapat disesuaikan)</span>
//                 )}
//               </Label>
//               <FormField
//                 id="nama_barang_or_jasa"
//                 name="nama_barang_or_jasa"
//                 value={detailData.nama_barang_or_jasa}
//                 onChange={handleChange}
//                 error={errors.nama_barang_or_jasa}
//                 required
//                 placeholder={`Masukkan nama ${detailData.barang_or_jasa === 'a' ? 'barang' : 'jasa'}`}
//                 label={''}
//               />
//             </div>

//             {/* Satuan field using search button */}
//             <div className="space-y-2">
//               <Label htmlFor="nama_satuan_ukur" className={errors.nama_satuan_ukur ? "text-red-500" : ""}>
//                 Satuan {errors.nama_satuan_ukur && "*"}
//               </Label>
//               <div className="flex gap-2">
//                 <div className="flex-grow">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className={`w-full justify-between ${errors.nama_satuan_ukur ? "border-red-500" : ""}`}
//                     onClick={() => setSearchSatuanModalOpen(true)}
//                     disabled={isLoadingSatuanUkur}
//                   >
//                     {detailData.nama_satuan_ukur ? (
//                       <span className="truncate max-w-[300px] inline-block">
//                         {getSelectedSatuanUkur()}
//                       </span>
//                     ) : (
//                       <span className="text-muted-foreground">
//                         Pilih satuan
//                       </span>
//                     )}
//                     <Search className="h-4 w-4 ml-2" />
//                   </Button>
//                 </div>
//               </div>
//               {errors.nama_satuan_ukur && (
//                 <p className="text-sm text-red-500">{errors.nama_satuan_ukur}</p>
//               )}
//             </div>

//             <CurrencyField
//               id="harga_satuan"
//               label="Harga Satuan"
//               value={detailData.harga_satuan}
//               onChange={handleCurrencyChange('harga_satuan')}
//               error={errors.harga_satuan}
//               required
//             />

//             <div className="space-y-2">
//               <Label htmlFor="jumlah_barang_jasa">KUANTITAS</Label>
//               <FormField
//                 id="jumlah_barang_jasa"
//                 name="jumlah_barang_jasa"
//                 type="number"
//                 value={detailData.jumlah_barang_jasa}
//                 onChange={handleChange}
//                 error={errors.jumlah_barang_jasa}
//                 required 
//                 label={''}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="total_harga">Total Harga</Label>
//               <CurrencyField
//                 id="total_harga"
//                 value={totalPrice.toString()}
//                 onChange={() => { } }
//                 label={''}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="total_diskon">Potongan harga</Label>
//               <FormField
//                 id="total_diskon"
//                 name="total_diskon"
//                 type="number"
//                 value={detailData.total_diskon}
//                 onChange={handleChange}
//                 step="0.01"
//                 min="0"
//                 max="100" 
//                 label={''}
//               />
//             </div>
//           </div>

//           {/* Right Column */}
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label className="text-lg font-medium">PPN dan PPnBM</Label>
//               <div className="pt-2">
//                 <CurrencyField
//                   id="dpp"
//                   label="DPP"
//                   value={detailData.dpp}
//                   onChange={handleCurrencyChange('dpp')}
//                 />
//               </div>
//             </div>
            
//             <CurrencyField
//               id="dpp_nilai_lain"
//               label="DPP Nilai Lain"
//               value={detailData.dpp_nilai_lain}
//               onChange={handleCurrencyChange('dpp_nilai_lain')}
              
//             />
            
//             <div className="space-y-2">
//               <Label htmlFor="tarif_ppn">Tarif PPN</Label>
//               <SelectField
//                 id="tarif_ppn"
//                 value={detailData.tarif_ppn}
//                 onChange={(value) => handleSelectChange('tarif_ppn', value)}
//                 options={[{ value: '12.00', label: '12%' }]}
//                 placeholder="Pilih tarif" 
//                 label={''}
//               />
//             </div>

//             <CurrencyField
//               id="ppn"
//               label="PPN"
//               value={detailData.ppn}
//               onChange={handleCurrencyChange('ppn')}
//             />

//             <div className="space-y-2">
//               <Label htmlFor="tarif_ppnbm">Tarif PPnBM (%)</Label>
//               <FormField
//                 id="tarif_ppnbm"
//                 name="tarif_ppnbm"
//                 type="number"
//                 value={detailData.tarif_ppnbm}
//                 onChange={handleChange}
//                 step="0.01"
//                 min="0" 
//                 label={''}
//               />
//             </div>

//             <CurrencyField
//               id="ppnbm"
//               label="PPnBM"
//               value={detailData.ppnbm}
//               onChange={handleCurrencyChange('ppnbm')}
         
//             />
//           </div>
//         </div>

//         <div className="flex justify-end space-x-4 pt-4">
//           <Button 
//             type="submit" 
//             className="px-8 bg-blue-500 hover:bg-blue-600"
//             disabled={!isFakturIdValid || fakturWarning || isSubmitting}
//           >
//             {isSubmitting ? 'Menyimpan...' : (
//               <>
//                 <Save className="h-4 w-4 mr-1" />
//                 {isEdit ? 'Perbarui' : 'Simpan'}
//               </>
//             )}
//           </Button>
//         </div>
//       </form>
//     </>
//   );

//   return (
//     <>
//       {/* Main form */}
//       {hideFormTitle ? (
//         <>
//           {fakturWarning && (
//             <Alert variant="destructive" className="mb-4">
//               <AlertTriangle className="h-4 w-4" />
//               <AlertDescription>
//                 Pastikan Anda menyimpan Faktur terlebih dahulu sebelum menambahkan Detail Faktur.
//               </AlertDescription>
//             </Alert>
//           )}
//           {formContent}
//         </>
//       ) : (
//         <Card className="w-full">
//           {formHeader}
//           <CardContent>
//             {formContent}
//           </CardContent>
//         </Card>
//       )}
      
//       {/* Search modals */}
//       <SearchModal
//         open={searchModalOpen}
//         onOpenChange={setSearchModalOpen}
//         items={detailData.barang_or_jasa === 'a' ? masterBarangList : masterJasaList}
//         onSelect={(item) => {
//           const kodeValue = detailData.barang_or_jasa === 'a' ? item.kode_barang : item.kode_jasa;
          
//           setDetailData(prev => ({
//             ...prev,
//             nama_barang_or_jasa: item.bahasa,
//             kode_barang_or_jasa: kodeValue,
//             selectedItem: item // Simpan item asli untuk referensi
//           }));
//           setSearchModalOpen(false);
//         }}
//         title={`Pilih ${detailData.barang_or_jasa === 'a' ? 'Barang' : 'Jasa'}`}
//         searchByCode
//       />
      
//       {/* Satuan search modal */}
//       <SearchSatuanModal
//         open={searchSatuanModalOpen}
//         onOpenChange={setSearchSatuanModalOpen}
//         items={satuanUkurList}
//         onSelect={(item) => {
//           // Hanya simpan ID-nya saja
//           setDetailData(prev => ({
//             ...prev,
//             nama_satuan_ukur: item.id
//           }));
//         }}
//       />
//     </>
//   );
// };

// export default DetailFakturForm;

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '../FakturForm/FormField';
import { DetailFakturData } from '@/types/faktur';
import { validateDetailData } from '@/lib/utils/validation';
import { INITIAL_DETAIL_STATE } from '@/constants/faktur';
import { calculateDetailValues } from '@/lib/utils/calculations';
import { useSatuanUkur } from '@/hooks/use-satuan-ukur';
import { useMasterDataBarang } from '@/hooks/use-master-barang';
import { useMasterDataJasa } from '@/hooks/use-master-jasa';
import { SelectField } from './SelectField';
import { CurrencyField } from './CurrencyField';
import { SearchModal } from './SearchBarangJasaModal';
import SearchSatuanModal from './SearchSatuanModal';
import { Search, Download, AlertTriangle, Save, Bug } from 'lucide-react';
import { Label } from '../ui/label';
import { v4 as uuidv4 } from 'uuid';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DetailFakturFormProps {
  fakturId: string;
  onSubmit: (data: DetailFakturData & { id_detail_faktur: string }) => void;
  initialData?: DetailFakturData;
  isEdit?: boolean;
  hideFormTitle?: boolean;
  fakturData?: any;
}

const DetailFakturForm: React.FC<DetailFakturFormProps> = ({
  fakturId,
  onSubmit,
  initialData,
  isEdit = false,
  hideFormTitle = false,
  fakturData
}) => {
  const [detailData, setDetailData] = useState<DetailFakturData & { selectedItem?: any, id_detail_faktur?: string }>({
    ...INITIAL_DETAIL_STATE,
    id_faktur: fakturId
  });
  
  const { data: satuanUkurList = [], isLoading: isLoadingSatuanUkur } = useSatuanUkur();
  const { data: masterBarangList = [], isLoading: isLoadingBarang } = useMasterDataBarang();
  const { data: masterJasaList = [], isLoading: isLoadingJasa } = useMasterDataJasa();
  const [errors, setErrors] = useState<Partial<Record<keyof DetailFakturData, string>>>({});
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchSatuanModalOpen, setSearchSatuanModalOpen] = useState(false);
  const [fakturWarning, setFakturWarning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Ref to track if satuan options are loaded
  const satuanOptionsLoaded = useRef(false);

  // Memastikan fakturId valid
  const isFakturIdValid = fakturId && fakturId.length > 0;

  // Initialize form with initial data if provided (edit mode)
  useEffect(() => {
    if (initialData) {
      console.log("Setting initial detail data:", initialData);
      
      // If we're in edit mode, make sure to include the id_detail_faktur
      setDetailData({
        ...initialData,
        id_detail_faktur: initialData.id_detail_faktur,
        id_faktur: fakturId
      });
    } else {
      // Reset form for create mode
      setDetailData({
        ...INITIAL_DETAIL_STATE,
        id_faktur: fakturId
      });
    }
  }, [initialData, fakturId]);

  // Track when satuan options are loaded
  useEffect(() => {
    if (satuanUkurList.length > 0) {
      satuanOptionsLoaded.current = true;
    }
  }, [satuanUkurList]);

  // Pastikan fakturId diperbarui di state saat props berubah
  useEffect(() => {
    if (fakturId) {
      setDetailData(prev => ({
        ...prev,
        id_faktur: fakturId
      }));
      setFakturWarning(false);
    } else {
      setFakturWarning(true);
    }
  }, [fakturId]);

  useEffect(() => {
    if (detailData.harga_satuan && detailData.jumlah_barang_jasa) {
      const { dpp, dpp_nilai_lain, ppn } = calculateDetailValues(
        parseFloat(detailData.harga_satuan),
        parseFloat(detailData.jumlah_barang_jasa),
        parseFloat(detailData.total_diskon)
      );

      setDetailData(prev => ({
        ...prev,
        dpp: dpp.toString(),
        dpp_nilai_lain: dpp_nilai_lain.toString(),
        ppn: ppn.toString()
      }));
    }
  }, [detailData.harga_satuan, detailData.jumlah_barang_jasa, detailData.total_diskon]);

  // Recalculate PPnBM when tarif changes
  useEffect(() => {
    if (detailData.dpp && detailData.tarif_ppnbm) {
      const ppnbm = (parseFloat(detailData.dpp) * parseFloat(detailData.tarif_ppnbm)) / 100;
      setDetailData(prev => ({
        ...prev,
        ppnbm: ppnbm.toString()
      }));
    }
  }, [detailData.dpp, detailData.tarif_ppnbm]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateDetailData(detailData);
    
    // Tambahan validasi untuk fakturId
    if (!isFakturIdValid) {
      setFakturWarning(true);
      toast({
        title: "Error",
        description: "Faktur ID tidak valid. Silakan simpan faktur utama terlebih dahulu.",
        variant: "destructive"
      });
      return;
    }
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        // Calculate data for different fields based on barang or jasa
        const submissionData = {
          ...detailData,
          id_detail_faktur: isEdit ? detailData.id_detail_faktur! : uuidv4(),
          id_faktur: fakturId,
          jumlah_barang: detailData.barang_or_jasa === 'a' ? detailData.jumlah_barang_jasa : null,
          jumlah_jasa: detailData.barang_or_jasa === 'b' ? detailData.jumlah_barang_jasa : null,
        };
        
        onSubmit(submissionData);
        
        // Only reset form if we're not in edit mode
        if (!isEdit) {
          setDetailData({ 
            ...INITIAL_DETAIL_STATE, 
            id_faktur: fakturId 
          });
        }
        
        setErrors({});
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetailData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof DetailFakturData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setDetailData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'barang_or_jasa') {
        newData.nama_barang_or_jasa = '';
        newData.kode_barang_or_jasa = '';
      }
      
      return newData;
    });
    
    if (errors[field as keyof DetailFakturData]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCurrencyChange = (field: keyof DetailFakturData) => (value: string) => {
    setDetailData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Get the display name for the selected satuan
  const getSelectedSatuanUkur = () => {
    if (!detailData.nama_satuan_ukur) return "Pilih satuan";
    
    const found = satuanUkurList.find(su => su.id === detailData.nama_satuan_ukur);
    return found ? `${found.id} - ${found.satuan}` : detailData.nama_satuan_ukur;
  };

  // Calculated total price
  const totalPrice = detailData.harga_satuan && detailData.jumlah_barang_jasa
    ? parseFloat(detailData.harga_satuan) * parseFloat(detailData.jumlah_barang_jasa)
    : 0;

  // Header content with optional debug button
  const formHeader = !hideFormTitle && (
    <CardHeader className="pb-3 flex flex-row justify-between items-center">
      <CardTitle>{isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</CardTitle>
      {isEdit && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs"
        >
          <Bug className="h-3 w-3 mr-1" />
          {showDebug ? 'Hide' : 'Debug'}
        </Button>
      )}
      {fakturWarning && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Pastikan Anda menyimpan Faktur terlebih dahulu sebelum menambahkan Detail Faktur.
          </AlertDescription>
        </Alert>
      )}
    </CardHeader>
  );

  // Debug info section
  const debugSection = showDebug && (
    <div className="px-6 py-2 bg-black text-green-400 text-xs font-mono overflow-auto rounded mx-6 mb-4" style={{maxHeight: '200px'}}>
      <p>detailData: {JSON.stringify(detailData, null, 2)}</p>
      <p>satuan List: {JSON.stringify(satuanUkurList.map(s => ({id: s.id, satuan: s.satuan})), null, 2)}</p>
    </div>
  );

  // Render content inside or outside Card based on hideFormTitle
  const formContent = (
    <>
      {debugSection}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden field for fakturId */}
        <input 
          type="hidden" 
          name="id_faktur" 
          value={fakturId} 
        />
        
        {/* Hidden field for detail ID if in edit mode */}
        {isEdit && detailData.id_detail_faktur && (
          <input 
            type="hidden" 
            name="id_detail_faktur" 
            value={detailData.id_detail_faktur} 
          />
        )}

        {/* LAYOUT HORIZONTAL - Baris pertama: Tipe & Kode */}
        <div className="flex flex-wrap gap-3">
          {/* Barang/Jasa selection - RadioGroup */}
          <div className="flex-1 min-w-[200px]">
            <div className="space-y-2">
              <Label>Tipe</Label>
              <RadioGroup
                value={detailData.barang_or_jasa}
                onValueChange={(value) => handleSelectChange('barang_or_jasa', value)}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="a" id="barang" />
                  <Label htmlFor="barang" className="cursor-pointer">Barang</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="b" id="jasa" />
                  <Label htmlFor="jasa" className="cursor-pointer">Jasa</Label>
                </div>
              </RadioGroup>
              {errors.barang_or_jasa && (
                <p className="text-sm text-red-500">{errors.barang_or_jasa}</p>
              )}
            </div>
          </div>

          {/* Kode Barang/Jasa dengan tombol pencarian */}
          <div className="flex-1 min-w-[200px]">
            <div className="space-y-2">
              <Label htmlFor="kode_barang_or_jasa">Kode</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setSearchModalOpen(true)}
                disabled={!detailData.barang_or_jasa}
              >
                {detailData.kode_barang_or_jasa ? (
                  <span className="truncate max-w-[200px] inline-block">{detailData.kode_barang_or_jasa}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {`Pilih kode ${detailData.barang_or_jasa === 'a' ? 'barang' : detailData.barang_or_jasa === 'b' ? 'jasa' : ''}`}
                  </span>
                )}
                <Search className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* LAYOUT HORIZONTAL - Baris kedua: Nama & Satuan */}
        <div className="flex flex-wrap gap-3">
          {/* Nama Barang/Jasa */}
          <div className="flex-1 min-w-[200px]">
            <div className="space-y-2">
              <Label htmlFor="nama_barang_or_jasa">
                Nama {detailData.barang_or_jasa === 'a' ? 'Barang' : 'Jasa'} *
                {detailData.kode_barang_or_jasa && (
                  <span className="text-xs text-muted-foreground ml-1">(nama dapat disesuaikan)</span>
                )}
              </Label>
              <FormField
                id="nama_barang_or_jasa"
                name="nama_barang_or_jasa"
                value={detailData.nama_barang_or_jasa}
                onChange={handleChange}
                error={errors.nama_barang_or_jasa}
                required
                placeholder={`Masukkan nama ${detailData.barang_or_jasa === 'a' ? 'barang' : 'jasa'}`}
                label={''}
              />
            </div>
          </div>

          {/* Satuan Ukur */}
          <div className="flex-1 min-w-[200px]">
            <div className="space-y-2">
              <Label htmlFor="nama_satuan_ukur" className={errors.nama_satuan_ukur ? "text-red-500" : ""}>
                Satuan {errors.nama_satuan_ukur && "*"}
              </Label>
              <Button
                type="button"
                variant="outline"
                className={`w-full justify-between ${errors.nama_satuan_ukur ? "border-red-500" : ""}`}
                onClick={() => setSearchSatuanModalOpen(true)}
                disabled={isLoadingSatuanUkur}
              >
                {detailData.nama_satuan_ukur ? (
                  <span className="truncate max-w-[200px] inline-block">
                    {getSelectedSatuanUkur()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Pilih satuan
                  </span>
                )}
                <Search className="h-4 w-4 ml-2" />
              </Button>
              {errors.nama_satuan_ukur && (
                <p className="text-sm text-red-500">{errors.nama_satuan_ukur}</p>
              )}
            </div>
          </div>
        </div>

        {/* LAYOUT HORIZONTAL - Baris ketiga: Harga & Kuantitas */}
        <div className="flex flex-wrap gap-3">
          {/* Harga Satuan */}
          <div className="flex-1 min-w-[150px]">
            <CurrencyField
              id="harga_satuan"
              label="Harga Satuan"
              value={detailData.harga_satuan}
              onChange={handleCurrencyChange('harga_satuan')}
              error={errors.harga_satuan}
              required
            />
          </div>

          {/* Kuantitas */}
          <div className="flex-1 min-w-[150px]">
            <div className="space-y-2">
              <Label htmlFor="jumlah_barang_jasa">KUANTITAS</Label>
              <FormField
                id="jumlah_barang_jasa"
                name="jumlah_barang_jasa"
                type="number"
                value={detailData.jumlah_barang_jasa}
                onChange={handleChange}
                error={errors.jumlah_barang_jasa}
                required 
                label={''}
              />
            </div>
          </div>

          {/* Total Harga */}
          <div className="flex-1 min-w-[150px]">
            <div className="space-y-2">
              <Label htmlFor="total_harga">Total Harga</Label>
              <CurrencyField
                id="total_harga"
                value={totalPrice.toString()}
                onChange={() => { } }
                label={''}
              />
            </div>
          </div>

          {/* Potongan harga */}
          <div className="flex-1 min-w-[150px]">
            <div className="space-y-2">
              <Label htmlFor="total_diskon">Potongan harga</Label>
              <FormField
                id="total_diskon"
                name="total_diskon"
                type="number"
                value={detailData.total_diskon}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100" 
                label={''}
              />
            </div>
          </div>
        </div>

        {/* LAYOUT HORIZONTAL - Baris keempat: PPN & PPnBM fields */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[150px]">
            <div className="space-y-2">
              <Label>DPP</Label>
              <CurrencyField
                id="dpp"
                label=""
                value={detailData.dpp}
                onChange={handleCurrencyChange('dpp')}
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <div className="space-y-2">
              <Label>DPP Nilai Lain</Label>
              <CurrencyField
                id="dpp_nilai_lain"
                label=""
                value={detailData.dpp_nilai_lain}
                onChange={handleCurrencyChange('dpp_nilai_lain')}
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <div className="space-y-2">
              <Label htmlFor="tarif_ppn">Tarif PPN</Label>
              <SelectField
                id="tarif_ppn"
                value={detailData.tarif_ppn}
                onChange={(value) => handleSelectChange('tarif_ppn', value)}
                options={[{ value: '12.00', label: '12%' }]}
                placeholder="Pilih tarif" 
                label={''}
              />
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <div className="space-y-2">
              <Label>PPN</Label>
              <CurrencyField
                id="ppn"
                label=""
                value={detailData.ppn}
                onChange={handleCurrencyChange('ppn')}
              />
            </div>
          </div>
        </div>

        {/* LAYOUT HORIZONTAL - Baris kelima: PPnBM fields */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[150px]">
            <div className="space-y-2">
              <Label htmlFor="tarif_ppnbm">Tarif PPnBM (%)</Label>
              <FormField
                id="tarif_ppnbm"
                name="tarif_ppnbm"
                type="number"
                value={detailData.tarif_ppnbm}
                onChange={handleChange}
                step="0.01"
                min="0" 
                label={''}
              />
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <div className="space-y-2">
              <Label>PPnBM</Label>
              <CurrencyField
                id="ppnbm"
                label=""
                value={detailData.ppnbm}
                onChange={handleCurrencyChange('ppnbm')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="submit" 
            className="px-8 bg-blue-500 hover:bg-blue-600"
            disabled={!isFakturIdValid || fakturWarning || isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {isEdit ? 'Perbarui' : 'Simpan'}
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );

  return (
    <>
      {/* Main form */}
      {hideFormTitle ? (
        <>
          {fakturWarning && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Pastikan Anda menyimpan Faktur terlebih dahulu sebelum menambahkan Detail Faktur.
              </AlertDescription>
            </Alert>
          )}
          {formContent}
        </>
      ) : (
        <Card className="w-full">
          {formHeader}
          <CardContent>
            {formContent}
          </CardContent>
        </Card>
      )}
      
      {/* Search modals */}
      <SearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        items={detailData.barang_or_jasa === 'a' ? masterBarangList : masterJasaList}
        onSelect={(item) => {
          const kodeValue = detailData.barang_or_jasa === 'a' ? item.kode_barang : item.kode_jasa;
          
          setDetailData(prev => ({
            ...prev,
            nama_barang_or_jasa: item.bahasa,
            kode_barang_or_jasa: kodeValue,
            selectedItem: item // Simpan item asli untuk referensi
          }));
          setSearchModalOpen(false);
        }}
        title={`Pilih ${detailData.barang_or_jasa === 'a' ? 'Barang' : 'Jasa'}`}
        searchByCode
      />
      
      {/* Satuan search modal */}
      <SearchSatuanModal
        open={searchSatuanModalOpen}
        onOpenChange={setSearchSatuanModalOpen}
        items={satuanUkurList}
        onSelect={(item) => {
          // Hanya simpan ID-nya saja
          setDetailData(prev => ({
            ...prev,
            nama_satuan_ukur: item.id
          }));
        }}
      />
    </>
  );
};

export default DetailFakturForm;