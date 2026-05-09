export default function AccountLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true">
      <div className="h-32 animate-pulse rounded-lg bg-muted" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </main>
  );
}
