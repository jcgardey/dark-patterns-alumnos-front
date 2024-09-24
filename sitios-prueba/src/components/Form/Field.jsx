import React from "react";
import { useTranslation } from "react-i18next";

export const Field = ({
  label,
  className,
  labelClassName,
  errors,
  children,
  style,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`form-field${className ? ` ${className}` : ""}`}
      style={style}
    >
      <label className={`form-label ${labelClassName}`}>{label}</label>
      {children}
      {errors?.message && <span className="field-error">{errors.message}</span>}
      {errors?.message === "" && errors?.type === "required" && (
        <span className="field-error">
          {t("Common.RequiredField", { field: label })}
        </span>
      )}
    </div>
  );
};
