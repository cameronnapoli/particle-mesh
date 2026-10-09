import { CircleXIcon, SlidersHorizontal } from 'lucide-react';
import React, { useState } from 'react';

import RangeStep from './RangeStep';
import styles from './styles.module.scss';

const DOT_COUNTS = [20, 80, 160];
const GRAVITY_STRENGTHS = [2, 6, 14];

interface Props {
  defaultColumns: number;
  defaultMouseGravityRadius: number | null;
  defaultMouseGravityStrength: number;
  onChangeDotCount: (value: number) => void;
  onChangeMouseGravityRadius: (value: number | null) => void;
  onChangeMouseGravityStrength: (value: number) => void;
}

const Controls: React.FunctionComponent<Props> = ({
  defaultColumns,
  defaultMouseGravityRadius,
  defaultMouseGravityStrength,
  onChangeDotCount,
  onChangeMouseGravityRadius,
  onChangeMouseGravityStrength,
}) => {
  const [collapsed, setCollapsed] = useState(true);

  if (collapsed) {
    return (
      <div
        className={styles.collapsedButton}
        onClick={() => setCollapsed(false)}
        title="Expand controls"
      >
        <SlidersHorizontal size={20} />
      </div>
    );
  }

  return (
    <div className={styles.controls}>
      <div className={styles.header}>
        <div />
        <button
          className={styles.collapseButton}
          onClick={() => setCollapsed(true)}
          title="Collapse controls"
        >
          <CircleXIcon size={24} />
        </button>
      </div>

      <RangeStep
        id="dot-count"
        label="Dot Count"
        min={0}
        max={2}
        step={1}
        defaultValue={DOT_COUNTS.indexOf(defaultColumns)}
        onChange={(value) => onChangeDotCount(DOT_COUNTS[value])}
        labels={['Few', 'Normal', 'Many']}
      />

      <RangeStep
        id="mouse-gravity-radius"
        label="Mouse Gravity Radius"
        min={50}
        max={250}
        step={50}
        defaultValue={defaultMouseGravityRadius ?? 250}
        onChange={(value) => {
          if (value === 250) {
            onChangeMouseGravityRadius(null);
          } else {
            onChangeMouseGravityRadius(value);
          }
        }}
        labels={['50', '100', '150', '200', '∞']}
      />

      <RangeStep
        id="mouse-gravity-strength"
        label="Mouse Gravity Strength"
        min={0}
        max={2}
        step={1}
        defaultValue={GRAVITY_STRENGTHS.indexOf(defaultMouseGravityStrength)}
        onChange={(value) => onChangeMouseGravityStrength(GRAVITY_STRENGTHS[value])}
        labels={['Weak', 'Normal', 'Strong']}
      />
    </div>
  );
};

export default Controls;
