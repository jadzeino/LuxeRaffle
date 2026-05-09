export default function CartLoading() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8" aria-busy="true">
      <div className="space-y-4">
        <div className="h-12 w-72 animate-pulse rounded bg-muted" />
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </main>
  );
}
