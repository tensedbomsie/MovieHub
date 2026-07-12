export default function StarRating({
  value,
  onChange,
  size = 'normal',
}: {
  value: number | null
  onChange?: (v: number) => void
  size?: 'normal' | 'small'
}) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className={`star-rating${size === 'small' ? ' small' : ''}`}>
      {stars.map((s) =>
        onChange ? (
          <button
            key={s}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange(s)
            }}
          >
            {s <= (value ?? 0) ? '★' : '☆'}
          </button>
        ) : (
          <span key={s}>{s <= (value ?? 0) ? '★' : '☆'}</span>
        ),
      )}
    </div>
  )
}
