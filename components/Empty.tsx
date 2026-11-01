import Link from "next/link";
export default function Empty({ text, cta }: { text: string; cta?: { href: string; label: string } }) {
  return <div className="card p-10 text-center text-muted"><p>{text}</p>{cta && <Link href={cta.href} className="btn-primary mt-4">{cta.label}</Link>}</div>;
}
