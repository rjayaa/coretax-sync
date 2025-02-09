
'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatTaxResult, parseCurrency } from '@/lib/utils/formatCurrency'

interface PaymentDetailsFormProps {
  totalAmount: number;
  onValuesChange?: (values: {
    dpp: number;
    ppn: number;
  }) => void;
}

export function PaymentDetailsForm({ totalAmount, onValuesChange }: PaymentDetailsFormProps) {
  const [dpp, setDpp] = useState<string>('')
  const [ppn, setPpn] = useState<string>('')

  // Calculate DPP and PPN when totalAmount changes
  useEffect(() => {
    if (totalAmount > 0) {
      // DPP is 11/12 of total amount
      const dppValue = (totalAmount * 11) / 12
      const formattedDpp = Number(dppValue.toFixed(2))
      setDpp(formatTaxResult(formattedDpp))

      // PPN is 11% of DPP
      const ppnValue = dppValue * 0.11
      const formattedPpn = Number(ppnValue.toFixed(2))
      setPpn(formatTaxResult(formattedPpn))

      // Notify parent component
      onValuesChange?.({
        dpp: formattedDpp,
        ppn: formattedPpn
      })
    } else {
      setDpp('')
      setPpn('')
      onValuesChange?.({
        dpp: 0,
        ppn: 0
      })
    }
  }, [totalAmount, onValuesChange])

  const handleDppChange = (value: string) => {
    const formatted = formatCurrency(value)
    setDpp(formatted)
    
    const dppValue = parseCurrency(formatted)
    const ppnValue = dppValue * 0.11
    const formattedPpn = Number(ppnValue.toFixed(2))
    setPpn(formatTaxResult(formattedPpn))

    onValuesChange?.({
      dpp: dppValue,
      ppn: formattedPpn
    })
  }

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <div>
        <h3 className="text-lg font-semibold">Detail DPP & PPN</h3>
        <p className="text-sm text-muted-foreground">
          Total DPP dan PPN dihitung otomatis berdasarkan total harga
        </p>
      </div>

      <div className="grid gap-4">
        <div>
          <Label>DPP (11/12 dari Total)</Label>
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
          <Label>PPN (11% dari DPP)</Label>
          <Input
            value={ppn}
            readOnly
            className="text-right font-mono bg-muted"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  )
}