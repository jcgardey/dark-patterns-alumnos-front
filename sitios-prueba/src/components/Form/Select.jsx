import React from 'react';
import { Field } from './Field';
import { useTranslation } from 'react-i18next';

export const Select = ({
  name,
  label,
  disabled,
  defaultValue,
  options,
  register,
  required,
  errors,
  ...props
}) => (
  <Field label={label} errors={errors}>
    <SelectInput
      name={name}
      options={options}
      disabled={disabled}
      defaultValue={defaultValue}
      required={required}
      register={register}
      errors={errors}
      {...props}
    />
  </Field>
);

export const SelectInput = ({
  name,
  label,
  disabled,
  defaultValue,
  options,
  required,
  register,
  errors,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <select
      {...register(name, { required: required || false })}
      className={`form-input${errors !== undefined ? ' error' : ''}`}
      disabled={disabled || false}
      defaultValue={defaultValue}
      {...props}
    >
      <option value="">{label || t('Common.Select')}</option>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
};
