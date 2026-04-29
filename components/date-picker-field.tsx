"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const C = {
  surf: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
};

/** Fits compact `.kova-day-picker` grid (~7 × 30px cells + padding) */
const PANEL_W = 236;

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

export function parseIsoDateLocal(s: string): Date | undefined {
  const parts = s.split("-").map(Number);
  if (parts.length !== 3) return undefined;
  const [y, m, d] = parts;
  if (!y || !m || !d) return undefined;
  const dt = new Date(y, m - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return undefined;
  }
  return dt;
}

export function formatIsoDateLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplayLocal(iso: string): string {
  const d = parseIsoDateLocal(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export function DatePickerField({
  value,
  onChange,
  size = "md",
  menuAlign = "start",
  "aria-label": ariaLabel,
  style,
  triggerStyle,
}: {
  value: string;
  onChange: (isoDate: string) => void;
  size?: "sm" | "md";
  menuAlign?: "start" | "end";
  "aria-label"?: string;
  style?: CSSProperties;
  triggerStyle?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const selected = parseIsoDateLocal(value);
  const pad = size === "sm" ? "5px 8px" : "9px 12px";
  const fontSize = size === "sm" ? 12.5 : 13.5;

  const dialogId = useId();
  const dialogTitleId = useId();

  const closePicker = useCallback(() => {
    setOpen(false);
    setPanelPos(null);
  }, []);

  /** Return focus to trigger when dialog closes (selection, Escape, overlay, scroll). */
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = btnRef.current;
    return () => {
      queueMicrotask(() => trigger?.focus());
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) {
      setPanelPos(null);
      return;
    }
    const r = btnRef.current.getBoundingClientRect();
    const left =
      menuAlign === "end"
        ? Math.max(8, r.right - PANEL_W)
        : Math.min(r.left, window.innerWidth - PANEL_W - 8);
    setPanelPos({ top: r.bottom + 8, left });
  }, [open, menuAlign]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePicker();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closePicker]);

  useEffect(() => {
    if (!open) return;
    const close = () => closePicker();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, closePicker]);

  const displayStr = formatDisplayLocal(value);

  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-label={ariaLabel ?? `Date, ${displayStr}`}
        onClick={() => setOpen((o) => !o)}
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
          outline: "none",
          ...triggerStyle,
        }}
      >
        <span style={{ flex: "1 1 auto", textAlign: "left", minWidth: 0 }}>
          {displayStr}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0, color: C.muted }}
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 3v4M16 3v4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && panelPos && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 190 }}
            aria-hidden="true"
            onClick={closePicker}
          />
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            style={{
              position: "fixed",
              top: panelPos.top,
              left: panelPos.left,
              zIndex: 200,
              background: C.surf,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              padding: "6px 8px 8px",
            }}
          >
            <h2 id={dialogTitleId} style={srOnly}>
              Choose date
            </h2>
            <DayPicker
              className="kova-day-picker"
              mode="single"
              required={false}
              selected={selected}
              autoFocus
              onSelect={(d) => {
                if (d) {
                  onChange(formatIsoDateLocal(d));
                  setOpen(false);
                }
              }}
              defaultMonth={selected ?? new Date()}
              weekStartsOn={0}
              navLayout="around"
            />
          </div>
        </>
      )}
    </div>
  );
}
