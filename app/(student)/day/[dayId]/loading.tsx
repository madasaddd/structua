export default function DayLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="mb-8 flex items-center gap-2">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="h-4 w-4 rounded bg-gray-100" />
        <div className="h-4 w-16 rounded bg-gray-200" />
      </div>

      {/* Title skeleton */}
      <div className="mb-10">
        <div className="h-10 w-3/4 rounded-lg bg-gray-200 sm:h-12" />
      </div>

      {/* Block skeletons */}
      <div className="space-y-6">
        {/* Text block */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-4 w-4/6 rounded bg-gray-100" />
        </div>

        {/* Callout block */}
        <div className="flex gap-4 rounded-xl border-l-4 border-gray-200 bg-gray-50 p-5">
          <div className="h-8 w-8 shrink-0 rounded bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-3/4 rounded bg-gray-200" />
          </div>
        </div>

        {/* More text */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-2/3 rounded bg-gray-100" />
        </div>

        {/* Table block */}
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-5 py-4">
            <div className="h-4 w-48 rounded bg-gray-200" />
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex gap-4 px-5 py-4">
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                <div className="h-4 w-1/3 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>

        {/* More text */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}
