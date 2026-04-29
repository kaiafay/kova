"use client";

import { useMemo } from "react";
import { SelectPicker } from "./select-picker";

export function MonthPicker({
  months,
  value,
  onChange,
  menuAlign = "end",
}: {
  months: string[];
  value: string;
  onChange: (month: string) => void;
  menuAlign?: "start" | "end";
}) {
  const options = useMemo(() => {
    const list = [...months];
    if (!list.includes(value)) list.push(value);
    return list
      .sort()
      .reverse()
      .map((m) => ({ value: m, label: m }));
  }, [months, value]);

  return (
    <SelectPicker
      value={value}
      onChange={onChange}
      options={options}
      menuAlign={menuAlign}
      aria-label={`Month: ${value}`}
    />
  );
}
