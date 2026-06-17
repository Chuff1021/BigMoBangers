export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="usa-stripe h-1 w-full" />
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );
}
