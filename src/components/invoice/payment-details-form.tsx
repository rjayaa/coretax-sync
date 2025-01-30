// 'use client'

// import { useState, useEffect } from 'react'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { formatCurrency, parseCurrency } from '@/lib/utils/formatCurrency'

// interface PaymentDetailsFormProps {
//   onValuesChange?: (values: {
//     nominal: number;
//     dpp: number;
//     ppn: number;
//   }) => void;
// }

// export function PaymentDetailsForm({ onValuesChange }: PaymentDetailsFormProps) {
//   const [nominal, setNominal] = useState<string>('')
//   const [dpp, setDpp] = useState<string>('')
//   const [ppn, setPpn] = useState<string>('')

//   // Handle calculations when nominal changes
//   useEffect(() => {
//     if (nominal) {
//       const nominalValue = parseCurrency(nominal)
      
//       // Calculate DPP (11/12 of nominal)
//       const dppValue = (nominalValue * 11) / 12
//       // Format to 2 decimal places
//       const formattedDpp = Number(dppValue.toFixed(2))
//       setDpp(formatCurrency(formattedDpp.toString()))

//       // Calculate PPN (12% of DPP)
//       const ppnValue = dppValue * 0.12
//       // Format to 2 decimal places
//       const formattedPpn = Number(ppnValue.toFixed(2))
//       setPpn(formatCurrency(formattedPpn.toString()))

//       // Notify parent component of changes
//       onValuesChange?.({
//         nominal: nominalValue,
//         dpp: formattedDpp,
//         ppn: formattedPpn
//       })
//     } else {
//       setDpp('')
//       setPpn('')
//       onValuesChange?.({
//         nominal: 0,
//         dpp: 0,
//         ppn: 0
//       })
//     }
//   }, [nominal, onValuesChange])

//   const handleNominalChange = (value: string) => {
//     const formatted = formatCurrency(value)
//     setNominal(formatted)
//   }

//   const handleDppChange = (value: string) => {
//     const formatted = formatCurrency(value)
//     setDpp(formatted)
    
//     // Calculate PPN based on manual DPP input
//     const dppValue = parseCurrency(formatted)
//     const ppnValue = dppValue * 0.12
//     // Format to 2 decimal places
//     const formattedPpn = Number(ppnValue.toFixed(2))
//     setPpn(formatCurrency(formattedPpn.toString()))

//     onValuesChange?.({
//       nominal: parseCurrency(nominal),
//       dpp: dppValue,
//       ppn: formattedPpn
//     })
//   }

//   const handlePpnChange = (value: string) => {
//     const formatted = formatCurrency(value)
//     setPpn(formatted)
//     onValuesChange?.({
//       nominal: parseCurrency(nominal),
//       dpp: parseCurrency(dpp),
//       ppn: parseCurrency(formatted)
//     })
//   }

//   return (
//     <div className="space-y-6 p-6 bg-card rounded-lg border">
//       <div>
//         <h3 className="text-lg font-semibold">Detail Pembayaran</h3>
//         <p className="text-sm text-muted-foreground">
//           Masukkan nominal pembayaran untuk kalkulasi DPP dan PPN
//         </p>
//       </div>

//       <div className="grid gap-4">
//         <div>
//           <Label>Nominal Pembayaran</Label>
//           <Input
//             value={nominal}
//             onChange={(e) => handleNominalChange(e.target.value)}
//             className="text-right font-mono"
//             placeholder="Rp 0"
//           />
//         </div>

//         <div>
//           <Label>DPP (11/12 dari Nominal)</Label>
//           <Input
//             value={dpp}
//             onChange={(e) => handleDppChange(e.target.value)}
//             className="text-right font-mono"
//             placeholder="Rp 0"
//           />
//           <p className="text-xs text-muted-foreground mt-1">
//             Dapat disesuaikan manual jika diperlukan
//           </p>
//         </div>

