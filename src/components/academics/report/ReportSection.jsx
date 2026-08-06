export default function ReportSection({ title, subtitle, children }) {
  return (
    <section className="mb-5">
      <div className="mb-3">
        <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}