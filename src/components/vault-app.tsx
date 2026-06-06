"use client";

import { useState } from "react";
import { VAULT } from "@/config";
import { WalletButton } from "@/components/wallet-button";
import { useDeposit, useVault, useWithdraw, type TxPhase } from "@/hooks/use-vault";
import {
  fmtAmount,
  fmtUsd,
  humanizeError,
  sanitizeAmount,
  toUnits,
  trimUnits,
} from "@/lib/format";

export function VaultApp() {
  const vault = useVault();
  const d = VAULT.asset.decimals;
  const hasDeposit = vault.isConnected && vault.maxWithdraw > 0n;

  return (
    <div className="shell">
      <div className="deco deco-a" aria-hidden />
      <div className="deco deco-b" aria-hidden />

      <header className="nav">
        <div className="nav-brand">
          <span className="nav-title">Charity Vault</span>
          <span className="pill">{VAULT.chainName}</span>
        </div>
        <WalletButton />
      </header>

      <main className="stage">
        <section className="intro">
          <h1 className="vault-name">{vault.isLoading ? "…" : vault.vaultName ?? "Vault"}</h1>
          <p className="vault-lede">
            Deposit {VAULT.asset.symbol}. Your principal stays yours — only yield goes to charity.
          </p>

          <div className="tvl-card">
            <span className="tvl-label">Total in vault</span>
            <span className="tvl-amount">{fmtUsd(vault.totalAssets, d)}</span>
            {!vault.isLoading && vault.vaultSymbol && (
              <span className="tvl-meta">{vault.vaultSymbol} on {VAULT.chainName}</span>
            )}
          </div>

          {vault.isConnected && vault.isOnBase && (
            <div className={`position-card ${hasDeposit ? "position-active" : ""}`}>
              <span className="position-label">Your balance</span>
              <span className="position-amount">
                {fmtAmount(vault.maxWithdraw, d)} {VAULT.asset.symbol}
              </span>
              {hasDeposit ? (
                <span className="position-hint">Available to withdraw anytime</span>
              ) : (
                <span className="position-hint">Nothing deposited yet</span>
              )}
            </div>
          )}

          <a
            className="contract-link"
            href={`${VAULT.explorer}/address/${VAULT.address}`}
            target="_blank"
            rel="noreferrer"
          >
            View contract on Basescan ↗
          </a>
        </section>

        <section className="action-card">
          {!vault.isConnected ? (
            <div className="action-empty">
              <div className="action-icon" aria-hidden>◎</div>
              <p>Connect a wallet to deposit or withdraw.</p>
            </div>
          ) : !vault.isOnBase ? (
            <div className="action-empty">
              <p>Switch to {VAULT.chainName} to continue.</p>
              <button type="button" className="btn-primary" onClick={vault.switchToBase} disabled={vault.isSwitching}>
                {vault.isSwitching ? "Switching…" : `Switch to ${VAULT.chainName}`}
              </button>
            </div>
          ) : (
            <ManagePanel />
          )}

          {vault.connectError && <div className="banner banner-error">{vault.connectError}</div>}
        </section>
      </main>
    </div>
  );
}

