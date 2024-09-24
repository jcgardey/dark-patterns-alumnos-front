import React from "react";
import { Field } from "./Field";

export const Input = ({
  name,
  label,
  labelClassName = "",
  type = "text",
  register,
  rules,
  errors,
}) => (
  <Field label={label} labelClassName={labelClassName} errors={errors}>
    <input
      name={name}
      type={type}
      className={`form-input${errors !== undefined ? " error" : ""}`}
      {...register(name, rules)}
    />
  </Field>
);
