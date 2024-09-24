import React from 'react';
import { Field } from './Field';

export const RadioSet = ({
  name,
  label,
  options,
  className,
  rules,
  register,
  errors,
  inline,
  style,
}) => (
  <Field label={label} errors={errors} style={style} className={className}>
    {options.map((option) => (
      <label
        key={option}
        className={`radio-item ${inline ? 'inline' : 'block'}`}
      >
        <input type={'radio'} {...register(name, rules || {})} value={option} />
        {option}
      </label>
    ))}
  </Field>
);

