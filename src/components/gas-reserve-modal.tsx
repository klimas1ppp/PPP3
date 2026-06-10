"use client";

import { VAULT } from "@/config";
import { fmtAmount } from "@/lib/format";

export type GasReservePrompt = {
  requestedAmount: bigint;
  suggestedAmount: bigint;
  reserve: bigint;
};

export function GasReserveModal({
  prompt,
  onConfirm,
  onCancel,
}: {
  prompt: GasReservePrompt;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const sym = VAULT.asset.symbol;
  const d = VAULT.asset.decimals;

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="modal-card"
        role="dialog"
        aria-labelledby="gas-reserve-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="gas-reserve-title" className="modal-title">
          Reserve USDC for gas
        </h3>
        <p className="modal-body">
          You&apos;re paying the network fee in USDC. Depositing your full balance leaves nothing
          to cover gas — try a slightly smaller amount.
        </p>
        <dl className="modal-details">
          <div>
            <dt>Network fee (est.)</dt>
            <dd>
              ~{fmtAmount(prompt.reserve, d)} {sym}
            </dd>
          </div>
          <div>
            <dt>Suggested deposit</dt>
            <dd>
              {fmtAmount(prompt.suggestedAmount, d)} {sym}
            </dd>
          </div>
        </dl>
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="modal-btn modal-btn-primary" onClick={onConfirm}>
            Use {fmtAmount(prompt.suggestedAmount, d)} {sym}
          </button>
        </div>
      </div>
    </div>
  );
}