function ManagePanel() {
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");

  return (
    <>
      <div className="tab-row">
        {(["deposit", "withdraw"] as const).map((t) => (
          <button key={t} type="button" className={`tab ${tab === t ? "tab-active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === "deposit" ? <DepositPanel /> : <WithdrawPanel />}
    </>
  );
}

function DepositPanel() {
  const vault = useVault();
  const [amount, setAmount] = useState("");
  const deposit = useDeposit(() => vault.refetch());

  const wei = toUnits(amount, VAULT.asset.decimals);
  const insufficient = wei > vault.walletBalance;
  const needsApproval = deposit.needsApproval(amount);

  return (
    <div className="form">
      <AmountField
        value={amount}
        onChange={setAmount}
        onMax={() =>
          setAmount(vault.walletBalance > 0n ? trimUnits(vault.walletBalance, VAULT.asset.decimals) : "")
        }
        symbol={VAULT.asset.symbol}
        hint={`In wallet: ${fmtAmount(vault.walletBalance, VAULT.asset.decimals)} ${VAULT.asset.symbol}`}
        error={insufficient ? "Not enough in wallet" : undefined}
      />
      <TxStatus state={deposit.state} verb="Deposit" onDone={() => { setAmount(""); deposit.reset(); }} />
      {needsApproval && !deposit.busy && deposit.state.phase !== "success" ? (
        <button type="button" className="btn-primary" disabled={wei <= 0n || insufficient} onClick={() => deposit.approve(amount)}>
          Approve {VAULT.asset.symbol}
        </button>
      ) : (
        <button type="button" className="btn-primary" disabled={wei <= 0n || insufficient || deposit.busy} onClick={() => deposit.deposit(amount)}>
          {btnLabel(deposit.state.phase, "Deposit")}
        </button>
      )}
    </div>
  );
}

function WithdrawPanel() {
  const vault = useVault();
  const [amount, setAmount] = useState("");
  const withdraw = useWithdraw(() => vault.refetch());

  const wei = toUnits(amount, VAULT.asset.decimals);
  const insufficient = wei > vault.maxWithdraw;

  return (
    <div className="form">
      <AmountField
        value={amount}
        onChange={setAmount}
        onMax={() => setAmount(vault.maxWithdraw > 0n ? trimUnits(vault.maxWithdraw, VAULT.asset.decimals) : "")}
        symbol={VAULT.asset.symbol}
        hint={`Available: ${fmtAmount(vault.maxWithdraw, VAULT.asset.decimals)} ${VAULT.asset.symbol}`}
        error={insufficient ? "Exceeds balance" : undefined}
      />
      <TxStatus state={withdraw.state} verb="Withdraw" onDone={() => { setAmount(""); withdraw.reset(); }} />
      <button type="button" className="btn-secondary" disabled={wei <= 0n || insufficient || withdraw.busy} onClick={() => withdraw.withdraw(amount)}>
        {btnLabel(withdraw.state.phase, "Withdraw")}
      </button>
    </div>
  );
}

function AmountField({
  value,
  onChange,
  onMax,
  symbol,
  hint,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onMax: () => void;
  symbol: string;
  hint: string;
  error?: string;
}) {
  return (
    <div>
      <div className={`amount-field ${error ? "amount-error" : ""}`}>
        <input
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(sanitizeAmount(e.target.value))}
          className="amount-input"
        />
        <span className="amount-symbol">{symbol}</span>
        <button type="button" className="amount-max" onClick={onMax}>
          Max
        </button>
      </div>
      <div className="amount-meta">
        <span>{hint}</span>
        {error && <span className="amount-err">{error}</span>}
      </div>
    </div>
  );
}

function TxStatus({
  state,
  verb,
  onDone,
}: {
  state: { phase: TxPhase; error?: string; hash?: `0x${string}` };
  verb: string;
  onDone: () => void;
}) {
  if (state.phase === "idle") return null;
  const explorer = state.hash ? `${VAULT.explorer}/tx/${state.hash}` : undefined;

  if (state.phase === "error") {
    return (
      <div className="banner banner-error">
        {state.error ?? humanizeError(null)}{" "}
        <button type="button" className="banner-link" onClick={onDone}>Dismiss</button>
      </div>
    );
  }
  if (state.phase === "success") {
    return (
      <div className="banner banner-success">
        {verb} confirmed.{" "}
        {explorer && <a href={explorer} target="_blank" rel="noreferrer" className="banner-link">View tx</a>}{" "}
        <button type="button" className="banner-link" onClick={onDone}>Done</button>
      </div>
    );
  }

  const msgs: Record<string, string> = {
    approving: "Confirm approval in wallet…",
    "approve-confirming": "Approval confirming…",
    signing: `Confirm ${verb.toLowerCase()} in wallet…`,
    pending: "Confirming on chain…",
  };

  return (
    <div className="banner banner-info">
      {msgs[state.phase]}{" "}
      {explorer && <a href={explorer} target="_blank" rel="noreferrer" className="banner-link">View tx</a>}
    </div>
  );
}

function btnLabel(phase: TxPhase, verb: string) {
  if (phase === "signing") return "Confirm in wallet…";
  if (phase === "pending") return `${verb}ing…`;
  if (phase === "success") return "Done";
  return verb;
}
