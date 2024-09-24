import React, { useEffect } from 'react';
import { Field } from './Field';
var SalsaCalendar = require('../../node_modules/salsa-calendar/build/SalsaCalendar.min.js');
import '../../node_modules/salsa-calendar/build/SalsaCalendar.min.css';

export const Datepicker = ({
  name,
  label,
  register,
  required,
  errors,
  ...props
}) => {
  useEffect(() => {
    new SalsaCalendar({
      inputId: name,
      lang: 'en',
      dateFormats: { en: '%d/%m/%Y' },
    });
  }, []);

  return (
    <Field label={label} errors={errors}>
      <input
        type="text"
        id={name}
        widget-type="datepicker"
        className={`form-input${errors !== undefined ? ' error' : ''}`}
        {...register(name, { required: required || false })}
      />
    </Field>
  );
};

