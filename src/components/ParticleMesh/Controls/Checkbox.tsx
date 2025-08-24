import React from 'react';

import styles from './styles.module.scss';

interface Props {
  id: string;
  label: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

const Checkbox: React.FunctionComponent<Props> = ({
  id,
  label,
  onChange,
}) => {
  return (
    <div className={styles.checkbox}>
      <input
        type="checkbox"
        name={id}
        id={id}
        onChange={onChange}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default Checkbox;
