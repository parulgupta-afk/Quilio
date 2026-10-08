export default function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-2 animate-pulse">
      <div className="h-28 rounded-2xl bg-white/5 ring-1 ring-white/5 sm:h-32" />
      <div className="-mt-10 flex flex-col gap-6 px-1 sm:flex-row sm:items-end">
        <div className="h-24 w-24 shrink-0 rounded-full bg-white/10 ring-4 ring-[#0c0e13]" />
        <div className="flex-1 space-y-3 pb-1">
          <div className="h-7 w-48 rounded-md bg-white/10" />
          <div className="h-4 w-full max-w-md rounded bg-white/5" />
          <div className="h-4 w-2/3 max-w-sm rounded bg-white/5" />
          <div className="flex gap-6 pt-2">
            <div className="h-8 w-16 rounded bg-white/5" />
            <div className="h-8 w-16 rounded bg-white/5" />
            <div className="h-8 w-16 rounded bg-white/5" />
          </div>
        </div>
        <div className="h-9 w-28 rounded-full bg-white/10" />
      </div>
      <div className="mt-10 flex gap-6 border-b border-white/5 pb-0">
        <div className="h-8 w-16 rounded bg-white/5" />
        <div className="h-8 w-16 rounded bg-white/5" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl ring-1 ring-white/5">
            <div className="aspect-[16/9] bg-white/5" />
            <div className="space-y-2 p-4">
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
