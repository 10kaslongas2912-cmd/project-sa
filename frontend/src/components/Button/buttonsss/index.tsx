import React from "react";
import "./style.css";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button className="button" onClick={onClick}>
      <span className="button-content">{children}</span>
    </button>
  );
};

export default Button;
