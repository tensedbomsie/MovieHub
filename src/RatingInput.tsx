export function RatingBadge({ value }: { value: number }) {
  return <span className="rating-badge">⭐ {value.toFixed(1)}</span>
}

export default function RatingInput({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <div className="rating-input">
      <input
        type="range"
        min={0}
        max={10}
        step={0.1}
        value={value ?? 0}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="rating-value">{value !== null ? value.toFixed(1) : '–'} / 10</span>
      {value !== null && (
        <button type="button" className="btn" onClick={() => onChange(null)}>
          ล้างคะแนน
        </button>
      )}
    </div>
  )
}
