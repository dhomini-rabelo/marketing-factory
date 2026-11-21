type LockedPromptCardProps = {
  step: number
  title: string
  hint: string
  promptText: string
}

export function LockedPromptCard({ step, title, hint, promptText }: LockedPromptCardProps) {
  return (
    <section
      aria-disabled="true"
      aria-label={`${title} (bloqueado)`}
      className="relative rounded-3 border border-dashed border-[#c2c2bf] bg-[#f4f4f2] p-4"
    >
      <div className="flex items-center gap-2.5 text-ink-3">
        <span className="grid size-7 place-items-center rounded-[8px] bg-bg text-sm font-bold">{step}</span>
        <h3 className="text-[15px] font-bold">{title}</h3>
        <span className="ml-auto rounded-full bg-[#ececea] px-2 py-0.5 text-xs font-semibold text-ink-2">bloqueado</span>
      </div>
      <p className="mb-2.5 mt-2 text-[13px] text-ink-2">{hint}</p>
      <pre
        aria-hidden="true"
        className="max-h-24 select-none overflow-hidden whitespace-pre-wrap break-words rounded-1 bg-[#eeeeec] px-3 py-2.5 font-mono text-xs leading-[1.55] text-ink-3 blur-[1.4px] [mask-image:linear-gradient(#000_60%,transparent)]"
      >
        {promptText}
      </pre>
      <button
        type="button"
        disabled
        className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2 bg-[#d9d9d6] p-[11px] text-sm font-bold text-ink-3"
      >
        Aprove a lista para liberar
      </button>
    </section>
  )
}
