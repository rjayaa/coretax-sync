import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  type?: string;
  required?: boolean;
  className?: string;
  [key: string]: any;
}

export const FormField = ({
  id,
  label,
  error,
  type = 'text',
  required = false,
  className = '',
  ...props
}: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      name={id}
      type={type}
      required={required}
      className={`${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);