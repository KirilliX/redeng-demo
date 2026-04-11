export default function BrandMark({ compact = false, subtitle = "B2B-лендинги и CRM для заявок" }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-red-500/30 bg-red-600/15">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
        <span className="relative text-base font-black tracking-[0.2em] text-white">
          R
        </span>
      </div>
      {!compact && (
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.35em] text-white">
            RED Engineering
          </div>
          <div className="text-xs text-[#8a8f9a]">{subtitle}</div>
        </div>
      )}
    </div>
  );
}
