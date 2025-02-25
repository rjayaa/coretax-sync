'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CurrencyFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  className?: string;
}

export const CurrencyField: React.FC<CurrencyFieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  readOnly = false,
  className = '',
}) => {
  // Format number to Rupiah
  const formatToRupiah = (value: string): string => {
    if (!value) return '';

    // Remove non-numeric characters except decimal point
    let number = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = number.split('.');
    if (parts.length > 2) {
      number = parts[0] + '.' + parts.slice(1).join('');
    }

    // Split number into whole and decimal parts
    const [whole, decimal] = number.split('.');
    
    // Format whole number with thousand separators
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Combine with decimal part if it exists
    const formatted = decimal 
      ? `Rp ${formattedWhole},${decimal.slice(0, 2)}`
      : `Rp ${formattedWhole}${decimal === '' ? ',' : ''}`;

    return formatted;
  };

  // Parse Rupiah string to raw number string
  const parseRupiah = (rupiahString: string): string => {
    // Remove 'Rp ', replace decimal comma with dot, remove thousand separators
    return rupiahString
      .replace(/[^0-9,]/g, '')  // Remove all non-numeric chars except comma
      .replace(',', '.')        // Replace comma with dot for decimal
      .replace(/\./g, '');      // Remove thousand separators
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseRupiah(inputValue);
    
    // Allow empty input
    if (!numericValue) {
      onChange('');
      return;
    }

    // Validate numeric value
    if (isNaN(parseFloat(numericValue))) {
      return;
    }

    // Update with raw numeric value
    onChange(numericValue);
  };

  // For display, format the value
  const displayValue = value ? formatToRupiah(value) : '';

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        name={id}
        value={displayValue}
        onChange={handleChange}
        required={required}
        readOnly={readOnly}
        className={`${error ? 'border-red-500' : ''} ${readOnly ? 'bg-gray-100' : ''} ${className}`}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};