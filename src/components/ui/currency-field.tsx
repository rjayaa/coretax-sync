import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input, InputProps } from '@/components/ui/input';

interface CurrencyFieldProps extends Omit<InputProps, 'onChange' | 'value' | 'type'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  readOnly?: boolean;
  className?: string;
}

export function CurrencyField({
  id,
  label,
  value,
  onChange,
  error,
  readOnly = false,
  className = '',
  ...props
}: CurrencyFieldProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Format the display value when the value prop changes
    if (value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        setDisplayValue(numericValue.toLocaleString('id-ID'));
      } else {
        setDisplayValue('');
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract only the numeric value from the input
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    
    // Update both the display and actual value
    if (numericValue) {
      const floatValue = parseFloat(numericValue);
      if (!isNaN(floatValue)) {
        setDisplayValue(floatValue.toLocaleString('id-ID'));
        onChange(floatValue.toString());
      }
    } else {
      setDisplayValue('');
      onChange('0');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label 
        htmlFor={id}
        className={error ? 'text-red-500' : ''}
      >
        {label}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          Rp
        </span>
        <Input
          id={id}
          name={id}
          className={`pl-10 ${error ? 'border-red-500' : ''}`}
          value={displayValue}
          onChange={handleChange}
          readOnly={readOnly}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}