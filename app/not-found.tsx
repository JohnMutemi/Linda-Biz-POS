export default function NotFound() {
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">The page you’re looking for doesn’t exist.</p>
      </div>
    </div>
  )
}

