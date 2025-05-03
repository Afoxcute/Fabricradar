'use client';

import React, { useState, forwardRef } from 'react';
import { Field, FieldProps } from 'formik';
import { IoEye, IoEyeOff } from 'react-icons/io5';

interface CustomInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time';
  placeholder?: string;
  name: string;
  label?: string;
  className?: string;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  icon?: React.ReactNode;
  containerClass?: string;
  isCardNumber?: boolean;
  maxLength?: number;
  withFormik?: boolean;
}

const InputField = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      type = 'text',
      placeholder,
      name,
      label,
      className = '',
      readOnly,
      onChange,
      icon,
      containerClass = '',
      isCardNumber = false,
      maxLength,
      withFormik = true,
      value
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');

    React.useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const formatCardNumber = (value: string) =>
      value
        .replace(/\D/g, '')
        .match(/.{1,4}/g)
        ?.join(' ') || value;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field?: FieldProps['field']) => {
      const newValue = isCardNumber ? formatCardNumber(e.target.value) : e.target.value;

      if (field) {
        field.onChange({
          target: {
            name: field.name,
            value: isCardNumber ? newValue.replace(/\s/g, '') : newValue
          }
        });
      }
      setInputValue(newValue);
      onChange?.(e);
    };

    const renderInput = (field?: FieldProps['field']) => (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label htmlFor={name} className="tablet:text-lg text-sm">
            {label}
          </label>
        )}
        <div className={`flex items-center gap-3 border p-2 rounded-md ${containerClass}`}>
          {icon && <div>{icon}</div>}
          <input
            ref={ref}
            id={name}
            type={type === 'password' && showPassword ? 'text' : type}
            placeholder={placeholder}
            className={`w-full outline-none border-none bg-transparent ${className}`}
            readOnly={readOnly}
            maxLength={isCardNumber ? maxLength || 19 : maxLength}
            {...(field || {})}
            onChange={(e) => handleChange(e, field)}
            value={
              isCardNumber
                ? formatCardNumber(field?.value || inputValue)
                : field?.value || inputValue
            }
          />
          {type === 'password' && (
            <button type="button" onClick={togglePasswordVisibility} className="focus:outline-none">
              {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
            </button>
          )}
        </div>
      </div>
    );

    return withFormik ? (
      <Field name={name}>
        {({ field, meta }: FieldProps) => (
          <div className="flex flex-col gap-1">
            {renderInput(field)}
            {meta.touched ||
              (meta.error && <p className="text-red-600 text-sm capitalize">{meta.error}</p>)}
          </div>
        )}
      </Field>
    ) : (
      renderInput()
    );
  }
);

InputField.displayName = 'InputField'; // Required for debugging with forwardRef

export default InputField;
