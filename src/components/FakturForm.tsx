// // src/components/FakturForm.tsx
// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { FormField } from '@/components/ui/form-field';
// import { FakturData } from '@/types/faktur';
// import { validateFakturData } from '@/lib/utils/validation';
// import { INITIAL_FAKTUR_STATE } from '@/constants/faktur';
// import { Label } from '@/components/ui/label';
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Bug } from 'lucide-react';

// interface FakturFormProps {
//   initialData?: FakturData;
//   isEdit?: boolean;
//   readOnlyCustomer?: boolean;
//   onSubmit: (data: FakturData) => void;
// }

// const FakturForm = ({ initialData, isEdit, readOnlyCustomer = false, onSubmit }: FakturFormProps) => {
//   const [fakturData, setFakturData] = useState<FakturData>(INITIAL_FAKTUR_STATE);
//   const [errors, setErrors] = useState<Partial<Record<keyof FakturData, string>>>({});
//   const [showDebug, setShowDebug] = useState(false);
  
//   // Initialize form with initial data if provided
//   useEffect(() => {
//     if (initialData) {
//       console.log('Setting initial faktur data:', initialData);
//       setFakturData(initialData);
//     } else {
//       // For create mode, use default state
//       setFakturData(INITIAL_FAKTUR_STATE);
//     }
//   }, [initialData]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const validationErrors = validateFakturData(fakturData);
    
//     if (Object.keys(validationErrors).length === 0) {
//       onSubmit(fakturData);
//     } else {
//       setErrors(validationErrors);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFakturData(prev => {
//       const newData = { ...prev, [name]: value };
//       if (name === 'npwp_penjual') {
//         newData.id_tku_penjual = value ? `${value}000000` : '';
//       }
//       if (name === 'npwp_nik_pembeli') {
//         newData.id_tku_pembeli = value ? `${value}000000` : '';
//       }
//       return newData;
//     });
//   };

//   const handleSelectChange = (field: string, value: string) => {
//     setFakturData(prev => {
//       return { ...prev, [field]: value };
//     });
    
//     if (errors[field as keyof FakturData]) {
//       setErrors(prev => ({ ...prev, [field]: undefined }));
//     }
//   };

//   const handleCheckboxChange = (tipeTransaksi: string) => {
//     setFakturData(prev => ({
//       ...prev,
//       tipe_transaksi: prev.tipe_transaksi === tipeTransaksi ? '' : tipeTransaksi
//     }));
//   };

//   return (
//     <Card className="w-full">
//       <CardHeader className="pb-3 flex flex-row justify-between items-center">
//         <CardTitle>{isEdit ? 'Edit Data Faktur' : 'Input Faktur'}</CardTitle>
//         {isEdit && (
//           <Button 
//             variant="ghost" 
//             size="sm" 
//             onClick={() => setShowDebug(!showDebug)}
//             className="text-xs"
//           >
//             <Bug className="h-3 w-3 mr-1" />
//             {showDebug ? 'Hide' : 'Debug'}
//           </Button>
//         )}
//       </CardHeader>
      
//       {showDebug && (
//         <div className="px-6 py-2 bg-black text-green-400 text-xs font-mono overflow-auto rounded mx-6 mb-4" style={{maxHeight: '200px'}}>
//           <p>fakturData: {JSON.stringify(fakturData, null, 2)}</p>
//         </div>
//       )}
      
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Tipe Transaksi - Checkbox section */}
//           <div className="space-y-3">
//             <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tipe Transaksi</h2>
//             <div className="flex flex-wrap gap-8">
//               <div className="flex items-center space-x-2">
//                 <Checkbox 
//                   id="uang-muka" 
//                   checked={fakturData.tipe_transaksi === 'Uang Muka'}
//                   onCheckedChange={() => handleCheckboxChange('Uang Muka')}
//                 />
//                 <Label htmlFor="uang-muka" className="cursor-pointer">Uang Muka</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Checkbox 
//                   id="pelunasan" 
//                   checked={fakturData.tipe_transaksi === 'Pelunasan'}
//                   onCheckedChange={() => handleCheckboxChange('Pelunasan')}
//                 />
//                 <Label htmlFor="pelunasan" className="cursor-pointer">Pelunasan</Label>
//               </div>
//             </div>
//           </div>
          
