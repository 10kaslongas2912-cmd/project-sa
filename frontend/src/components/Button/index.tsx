// src/components/Button/index.tsx
import React from "react";
import "./style.css"
// รองรับ props ของ <button> ทั้งหมด + htmlType แบบ antd
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  htmlType?: "button" | "submit" | "reset";
};

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ htmlType, type, children, ...rest }, ref) => {
    // ถ้าไม่ได้ส่งอะไรมาเลย ให้ default เป็น "button"
    const resolvedType: "button" | "submit" | "reset" =
      (htmlType as any) ?? (type as any) ?? "button";

    return (
      <button ref={ref} type={resolvedType} {...rest}>
        {children}
      </button>
    );
  }
);

ButtonComponent.displayName = "ButtonComponent";
export default ButtonComponent;
