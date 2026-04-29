"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

const C = {
  surf: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
  subtle: "#94a3b8",
  accent: "#2563eb",
};

export type SelectOption = { value: string; label: string };
export type SelectGroup = { label: string; options: SelectOption[] };

type MenuRow =
  | { kind: "header"; label: string }
  | { kind: "option"; option: SelectOption; index: number; emptyChoice?: boolean };

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <g
        style={{
          opacity: open ? 0 : 1,
          transform: open
            ? "rotate(-8deg) scale(0.97)"
            : "rotate(0deg) scale(1)",
          transformOrigin: "6px 6px",
          transition: "opacity 210ms ease, transform 250ms ease",
        }}
      >
        <path
          d="M2 4l4 4 4-4"
          stroke={C.muted}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g
        style={{
          opacity: open ? 1 : 0,
          transform: open
            ? "rotate(0deg) scale(1)"
            : "rotate(8deg) scale(0.97)",
          transformOrigin: "6px 6px",
          transition: "opacity 210ms ease, transform 250ms ease",
        }}
      >
        <path
          d="M2 8l4-4 4 4"
          stroke={C.muted}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function SelectPicker({
  value,
  onChange,
  options,
  groups,
  allowEmpty = false,
  emptyLabel = "— Select —",
  placeholder = "Select…",
  menuAlign = "end",
  size = "md",
  "aria-label": ariaLabelProp,
  style,
  triggerStyle,
}: {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  allowEmpty?: boolean;
  emptyLabel?: string;
  placeholder?: string;
  menuAlign?: "start" | "end";
  size?: "sm" | "md";
  "aria-label"?: string;
  style?: CSSProperties;
  triggerStyle?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  const [menuWidth, setMenuWidth] = useState<number>();

  const triggerLabelId = useId();
  const listboxId = useId();

  const orderedSelectable = useMemo(() => {
    const rows: SelectOption[] = [];
    if (allowEmpty) rows.push({ value: "", label: emptyLabel });
    if (groups) {
      for (const g of groups) {
        for (const o of g.options) rows.push(o);
      }
    } else {
      rows.push(...(options ?? []));
    }
    return rows;
  }, [allowEmpty, emptyLabel, groups, options]);

  const menuRows: MenuRow[] = useMemo(() => {
    const out: MenuRow[] = [];
    let i = 0;
    if (allowEmpty) {
      out.push({
        kind: "option",
        option: { value: "", label: emptyLabel },
        index: i++,
        emptyChoice: true,
      });
    }
    if (groups) {
      for (const g of groups) {
        out.push({ kind: "header", label: g.label });
        for (const o of g.options) {
          out.push({ kind: "option", option: o, index: i++ });
        }
      }
    } else {
      for (const o of options ?? []) {
        out.push({ kind: "option", option: o, index: i++ });
      }
    }
    return out;
  }, [allowEmpty, emptyLabel, groups, options]);

  const flatForLookup = useMemo(() => {
    if (groups) return groups.flatMap((g) => g.options);
    return options ?? [];
  }, [groups, options]);

  const displayLabel = useMemo(() => {
    if (allowEmpty && value === "") return emptyLabel;
    const found = flatForLookup.find((o) => o.value === value);
    if (found) return found.label;
    if (value === "") return placeholder;
    return value;
  }, [value, flatForLookup, allowEmpty, emptyLabel, placeholder]);

  const pad = size === "sm" ? "5px 8px" : "7px 12px";
  const fontSize = size === "sm" ? 12.5 : 13;
  const rowPad = size === "sm" ? "6px 8px" : "8px 10px";
  const sectionPad = size === "sm" ? "6px 8px 3px" : "8px 10px 4px";

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const commitSelection = useCallback(
    (v: string) => {
      onChange(v);
      setOpen(false);
    },
    [onChange],
  );

  const openMenu = useCallback(() => {
    const selIdx = orderedSelectable.findIndex((o) => o.value === value);
    setActiveOptionIndex(selIdx >= 0 ? selIdx : 0);
    setOpen(true);
  }, [orderedSelectable, value]);

  const toggleOpen = useCallback(() => {
    if (open) closeMenu();
    else openMenu();
  }, [open, closeMenu, openMenu]);

  /** Restore focus to trigger whenever listbox closes (matches native select dismissal). */
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = btnRef.current;
    return () => {
      queueMicrotask(() => trigger?.focus());
    };
  }, [open]);

  useLayoutEffect(() => {
    if (open && btnRef.current) setMenuWidth(btnRef.current.offsetWidth);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    optionRefs.current[activeOptionIndex]?.focus({ preventScroll: true });
  }, [open, activeOptionIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  useEffect(() => {
    if (!open) return;
    const close = () => closeMenu();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, closeMenu]);

  const moveActive = useCallback(
    (delta: number) => {
      setActiveOptionIndex((prev) =>
        Math.max(
          0,
          Math.min(prev + delta, orderedSelectable.length - 1),
        ),
      );
    },
    [orderedSelectable.length],
  );

  const onOptionKeyDown = useCallback(
    (e: ReactKeyboardEvent, optionValue: string) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          moveActive(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          moveActive(-1);
          break;
        case "Home":
          e.preventDefault();
          setActiveOptionIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveOptionIndex(Math.max(0, orderedSelectable.length - 1));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          commitSelection(optionValue);
          break;
        case "Escape":
          e.preventDefault();
          closeMenu();
          break;
        case "Tab":
          e.preventDefault();
          closeMenu();
          break;
        default:
          break;
      }
    },
    [
      moveActive,
      orderedSelectable.length,
      commitSelection,
      closeMenu,
    ],
  );

  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabelProp ?? undefined}
        aria-labelledby={ariaLabelProp ? undefined : triggerLabelId}
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            openMenu();
          }
        }}
        style={{
          background: C.surf,
          border: `1px solid ${C.border}`,
          color: C.text,
          padding: pad,
          borderRadius: 8,
          fontSize,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          minWidth: 0,
          width: "100%",
          ...triggerStyle,
        }}
      >
        <span
          id={triggerLabelId}
          style={{
            flex: "1 1 auto",
            textAlign: "left",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            color:
              allowEmpty && value === ""
                ? C.muted
                : C.text,
          }}
        >
          {displayLabel}
        </span>
        <Chevron open={open} />
      </button>

      <span id={`${listboxId}-description`} style={srOnly}>
        Use arrow keys to navigate options, Enter to select, Escape to close.
      </span>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            aria-hidden="true"
            onClick={closeMenu}
          />
          <div
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={triggerLabelId}
            aria-describedby={`${listboxId}-description`}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === "Escape" || e.key === "Tab") {
                e.preventDefault();
                closeMenu();
              }
            }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: menuAlign === "start" ? 0 : undefined,
              right: menuAlign === "end" ? 0 : undefined,
              zIndex: 50,
              background: C.surf,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              minWidth: menuWidth ?? 140,
              maxHeight: 280,
              overflowY: "auto",
              padding: 6,
              outline: "none",
            }}
          >
            {menuRows.map((row, ri) => {
              if (row.kind === "header") {
                return (
                  <div
                    key={`hdr-${ri}`}
                    role="presentation"
                    style={{
                      fontSize: size === "sm" ? 9 : 10,
                      fontWeight: 700,
                      color: C.subtle,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      padding: sectionPad,
                    }}
                  >
                    {row.label}
                  </div>
                );
              }
              const o = row.option;
              const selected = o.value === value;
              const isEmptyChoice = row.emptyChoice ?? false;
              return (
                <button
                  key={`opt-${row.index}`}
                  type="button"
                  ref={(el) => {
                    optionRefs.current[row.index] = el;
                  }}
                  tabIndex={activeOptionIndex === row.index ? 0 : -1}
                  role="option"
                  aria-selected={selected}
                  id={`${listboxId}-opt-${row.index}`}
                  onKeyDown={(e) => onOptionKeyDown(e, o.value)}
                  onClick={() => commitSelection(o.value)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: rowPad,
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize,
                    background: selected ? "#eff6ff" : "transparent",
                    color: selected ? C.accent : isEmptyChoice ? C.muted : C.text,
                    fontWeight: selected ? 600 : 500,
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
