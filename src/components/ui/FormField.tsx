import { cn } from "@/utils/cn";

interface TextInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  "aria-label": ariaLabel,
}: TextInputProps) {
  return (
    <input
      type="text"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className="ui-field-control min-h-[44px] px-3.5 text-sm"
    />
  );
}

interface TextAreaProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
  "aria-label": ariaLabel,
}: TextAreaProps) {
  return (
    <textarea
      rows={rows}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className="ui-field-control resize-none px-4 py-3 text-sm sm:text-base"
    />
  );
}

interface ToggleSwitchProps {
  readonly checked: boolean;
  readonly onToggle: () => void;
  readonly "aria-label": string;
}

export function ToggleSwitch({
  checked,
  onToggle,
  "aria-label": ariaLabel,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={cn("ui-switch-track", checked && "ui-switch-track-on")}
    >
      <span
        className={cn(
          "ui-switch-thumb",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}
