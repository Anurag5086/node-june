export default function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