//         <div>
//           <Label>PPN (12% dari DPP)</Label>
//           <Input
//             value={ppn}
//             onChange={(e) => handlePpnChange(e.target.value)}
//             className="text-right font-mono"
//             placeholder="Rp 0"
//           />
//           <p className="text-xs text-muted-foreground mt-1">
//             Dapat disesuaikan manual jika diperlukan
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }


'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatTaxResult, parseCurrency } from '@/lib/utils/formatCurrency'

interface PaymentDetailsFormProps {
  onValuesChange?: (values: {
    nominal: number;
    dpp: number;
    ppn: number;
  }) => void;
}

export function PaymentDetailsForm({ onValuesChange }: PaymentDetailsFormProps) {
  const [nominal, setNominal] = useState<string>('')
  const [dpp, setDpp] = useState<string>('')
  const [ppn, setPpn] = useState<string>('')

  // Handle calculations when nominal changes
  useEffect(() => {
    if (nominal) {
      const nominalValue = parseCurrency(nominal)
      
      // Calculate DPP (11/12 of nominal)
      const dppValue = (nominalValue * 11) / 12
      // Format with 2 decimal places
      const formattedDpp = Number(dppValue.toFixed(2))
      setDpp(formatTaxResult(formattedDpp))

      // Calculate PPN (12% of DPP)
      const ppnValue = dppValue * 0.12
      // Format with 2 decimal places
      const formattedPpn = Number(ppnValue.toFixed(2))
      setPpn(formatTaxResult(formattedPpn))

      // Notify parent component of changes
      onValuesChange?.({
        nominal: nominalValue,
        dpp: formattedDpp,
        ppn: formattedPpn
      })
    } else {
      setDpp('')
      setPpn('')
      onValuesChange?.({
        nominal: 0,
        dpp: 0,
        ppn: 0
      })
    }
  }, [nominal, onValuesChange])

  const handleNominalChange = (value: string) => {
    const formatted = formatCurrency(value)
    setNominal(formatted)
  }

  const handleDppChange = (value: string) => {
    const formatted = formatCurrency(value)
    setDpp(formatted)
    
    // Calculate PPN based on manual DPP input
    const dppValue = parseCurrency(formatted)
    const ppnValue = dppValue * 0.12
    // Format with 2 decimal places
    const formattedPpn = Number(ppnValue.toFixed(2))
    setPpn(formatTaxResult(formattedPpn))

    onValuesChange?.({
      nominal: parseCurrency(nominal),
      dpp: dppValue,
      ppn: formattedPpn
    })
  }

  const handlePpnChange = (value: string) => {
    const formatted = formatCurrency(value)
    setPpn(formatted)
    onValuesChange?.({
      nominal: parseCurrency(nominal),
      dpp: parseCurrency(dpp),
      ppn: parseCurrency(formatted)
    })
  }

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <div>
        <h3 className="text-lg font-semibold">Detail Pembayaran</h3>
        <p className="text-sm text-muted-foreground">
          Masukkan nominal pembayaran untuk kalkulasi DPP dan PPN
        </p>
      </div>

      <div className="grid gap-4">
        <div>
          <Label>Nominal Pembayaran</Label>
          <Input
            value={nominal}
            onChange={(e) => handleNominalChange(e.target.value)}
            className="text-right font-mono"
            placeholder="0"
          />
        </div>

        <div>
          <Label>DPP (11/12 dari Nominal)</Label>
          <Input
            value={dpp}
            onChange={(e) => handleDppChange(e.target.value)}
            className="text-right font-mono"
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Dapat disesuaikan manual jika diperlukan
          </p>
        </div>

        <div>
          <Label>PPN (12% dari DPP)</Label>
          <Input
            value={ppn}
            onChange={(e) => handlePpnChange(e.target.value)}
            className="text-right font-mono"
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Dapat disesuaikan manual jika diperlukan
          </p>
        </div>
      </div>
    </div>
  )
}