export default function LoginLoading() {
  return (
    <main
      id="main-content"
      className="flex w-full items-center justify-center bg-muted/30 p-6 py-20 md:p-10"
      aria-busy="true"
    >
      <div className="w-full max-w-sm">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="p-6">
            <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-5 px-6 pb-6">
            <div className="space-y-2">
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}
