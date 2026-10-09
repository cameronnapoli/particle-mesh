import { SlidersHorizontal, XIcon } from 'lucide-react';
import React, { useState } from 'react';

import RangeStep from './RangeStep';
import styles from './Controls.module.scss';

const DOT_COUNTS = [20, 80, 160];
const GRAVITY_STRENGTHS = [2, 6, 14];
const SPRING_CONSTANTS = [0.03, 0.1, 0.3];

interface Props {
  defaultColumns: number;
  defaultMouseGravityRadius: number | null;
  defaultMouseGravityStrength: number;
  defaultAnchorSpringConstant: number;
  onChangeDotCount: (value: number) => void;
  onChangeMouseGravityRadius: (value: number | null) => void;
  onChangeMouseGravityStrength: (value: number) => void;
  onChangeAnchorSpringConstant: (value: number) => void;
}

const Controls: React.FunctionComponent<Props> = ({
  defaultColumns,
  defaultMouseGravityRadius,
  defaultMouseGravityStrength,
  defaultAnchorSpringConstant,
  onChangeDotCount,
  onChangeMouseGravityRadius,
  onChangeMouseGravityStrength,
  onChangeAnchorSpringConstant,
}) => {
  const [collapsed, setCollapsed] = useState(true);

  if (collapsed) {
    return (
      <button
        className={styles.expandButton}
        onClick={() => setCollapsed(false)}
        title="Expand controls"
      >
        <SlidersHorizontal size={16} />
      </button>
    );
  }

  return (
    <div className={styles.controls}>
      <div className={styles.header}>
        <span className={styles.title}>Controls</span>
        <button
          className={styles.closeButton}
          onClick={() => setCollapsed(true)}
          title="Collapse controls"
        >
          <XIcon size={14} />
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
        id="gravity-radius"
        label="Gravity Radius"
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
        id="gravity-strength"
        label="Gravity Strength"
        min={0}
        max={2}
        step={1}
        defaultValue={GRAVITY_STRENGTHS.indexOf(defaultMouseGravityStrength)}
        onChange={(value) => onChangeMouseGravityStrength(GRAVITY_STRENGTHS[value])}
        labels={['Weak', 'Normal', 'Strong']}
      />

      <RangeStep
        id="elasticity"
        label="Elasticity"
        min={0}
        max={2}
        step={1}
        defaultValue={SPRING_CONSTANTS.indexOf(defaultAnchorSpringConstant)}
        onChange={(value) => onChangeAnchorSpringConstant(SPRING_CONSTANTS[value])}
        labels={['Loose', 'Normal', 'Stiff']}
      />
    </div>
  );
};

export default Controls;
