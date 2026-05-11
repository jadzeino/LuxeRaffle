export const AppFooter = () => {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.25em]">
              LuxeRaffle
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              LuxeRaffle offers exciting opportunities to win luxury cars
              through fair and transparent raffles.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold">Quick Links</h2>
            <ul className="space-y-2 text-sm">
              <li><span className="text-muted-foreground">Terms &amp; Conditions</span></li>
              <li><span className="text-muted-foreground">Privacy Policy</span></li>
              <li><span className="text-muted-foreground">FAQ</span></li>
              <li><span className="text-muted-foreground">Contact Us</span></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold">Connect With Us</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 LuxeRaffle. All rights reserved. Gambling can be addictive.
            Please gamble responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
};