//           {/* Data Penjual - Layout horizontal */}
//           <div className="space-y-3">
//             <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Data Penjual</h2>
//             <div className="flex flex-wrap gap-3">
//               <div className="flex-1 min-w-[250px]">
//                 <FormField
//                   id="npwp_penjual"
//                   label="NPWP Penjual"
//                   value={fakturData.npwp_penjual}
//                   onChange={handleChange}
//                   error={errors.npwp_penjual}
//                   required
//                   readOnly={isEdit}
//                 />
//               </div>

//               <div className="flex-1 min-w-[250px]">
//                 <FormField
//                   id="id_tku_penjual"
//                   label="ID TKU Penjual"
//                   value={fakturData.id_tku_penjual}
//                   onChange={handleChange}
//                   error={errors.id_tku_penjual}
//                   required
//                   readOnly={isEdit}
//                 />
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-3">
//               <div className="flex-1 min-w-[250px]">
//                 <FormField
//                   id="tanggal_faktur"
//                   label="Tanggal Faktur"
//                   type="date"
//                   value={fakturData.tanggal_faktur}
//                   onChange={handleChange}
//                   error={errors.tanggal_faktur}
//                   required
//                 />
//               </div>

//               <div className="flex-1 min-w-[250px]">
//                 <div className="space-y-2">
//                   <Label htmlFor="jenis_faktur">Jenis Faktur</Label>
//                   <Select
//                     value={fakturData.jenis_faktur}
//                     onValueChange={(value) => handleSelectChange('jenis_faktur', value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Pilih jenis faktur" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Normal">Normal</SelectItem>
//                       <SelectItem value="Pengganti">Pengganti</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </div>

//             {/* Nomor Faktur Pajak dan Status Faktur */}
//             <div className="flex flex-wrap gap-3">
//               <div className="flex-1 min-w-[250px]">
//                 <FormField
//                   id="nomor_faktur_pajak"
//                   label="Nomor Faktur Pajak"
//                   value={fakturData.nomor_faktur_pajak || ''}
//                   onChange={handleChange}
//                   placeholder="Masukkan nomor faktur pajak (jika ada)"
//                   readOnly={!isEdit}
//                 />
//               </div>
              
//               {fakturData.status_faktur && (
//                 <div className="flex-1 min-w-[250px]">
//                   <div className="space-y-2">
//                     <Label htmlFor="status_faktur">Status Faktur</Label>
//                     <div className="h-10 px-3 py-2 border rounded-md bg-muted/30 flex items-center">
//                       <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                         fakturData.status_faktur === 'APPROVED' ? 'bg-green-100 text-green-800' :
//                         fakturData.status_faktur === 'CREATED' ? 'bg-blue-100 text-blue-800' :
//                         fakturData.status_faktur === 'AMENDED' ? 'bg-yellow-100 text-yellow-800' :
//                         fakturData.status_faktur === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''
//                       }`}>
//                         {fakturData.status_faktur}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Data Pembeli - Layout horizontal */}
//           <div className="space-y-3">
//             <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Data Pembeli</h2>
            
//             <div className="flex flex-wrap gap-3">
//               <div className="flex-1 min-w-[250px]">
//                 <FormField
//                   id="npwp_nik_pembeli"
//                   label="NPWP/NIK Pembeli"
//                   value={fakturData.npwp_nik_pembeli}
//                   onChange={handleChange}
//                   error={errors.npwp_nik_pembeli}
//                   required
//                   readOnly={readOnlyCustomer}
//                 />
//               </div>

//               <div className="flex-1 min-w-[250px]">
//                 <FormField
//                   id="nama_pembeli"
//                   label="Nama Pembeli"
//                   value={fakturData.nama_pembeli}
//                   onChange={handleChange}
//                   error={errors.nama_pembeli}
//                   required
//                   readOnly={readOnlyCustomer}
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="alamat_pembeli">
//                 Alamat Pembeli
//                 {errors.alamat_pembeli && (
//                   <span className="text-sm text-red-500 ml-1">*</span>
//                 )}
//               </Label>
//               <Textarea
//                 id="alamat_pembeli"
//                 name="alamat_pembeli"
//                 value={fakturData.alamat_pembeli}
//                 onChange={handleChange}
//                 className={`min-h-[60px] ${errors.alamat_pembeli ? 'border-red-500' : ''}`}
//                 readOnly={readOnlyCustomer}
//               />
//               {errors.alamat_pembeli && (
//                 <p className="text-sm text-red-500">{errors.alamat_pembeli}</p>
//               )}
//             </div>

