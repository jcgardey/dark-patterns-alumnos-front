export const TextInput = ({
  name,
  type = "text",
  register,
  rules,
  errors,
  className = "",
  ...props
}) => (
  <input
    name={name}
    type={type}
    className={`${className} ${
      errors !== undefined ? "border-red-600 outline-0" : ""
    }`}
    {...register(name, rules)}
    {...props}
  />
);
