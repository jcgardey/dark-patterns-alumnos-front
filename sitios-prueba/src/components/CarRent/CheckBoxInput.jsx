import { useState } from "react";

export const CheckboxInput = ({save=true, label, style,...props })=>{
const [saveCheck, setSave] = useState(save); 

  const handleChange = (event) => {
    setSave(event.target.checked);
  };

  return (
    <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <input
        type="checkbox"
        checked={saveCheck}
        onChange={handleChange}
      />{label}
    </label>
  );
};


