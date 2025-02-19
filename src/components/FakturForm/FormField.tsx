'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  type?: string;
  required?: boolean;
  className?: string;
  readOnly?: boolean;  // Tambahkan properti readOnly
  [key: string]: any;
}

export const FormField = ({
  id,
  label,
  error,
  type = 'text',
  required = false,
  className = '',
  readOnly = false,  // Set default value
  ...props
}: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      name={id}
      type={type}
      required={required}
      readOnly={readOnly}
      className={`${error ? 'border-red-500' : ''} ${readOnly ? 'bg-gray-100' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);