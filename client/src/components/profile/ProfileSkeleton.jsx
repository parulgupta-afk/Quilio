export default function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24 pt-4 animate-pulse">
      {/* Banner */}
      <div className="h-36 w-full rounded-2xl bg-white/5 border border-white/5 sm:h-48 sm:rounded-3xl" />

      {/* Identity row */}
      <div className="-mt-14 flex flex-col gap-6 px-2 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-full bg-white/10 ring-4 ring-[#0c0e14]" />
          <div className="flex-1 space-y-3 pb-1">
            <div className="h-8 w-48 rounded-lg bg-white/10" />
            <div className="h-4 w-full max-w-md rounded bg-white/5" />
            <div className="flex gap-3 pt-2">
              <div className="h-8 w-20 rounded-lg bg-white/5" />
              <div className="h-8 w-20 rounded-lg bg-white/5" />
              <div className="h-8 w-20 rounded-lg bg-white/5" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:pb-2">
          <div className="h-9 w-28 rounded-full bg-white/10" />
          <div className="h-9 w-24 rounded-full bg-white/5" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 flex gap-6 border-b border-white/5 pb-2">
        <div className="h-7 w-20 rounded bg-white/10" />
        <div className="h-7 w-20 rounded bg-white/5" />
      </div>

      {/* Posts Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-white/5 bg-[#12131c]/50">
            <div className="aspect-[16/9] bg-white/5" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 rounded bg-white/10" />
              <div className="h-3 w-full rounded bg-white/5" />
              <div className="h-3 w-1/2 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
