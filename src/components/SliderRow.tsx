import type { ChangeEvent } from "react";

interface SliderRowProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SliderRow = ({
  id,
  label,
  min,
  max,
  step,
  value,
  disabled,
  onChange,
}: SliderRowProps) => (
  <div className="slider-row">
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={onChange}
    />
  </div>
);

export default SliderRow;
