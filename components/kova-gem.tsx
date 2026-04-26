export function KovaGem({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,4 36,16 24,22 12,16" fill="#2563eb" opacity="0.9" />
      <polygon points="24,22 36,16 38,32 24,44" fill="#1d4ed8" opacity="0.75" />
      <polygon points="24,22 12,16 10,32 24,44" fill="#3b82f6" opacity="0.85" />
      <polygon points="24,44 10,32 38,32" fill="#1e40af" opacity="0.6" />
      <line x1="24" y1="4" x2="24" y2="22" stroke="#bfdbfe" strokeWidth="0.8" opacity="0.9" />
    </svg>
  );
}
