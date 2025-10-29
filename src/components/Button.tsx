import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

const Button = ({ 
  variant = "primary", 
  size = "md", 
  className, 
  children, 
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-purple-600 text-slate-50 shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/70 hover:scale-105",
    secondary: "bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 hover:border-violet-500/50",
    ghost: "text-slate-300 hover:text-violet-400 hover:bg-slate-800/50",
    danger: "bg-red-600 text-slate-50 hover:bg-red-700 shadow-lg shadow-red-500/30"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
