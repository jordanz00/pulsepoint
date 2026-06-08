"use client";

type Props = {
  returnTo?: string;
  className?: string;
};

export function EntraSignInButton({ returnTo, className }: Props) {
  const href = returnTo
    ? `/api/auth/entra/login?returnTo=${encodeURIComponent(returnTo)}`
    : "/api/auth/entra/login";

  return (
    <a href={href} className={className ?? "pc-btn-primary inline-flex min-h-11 items-center gap-2"}>
      <MicrosoftIcon />
      Sign in with Microsoft
    </a>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}
