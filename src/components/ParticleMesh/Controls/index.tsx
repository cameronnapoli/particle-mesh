import React, { useState } from 'react';

import styles from './styles.module.scss';
import Checkbox from './Checkbox';

interface Props {
  onChangeDebug: (value: boolean) => void;
}

const Controls: React.FunctionComponent<Props> = ({
  onChangeDebug,
}) => {
  const [collapsed, setCollapsed] = useState(true);

  if (collapsed) {
    return (
      <div
        className={styles.collapsedButton}
        onClick={() => setCollapsed(false)}
        title="Expand controls"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={styles.controls}>
      <div className={styles.header}>
        <span>Controls</span>
        <button
          className={styles.collapseButton}
          onClick={() => setCollapsed(true)}
          title="Collapse controls"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
          </svg>
        </button>
      </div>
      <Checkbox
        id="debug-checkbox"
        label="Debug"
        onChange={(event) => {
          onChangeDebug(event.target.checked);
        }}
      />
    </div>
  );
};

export default Controls;
