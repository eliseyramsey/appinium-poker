"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const toggleId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label
        htmlFor={toggleId}
        className={`flex items-center justify-between cursor-pointer ${className}`}
      >
        <div className="flex-1">
          {label && (
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {label}
            </span>
          )}
          {description && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="relative ml-4">
          <input
            ref={ref}
            id={toggleId}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div
            className="
              w-11 h-6
              bg-[var(--border)]
              rounded-full
              peer-checked:bg-[var(--primary)]
              transition-colors duration-200
            "
          />
          <div
            className="
              absolute top-0.5 left-0.5
              w-5 h-5
              bg-white
              rounded-full
              shadow-sm
              transition-transform duration-200
              peer-checked:translate-x-5
            "
          />
        </div>
      </label>
    );
  }
);

Toggle.displayName = "Toggle";
