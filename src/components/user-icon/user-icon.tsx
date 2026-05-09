export const UserIcon = ({ firstName }: { firstName: string }) => (
  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase text-background transition hover:bg-foreground/80">
    {firstName[0]}
  </div>
);
