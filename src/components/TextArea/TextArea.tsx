'use client';

import React, { useState, forwardRef } from 'react';
import { Field, FieldProps } from 'formik';

interface CustomTextAreaProps {
  placeholder?: string;
  name: string;
  label?: string;
  className?: string;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value?: string;
  containerClass?: string;
  rows?: number;
  withFormik?: boolean;
}

const TextAreaField = forwardRef<HTMLTextAreaElement, CustomTextAreaProps>(
  (
    {
      placeholder,
      name,
      label,
      className = '',
      readOnly,
      onChange,
      containerClass = '',
      rows = 4,
      withFormik = true,
      value,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value || '');

    React.useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    const handleChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>,
      field?: FieldProps['field']
    ) => {
      if (field) {
        field.onChange({
          target: {
            name: field.name,
            value: e.target.value,
          },
        });
      }
      setInputValue(e.target.value);
      onChange?.(e);
    };

    const renderTextArea = (field?: FieldProps['field']) => (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label htmlFor={name} className="tablet:text-lg text-sm">
            {label}
          </label>
        )}
        <div className={`border p-2 rounded-md ${containerClass}`}>
          <textarea
            ref={ref}
            id={name}
            placeholder={placeholder}
            className={`w-full outline-none border-none bg-transparent resize-none ${className}`}
            readOnly={readOnly}
            rows={rows}
            {...(field || {})}
            onChange={(e) => handleChange(e, field)}
            value={field?.value || inputValue}
          />
        </div>
      </div>
    );

    return withFormik ? (
      <Field name={name}>
        {({ field, meta }: FieldProps) => (
          <div className="flex flex-col gap-1">
            {renderTextArea(field)}
            {meta.touched && meta.error && (
              <p className="text-red-600 text-sm capitalize">{meta.error}</p>
            )}
          </div>
        )}
      </Field>
    ) : (
      renderTextArea()
    );
  }
);

TextAreaField.displayName = 'TextAreaField';

export default TextAreaField;
