"use client";

import { fmtPct, fmtUsd } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { ActuarialData, Proposal } from "@/lib/types";

export function NumberTiles({ actuarial }: { actuarial: ActuarialData | null }) {
  const t = useT();
  const premium = actuarial
    ? `${fmtUsd(actuarial.premium_range_usd[0])} – ${Math.round(actuarial.premium_range_usd[1]).toLocaleString("en-US")}`
    : "—";
  const tiles: [string, string][] = [
    [t("num.probability"), fmtPct(actuarial?.probability_pct)],
    [t("num.loss"), fmtUsd(actuarial?.expected_loss_usd)],
    [t("num.premium"), premium],
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {tiles.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-border bg-surface-2 p-3">
          <div className="label">{label}</div>
          <div className={`mono text-lg font-semibold ${value === "—" ? "text-muted" : ""}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <div className="label mb-1">{label}</div>
      <p className="whitespace-pre-line text-sm leading-relaxed">{value && value.length ? value : "—"}</p>
    </div>
  );
}

export default function ProposalCard({
  proposal,
  actuarial,
  isMock,
  model,
  compact = false,
}: {
  proposal: Proposal | null;
  actuarial: ActuarialData | null;
  isMock?: boolean;
  model?: string | null;
  compact?: boolean;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="label">{t("field.product")}</div>
        <h3 className={`font-bold leading-tight ${compact ? "text-lg" : "text-2xl"} ${proposal ? "" : "text-muted"}`}>
          {proposal?.product_name ?? "—"}
        </h3>
        {isMock ? <div className="mt-1 text-xs text-warn">{t("field.mockProposal")}</div> : null}
        {model ? (
          <div className="mt-1 text-xs text-muted">
            {t("field.model")}: <span className="mono">{model}</span>
          </div>
        ) : null}
      </div>
      <NumberTiles actuarial={actuarial} />
      {!compact && proposal ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("field.audience")} value={proposal.target_audience} />
          <Field label={t("field.gap")} value={proposal.market_gap} />
          <Field label={t("field.coverage")} value={proposal.coverage_details} />
          <Field label={t("field.exclusions")} value={proposal.exclusions} />
        </div>
      ) : null}
    </div>
  );
}
