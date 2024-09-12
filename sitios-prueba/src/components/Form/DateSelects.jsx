import React from 'react';
import { range } from './utils';
import { Field } from './Field';
import { SelectInput } from './CustomSelect';
import { useTranslation } from 'react-i18next';

export const DateSelects = ({ name, label, years, control, errors, rules }) => {
  const dateError =
    errors[`${name}_dia`] || errors[`${name}_mes`] || errors[`${name}_anio`]
      ? { type: 'required', message: '' }
      : {};

  const { t } = useTranslation();

  return (
    <Field label={label} errors={dateError}>
      <div className="inline-input">
        <SelectInput
          name={`${name}_dia`}
          groupName={name}
          label={t('Common.Date.Day')}
          widgetType={'date-select'}
          style={{ width: '20%' }}
          options={range(1, 31)}
          control={control}
          rules={rules}
          errors={errors[`${name}_dia`]}
        />
        <SelectInput
          name={`${name}_mes`}
          groupName={name}
          label={t('Common.Date.Month')}
          widgetType={'date-select'}
          style={{ width: '40%' }}
          options={[
            t('Common.Date.Months.January'),
            t('Common.Date.Months.February'),
            t('Common.Date.Months.March'),
            t('Common.Date.Months.April'),
            t('Common.Date.Months.May'),
            t('Common.Date.Months.June'),
            t('Common.Date.Months.July'),
            t('Common.Date.Months.August'),
            t('Common.Date.Months.September'),
            t('Common.Date.Months.October'),
            t('Common.Date.Months.November'),
            t('Common.Date.Months.December'),
          ]}
          control={control}
          rules={rules}
          errors={errors[`${name}_mes`]}
        />
        <SelectInput
          name={`${name}_anio`}
          groupName={name}
          label={t('Common.Date.Year')}
          widgetType={'date-select'}
          style={{ width: '20%' }}
          options={years}
          control={control}
          rules={rules}
          errors={errors[`${name}_anio`]}
        />
      </div>
    </Field>
  );
};
