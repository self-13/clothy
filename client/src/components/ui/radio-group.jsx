import React from "react";

const RadioGroupContext = React.createContext();

export const RadioGroup = ({ value, onValueChange, children, ...props }) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div {...props}>{children}</div>
    </RadioGroupContext.Provider>
  );
};

export const RadioGroupItem = ({ value, id, ...props }) => {
  const { value: selectedValue, onValueChange } =
    React.useContext(RadioGroupContext);

  return (
    <input
      type="radio"
      id={id}
      checked={selectedValue === value}
      onChange={() => onValueChange(value)}
      {...props}
    />
  );
};
