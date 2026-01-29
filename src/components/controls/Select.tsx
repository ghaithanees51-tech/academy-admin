import React from 'react';
import ReactSelect from 'react-select';
import type { SingleValue } from 'react-select';

export type Option = { label: string; value: string | number };

type Props = {
  name?: string;
  value: string | number | null | undefined;
  options: Option[];
  placeholder?: string;
  isDisabled?: boolean;
  onChange: (value: string | number | null) => void;
  onBlur?: () => void;
};

const customStyles = {
  control: (base: any) => ({
    ...base,
    borderColor: '#d1d5db',
    minHeight: 38,
    '&:hover': { borderColor: '#c7cdd6' },
    boxShadow: 'none',
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 50,
  }),
};

const Select: React.FC<Props> = ({ name, value, options, placeholder, isDisabled, onChange, onBlur }) => {
  const selected = options.find((o) => String(o.value) === String(value)) || null;
  return (
    <ReactSelect
      inputId={name}
      instanceId={name}
      value={selected}
      options={options}
      isDisabled={!!isDisabled}
      placeholder={placeholder}
      onChange={(opt: SingleValue<Option>) => onChange(opt ? opt.value : null)}
      onBlur={onBlur}
      styles={customStyles as any}
      classNamePrefix="rs"
    />
  );
};

export default Select;


