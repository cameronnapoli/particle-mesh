import React from 'react';

import styles from './styles.module.scss';

interface Props {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  onChange: (value: number) => void;
  labels?: string[];
}

const RangeStep: React.FunctionComponent<Props> = ({
  id,
  label,
  min,
  max,
  step,
  defaultValue,
  onChange,
  labels,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    onChange(value);
  };

  // Generate default labels if none provided
  const rangeLabels = labels || Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => (min + i * step).toString()
  );

  return (
    <div className={styles.controlGroup}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.rangeContainer}>
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={styles.range}
        />
        <div className={styles.rangeLabels}>
          {rangeLabels.map((rangeLabel, index) => (
            <span key={index}>{rangeLabel}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RangeStep;
