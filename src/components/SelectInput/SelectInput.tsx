'use client';
import React, { useState } from 'react';
import { Field, FieldProps } from 'formik';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface SelectInputProps {
  name: string;
  label?: string;
  options: { value: string; label: string }[];
  className?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  containerClass?: string;
  withFormik?: boolean;
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  name,
  label,
  options,
  className = '',
  onChange,
  containerClass = '',
  withFormik = true,
  disabled,
  placeholder,
}) => {
  const [selectedValue, setSelectedValue] = useState('');

  const handleChange = (value: string, field?: FieldProps['field']) => {
    if (field) {
      field.onChange({ target: { name, value } });
    } else {
      setSelectedValue(value);
    }
    onChange?.(value);
  };

  const renderSelect = (field?: FieldProps['field']) => (
    <div className={`flex flex-col gap-2 w-full ${containerClass}`}>
      {label && (
        <label htmlFor={name} className="tablet:text-lg text-sm">
          {label}
        </label>
      )}
      <Select
        onValueChange={(value) => handleChange(value, field)}
        value={field?.value || selectedValue}
        disabled={disabled}
      >
        <SelectTrigger
          className={`border rounded-md outline-none bg-transparent text-grey p-3 py-5 ${className}`}
        >
          <SelectValue placeholder={placeholder || 'Select an option'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return withFormik ? (
    <Field name={name}>
      {({ field, meta }: FieldProps) => (
        <div className="flex flex-col gap-1">
          {renderSelect(field)}
          {meta.touched && meta.error && (
            <p className="text-red-600 text-sm capitalize">{meta.error}</p>
          )}
        </div>
      )}
    </Field>
  ) : (
    renderSelect()
  );
};

export default SelectInput;
