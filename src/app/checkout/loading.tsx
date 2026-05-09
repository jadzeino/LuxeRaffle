export default function CheckoutLoading() {
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8" aria-busy="true">
      <div className="space-y-4">
        <div className="h-12 w-80 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-72 animate-pulse rounded-lg bg-muted" />
    </main>
  );
}
