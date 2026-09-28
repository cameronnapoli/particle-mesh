import { CircleXIcon, SlidersHorizontal } from 'lucide-react';
import React, { useState } from 'react';

import { DEFAULT_OPTIONS } from '../config';

import RangeStep from './RangeStep';
import styles from './styles.module.scss';

interface Props {
  onChangeDebug: (value: boolean) => void;
  onChangeDotCount: (value: 'few' | 'normal' | 'many') => void;
  onChangeMouseGravityRadius: (value: number | null) => void;
  onChangeMouseGravityStrength: (value: number) => void;
}

const Controls: React.FunctionComponent<Props> = ({
  // onChangeDebug,
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
        defaultValue={1}
        onChange={(value) => {
          const dotCounts: ('few' | 'normal' | 'many')[] = ['few', 'normal', 'many'];
          onChangeDotCount(dotCounts[value]);
        }}
        labels={['Few', 'Normal', 'Many']}
      />

      <RangeStep
        id="mouse-gravity-radius"
        label="Mouse Gravity Radius"
        min={50}
        max={250}
        step={50}
        defaultValue={DEFAULT_OPTIONS.mouseGravityRadiusPx ?? 0}
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
        min={2.0}
        max={20.0}
        step={2.0}
        defaultValue={DEFAULT_OPTIONS.mouseGravityStrength}
        onChange={onChangeMouseGravityStrength}
      />

      {/* <Checkbox
        id="debug-checkbox"
        label="Debug"
        defaultChecked={DEFAULT_OPTIONS.debug}
        onChange={(event) => {
          onChangeDebug(event.target.checked);
        }}
      /> */}
    </div>
  );
};

export default Controls;
export { default as RangeStep } from './RangeStep';
