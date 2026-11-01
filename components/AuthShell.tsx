import Link from "next/link";
export default function AuthShell({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 block text-center font-semibold">WebRent</Link>
        <div className="card p-6 sm:p-8"><h1 className="mb-6 text-2xl font-semibold">{title}</h1>{children}</div>
        {footer && <p className="mt-4 text-center text-sm text-muted">{footer}</p>}
      </div>
    </div>
  );
}