//             <FormField
//               id="id_tku_pembeli"
//               label="ID TKU Pembeli"
//               value={fakturData.id_tku_pembeli}
//               onChange={handleChange}
//               readOnly={readOnlyCustomer}
//             />
//           </div>

//           {/* Detail Transaksi - Layout horizontal */}
//           <div className="space-y-3">
//             <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Detail Transaksi</h2>
            
//             <div className="flex flex-wrap gap-3">
//               {/* Kode Transaksi */}
//               <div className="flex-1 min-w-[250px]">
//                 <FormField
//                   id="kode_transaksi"
//                   label="Kode Transaksi"
//                   value={fakturData.kode_transaksi}
//                   onChange={handleChange}
//                   error={errors.kode_transaksi}
//                   required
//                 />
//               </div>

//               {/* Keterangan Tambahan */}
//               <div className="flex-1 min-w-[250px]">
//                 <FormField
//                   id="keterangan_tambahan"
//                   label="Keterangan Tambahan"
//                   value={fakturData.keterangan_tambahan || ''}
//                   onChange={handleChange}
//                 />
//               </div>
//             </div>
            
//             <div className="flex flex-wrap gap-3">
//               {/* Cap Fasilitas */}
//               <div className="flex-1 min-w-[250px]">
//                 <FormField
//                   id="cap_fasilitas"
//                   label="Cap Fasilitas"
//                   value={fakturData.cap_fasilitas || ''}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="flex flex-wrap gap-3 flex-1 min-w-[250px]">
//                 <div className="flex-1 min-w-[120px]">
//                   <FormField
//                     id="dokumen_pendukung"
//                     label="Dokumen Pendukung"
//                     value={fakturData.dokumen_pendukung || ''}
//                     onChange={handleChange}
//                   />
//                 </div>

//                 <div className="flex-1 min-w-[120px]">
//                   <FormField
//                     id="referensi"
//                     label="Referensi"
//                     value={fakturData.referensi || ''}
//                     onChange={handleChange}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <Button type="submit" className="w-full">
//             {isEdit ? 'Perbarui Faktur' : 'Simpan Faktur'}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// };

// export default FakturForm;


// src/components/FakturForm.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { FakturData } from '@/types/faktur';
import { validateFakturData } from '@/lib/utils/validation';
import { INITIAL_FAKTUR_STATE } from '@/constants/faktur';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Bug, Search } from 'lucide-react';
import { useKodeTransaksi } from '@/hooks/use-kode-transaksi';
import { useCapFasilitas } from '@/hooks/use-cap-fasilitas';
import { useKeteranganTambahan } from '@/hooks/use-keterangan-tambahan';
import { useMasterCustomer } from '@/hooks/use-master-customer';
import { CustomerSearchModal } from './SearchCustomerModal';

interface FakturFormProps {
  initialData?: FakturData;
  isEdit?: boolean;
  readOnlyCustomer?: boolean;
  onSubmit: (data: FakturData) => void;
}

