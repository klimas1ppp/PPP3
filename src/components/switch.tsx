"use client";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
};

export function Switch({
  checked,
  onChange,
  id,
  label,
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <label className={`ppp-switch-label ${className ?? ""}`} htmlFor={id}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`ppp-switch ${checked ? "ppp-switch-on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="ppp-switch-thumb" aria-hidden />
      </button>
      {label && <span className="ppp-switch-text">{label}</span>}
    </label>
  );
}
