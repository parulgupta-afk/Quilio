export default function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24 pt-4 animate-pulse">
      {/* Banner */}
      <div className="h-40 w-full rounded-2xl bg-white/5 border border-white/5 sm:h-52 sm:rounded-3xl" />

      {/* Identity row (Centered) */}
      <div className="-mt-16 sm:-mt-20 mx-auto flex max-w-xl flex-col items-center text-center px-4">
        {/* Avatar */}
        <div className="h-28 w-28 shrink-0 rounded-full bg-white/10 ring-4 ring-[#0c0e14]" />
        
        {/* Dropdown trigger button placeholder */}
        <div className="mt-3 h-7 w-28 rounded-full bg-white/5" />

        {/* Name and bio placeholders */}
        <div className="mt-4 flex flex-col items-center space-y-2 w-full">
          <div className="h-8 w-44 rounded-lg bg-white/10" />
          <div className="h-4 w-64 rounded bg-white/5" />
          <div className="h-4 w-80 max-w-full rounded bg-white/5" />
        </div>

        {/* Stats placeholder */}
        <div className="mt-4 flex justify-center gap-3">
          <div className="h-8 w-20 rounded-xl bg-white/5" />
          <div className="h-8 w-20 rounded-xl bg-white/5" />
          <div className="h-8 w-20 rounded-xl bg-white/5" />
          <div className="h-8 w-24 rounded-xl bg-white/5" />
        </div>

        {/* Buttons placeholder */}
        <div className="mt-6 flex justify-center gap-3">
          <div className="h-9 w-28 rounded-full bg-white/10" />
          <div className="h-9 w-24 rounded-full bg-white/5" />
          <div className="h-9 w-20 rounded-full bg-white/5" />
        </div>
      </div>

      {/* Tabs placeholder (Centered) */}
      <div className="mt-10 flex justify-center gap-6 border-b border-white/5 pb-2">
        <div className="h-7 w-24 rounded bg-white/10" />
        <div className="h-7 w-24 rounded bg-white/5" />
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
