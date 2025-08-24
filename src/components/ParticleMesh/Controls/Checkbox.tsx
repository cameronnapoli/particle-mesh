import React from 'react';

import styles from './styles.module.scss';

interface Props {
  id: string;
  label: string;
  defaultChecked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

const Checkbox: React.FunctionComponent<Props> = ({
  id,
  label,
  defaultChecked,
  onChange,
}) => {
  return (
    <div className={styles.checkbox}>
      <input
        type="checkbox"
        name={id}
        id={id}
        defaultChecked={defaultChecked}
        onChange={onChange}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default Checkbox;