const FakturForm = ({ initialData, isEdit, readOnlyCustomer = false, onSubmit }: FakturFormProps) => {
  const [fakturData, setFakturData] = useState<FakturData>(INITIAL_FAKTUR_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FakturData, string>>>({});
  const [showDebug, setShowDebug] = useState(false);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  
  // Hook calls for dynamic data
  const { data: kodeTransaksiList = [], isLoading: isLoadingKodeTransaksi } = useKodeTransaksi();
  const { data: keteranganTambahanList = [], isLoading: isLoadingKeteranganTambahan } = useKeteranganTambahan(fakturData.kode_transaksi);
  const { data: capFasilitasList = [], isLoading: isLoadingCapFasilitas } = useCapFasilitas(fakturData.kode_transaksi);
  const { data: customerList = [], isLoading: isLoadingCustomers } = useMasterCustomer();
  
  // Refs to track if options are available
  const keteranganOptionsLoaded = useRef(false);
  const capFasilitasOptionsLoaded = useRef(false);
  
  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      console.log('Setting initial faktur data:', initialData);
      setFakturData(initialData);
    } else {
      // Get company data from localStorage only in create mode
      const selectedCompanyStr = localStorage.getItem('selectedCompany');
      if (selectedCompanyStr) {
        const selectedCompany = JSON.parse(selectedCompanyStr);
        const npwpPenjual = selectedCompany.npwp_company || '';
        setFakturData(prev => ({
          ...prev,
          npwp_penjual: npwpPenjual,
          id_tku_penjual: npwpPenjual ? `${npwpPenjual}000000` : ''
        }));
      }
    }
  }, [initialData]);

  // Track when options are loaded for dependent dropdowns
  useEffect(() => {
    if (keteranganTambahanList.length > 0) {
      keteranganOptionsLoaded.current = true;
    }
  }, [keteranganTambahanList]);

  useEffect(() => {
    if (capFasilitasList.length > 0) {
      capFasilitasOptionsLoaded.current = true;
    }
  }, [capFasilitasList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateFakturData(fakturData);
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(fakturData);
    } else {
      setErrors(validationErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFakturData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'npwp_penjual') {
        newData.id_tku_penjual = value ? `${value}000000` : '';
      }
      if (name === 'npwp_nik_pembeli') {
        newData.id_tku_pembeli = value ? `${value}000000` : '';
      }
      return newData;
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFakturData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset dependent fields if kode_transaksi changes
      if (field === 'kode_transaksi') {
        // Only reset dependent fields if this isn't the initial loading
        // from database (determined by checking if options are loaded)
        if (keteranganOptionsLoaded.current || capFasilitasOptionsLoaded.current) {
          newData.keterangan_tambahan = '';
          newData.cap_fasilitas = '';
        }
      }
      
      return newData;
    });
    
    if (errors[field as keyof FakturData]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCheckboxChange = (tipeTransaksi: string) => {
    setFakturData(prev => ({
      ...prev,
      tipe_transaksi: prev.tipe_transaksi === tipeTransaksi ? '' : tipeTransaksi
    }));
  };

  const formatAddress = (customer: typeof customerList[0]) => {
    const parts = [
      customer.jalan,
      customer.blok && `Blok ${customer.blok}`,
      customer.nomor && `No. ${customer.nomor}`,
      customer.rt && `RT ${customer.rt}`,
      customer.rw && `RW ${customer.rw}`,
      customer.kelurahan,
      customer.kecamatan,
      customer.kabupaten,
      customer.propinsi,
      customer.kode_pos
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  // Find option display values for selects
  const getSelectedKodeTransaksi = () => {
    if (!fakturData.kode_transaksi) return "Pilih kode transaksi";
    
    const found = kodeTransaksiList.find(kt => kt.kode === fakturData.kode_transaksi);
    return found ? found.keterangan : fakturData.kode_transaksi;
  };
  
  const getSelectedKeteranganTambahan = () => {
    if (!fakturData.keterangan_tambahan) return "Pilih keterangan tambahan";
    
    const found = keteranganTambahanList.find(kt => kt.kode === fakturData.keterangan_tambahan);
    return found ? `${found.kode} - ${found.keterangan}` : fakturData.keterangan_tambahan;
  };
  
  const getSelectedCapFasilitas = () => {
    if (!fakturData.cap_fasilitas) return "Pilih cap fasilitas";
    
    const found = capFasilitasList.find(cf => cf.kode === fakturData.cap_fasilitas);
    return found ? `${found.kode} - ${found.keterangan}` : fakturData.cap_fasilitas;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 flex flex-row justify-between items-center">
        <CardTitle>{isEdit ? 'Edit Data Faktur' : 'Input Faktur'}</CardTitle>
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
      </CardHeader>
      
      {showDebug && (
        <div className="px-6 py-2 bg-black text-green-400 text-xs font-mono overflow-auto rounded mx-6 mb-4" style={{maxHeight: '200px'}}>
          <p>fakturData: {JSON.stringify(fakturData, null, 2)}</p>
          <p>kode_transaksi List: {JSON.stringify(kodeTransaksiList.map(k => ({kode: k.kode, ket: k.keterangan})), null, 2)}</p>
          <p>keterangan_tambahan List: {JSON.stringify(keteranganTambahanList.map(k => ({kode: k.kode, ket: k.keterangan})), null, 2)}</p>
          <p>cap_fasilitas List: {JSON.stringify(capFasilitasList.map(k => ({kode: k.kode, ket: k.keterangan})), null, 2)}</p>
        </div>
      )}
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipe Transaksi - Checkbox section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tipe Transaksi</h2>
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="uang-muka" 
                  checked={fakturData.tipe_transaksi === 'Uang Muka'}
                  onCheckedChange={() => handleCheckboxChange('Uang Muka')}
                />
                <Label htmlFor="uang-muka" className="cursor-pointer">Uang Muka</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="pelunasan" 
                  checked={fakturData.tipe_transaksi === 'Pelunasan'}
                  onCheckedChange={() => handleCheckboxChange('Pelunasan')}
                />
                <Label htmlFor="pelunasan" className="cursor-pointer">Pelunasan</Label>
              </div>
            </div>
          </div>
          
          {/* Data Penjual - Layout horizontal */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Data Penjual</h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[250px]">
                <FormField
                  id="npwp_penjual"
                  label="NPWP Penjual"
                  value={fakturData.npwp_penjual}
                  onChange={handleChange}
                  error={errors.npwp_penjual}
                  required
                  readOnly={isEdit}
                />
              </div>

              <div className="flex-1 min-w-[250px]">
                <FormField
                  id="id_tku_penjual"
                  label="ID TKU Penjual"
                  value={fakturData.id_tku_penjual}
                  onChange={handleChange}
                  error={errors.id_tku_penjual}
                  required
                  readOnly={isEdit}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[250px]">
                <FormField
                  id="tanggal_faktur"
                  label="Tanggal Faktur"
                  type="date"
                  value={fakturData.tanggal_faktur}
                  onChange={handleChange}
                  error={errors.tanggal_faktur}
                  required
                />
              </div>

              <div className="flex-1 min-w-[250px]">
                <div className="space-y-2">
                  <Label htmlFor="jenis_faktur">Jenis Faktur</Label>
                  <Select
                    value={fakturData.jenis_faktur}
                    onValueChange={(value) => handleSelectChange('jenis_faktur', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis faktur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Pengganti">Pengganti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Nomor Faktur Pajak dan Status Faktur */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[250px]">
                <FormField
                  id="nomor_faktur_pajak"
                  label="Nomor Faktur Pajak"
                  value={fakturData.nomor_faktur_pajak || ''}
                  onChange={handleChange}
                  placeholder="Masukkan nomor faktur pajak (jika ada)"
                  readOnly={!isEdit}
                />
              </div>
              
              {fakturData.status_faktur && (
                <div className="flex-1 min-w-[250px]">
                  <div className="space-y-2">
                    <Label htmlFor="status_faktur">Status Faktur</Label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted/30 flex items-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        fakturData.status_faktur === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        fakturData.status_faktur === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                        fakturData.status_faktur === 'AMENDED' ? 'bg-yellow-100 text-yellow-800' :
                        fakturData.status_faktur === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''
                      }`}>
                        {fakturData.status_faktur}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Pembeli - Layout horizontal */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Data Pembeli</h2>
            
            {!readOnlyCustomer && (
              <div className="space-y-2">
                <Label>Pilih Pembeli</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setCustomerSearchOpen(true)}
                  disabled={isLoadingCustomers || readOnlyCustomer}
                >
                  {fakturData.nama_pembeli ? (
                    <span className="truncate">{fakturData.nama_pembeli}</span>
                  ) : (
                    <span className="text-muted-foreground">Pilih Pembeli</span>
                  )}
                  <Search className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            <CustomerSearchModal
              open={customerSearchOpen}
              onOpenChange={setCustomerSearchOpen}
              customers={customerList}
              onSelect={(customer) => {
                setFakturData(prev => ({
                  ...prev,
                  npwp_nik_pembeli: customer.npwp,
                  nama_pembeli: customer.nama,
                  alamat_pembeli: formatAddress(customer),
                  id_tku_pembeli: `${customer.npwp}000000`,
                  nomor_telepon_pembeli: customer.nomor_telepon
                }));
              }}
            />
            
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[250px]">
                <FormField
                  id="npwp_nik_pembeli"
                  label="NPWP/NIK Pembeli"
                  value={fakturData.npwp_nik_pembeli}
                  onChange={handleChange}
                  error={errors.npwp_nik_pembeli}
                  required
                  readOnly={readOnlyCustomer}
                />
              </div>

              <div className="flex-1 min-w-[250px]">
                <FormField
                  id="nama_pembeli"
                  label="Nama Pembeli"
                  value={fakturData.nama_pembeli}
                  onChange={handleChange}
                  error={errors.nama_pembeli}
                  required
                  readOnly={readOnlyCustomer}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat_pembeli">
                Alamat Pembeli
                {errors.alamat_pembeli && (
                  <span className="text-sm text-red-500 ml-1">*</span>
                )}
              </Label>
              <Textarea
                id="alamat_pembeli"
                name="alamat_pembeli"
                value={fakturData.alamat_pembeli}
                onChange={handleChange}
                className={`min-h-[60px] ${errors.alamat_pembeli ? 'border-red-500' : ''}`}
                readOnly={readOnlyCustomer}
              />
              {errors.alamat_pembeli && (
                <p className="text-sm text-red-500">{errors.alamat_pembeli}</p>
              )}
            </div>

            <FormField
              id="id_tku_pembeli"
              label="ID TKU Pembeli"
              value={fakturData.id_tku_pembeli}
              onChange={handleChange}
              readOnly={readOnlyCustomer}
            />
          </div>

          {/* Detail Transaksi - Layout horizontal */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Detail Transaksi</h2>
            
            <div className="flex flex-wrap gap-3">
              {/* Kode Transaksi - Dropdown from API */}
              <div className="flex-1 min-w-[250px]">
                <div className="space-y-2">
                  <Label htmlFor="kode_transaksi" className={errors.kode_transaksi ? "text-red-500" : ""}>
                    Kode Transaksi {errors.kode_transaksi && "*"}
                  </Label>
                  <Select
                    value={fakturData.kode_transaksi}
                    onValueChange={(value) => handleSelectChange('kode_transaksi', value)}
                    disabled={isLoadingKodeTransaksi}
                  >
                    <SelectTrigger id="kode_transaksi" className={errors.kode_transaksi ? "border-red-500" : ""}>
                      <SelectValue placeholder="Pilih kode transaksi">
                        {getSelectedKodeTransaksi()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {kodeTransaksiList.map(kt => (
                        <SelectItem key={kt.kode} value={kt.kode}>
                          {kt.keterangan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.kode_transaksi && (
                    <p className="text-sm text-red-500">{errors.kode_transaksi}</p>
                  )}
                </div>
              </div>

              {/* Keterangan Tambahan - Dropdown from API */}
              <div className="flex-1 min-w-[250px]">
                <div className="space-y-2">
                  <Label htmlFor="keterangan_tambahan">Keterangan Tambahan</Label>
                  <Select
                    value={fakturData.keterangan_tambahan}
                    onValueChange={(value) => handleSelectChange('keterangan_tambahan', value)}
                    disabled={isLoadingKeteranganTambahan || !fakturData.kode_transaksi}
                  >
                    <SelectTrigger id="keterangan_tambahan">
                      <SelectValue placeholder="Pilih keterangan tambahan">
                        {getSelectedKeteranganTambahan()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {keteranganTambahanList.map(kt => (
                        <SelectItem key={kt.kode} value={kt.kode}>
                          {kt.kode} - {kt.keterangan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Cap Fasilitas - Dropdown from API */}
              <div className="flex-1 min-w-[250px]">
                <div className="space-y-2">
                  <Label htmlFor="cap_fasilitas">Cap Fasilitas</Label>
                  <Select
                    value={fakturData.cap_fasilitas}
                    onValueChange={(value) => handleSelectChange('cap_fasilitas', value)}
                    disabled={isLoadingCapFasilitas || !fakturData.kode_transaksi}
                  >
                    <SelectTrigger id="cap_fasilitas">
                      <SelectValue placeholder="Pilih cap fasilitas">
                        {getSelectedCapFasilitas()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {capFasilitasList.map(cf => (
                        <SelectItem key={cf.kode} value={cf.kode}>
                          {cf.kode} - {cf.keterangan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 flex-1 min-w-[250px]">
                <div className="flex-1 min-w-[120px]">
                  <FormField
                    id="dokumen_pendukung"
                    label="Dokumen Pendukung"
                    value={fakturData.dokumen_pendukung || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex-1 min-w-[120px]">
                  <FormField
                    id="referensi"
                    label="Referensi"
                    value={fakturData.referensi || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            {isEdit ? 'Perbarui Faktur' : 'Simpan Faktur'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FakturForm;