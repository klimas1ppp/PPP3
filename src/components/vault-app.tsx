"use client";

import { VAULT } from "@/config";
import { fmtAmount, fmtUsd, humanizeError, sanitizeAmount, toUnits, trimUnits } from "@/lib/format";
import { useDeposit, useVault, useWithdraw, type TxPhase } from "@/hooks/use-vault";
import { useState } from "react";

export function VaultApp() {
  const vault = useVault();
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");

  const canTransact = vault.isConnected && vault.isOnBase;

  return (
    <div className="vault-card">
      <header className="vault-header">
        <p className="vault-eyebrow">Charity Vault · {VAULT.chainName}</p>
        <h2 className="vault-title">Deposit USDC</h2>
        <p className="vault-tagline">
          Charity without sacrifice — not a lottery, not a donation you can&apos;t get back.
        </p>
      </header>

      <StatsRow vault={vault} />

      {!canTransact ? (
        vault.isConnected && !vault.isOnBase ? (
          <SwitchNetworkButton />
        ) : (
          <ConnectNudge />
        )
      ) : (
        <>
          <div className="tab-row">
            {(["deposit", "withdraw"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`tab ${tab === t ? "tab-active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "deposit" ? <DepositPanel /> : <WithdrawPanel />}
        </>
      )}

      {vault.connectError && <Banner tone="error">{vault.connectError}</Banner>}

      <footer className="vault-footer">
        <a href={`${VAULT.explorer}/address/${VAULT.address}`} target="_blank" rel="noreferrer">
          View vault on BaseScan ↗
        </a>
      </footer>
    </div>
  );
}

function ConnectNudge() {
  const vault = useVault();

  return (
    <div className="connect-nudge">
      <div className="connect-nudge-icon" aria-hidden>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="connect-nudge-text">
        Connect your wallet to deposit USDC and put your savings to work for good — your principal stays fully yours.
      </p>
      <button
        type="button"
        className="btn-primary"
        onClick={vault.connect}
        disabled={vault.isConnecting}
      >
        {vault.isConnecting ? "Connecting…" : "Connect Wallet"}
      </button>
      <p className="connect-nudge-hint">Works with MetaMask, Coinbase Wallet, and others on Base.</p>
    </div>
  );
}

function SwitchNetworkButton() {
  const vault = useVault();
  return (
    <button type="button" className="btn-primary" onClick={vault.switchToBase} disabled={vault.isSwitching}>
      {vault.isSwitching ? "Switching…" : `Switch to ${VAULT.chainName}`}
    </button>
  );
}

function StatsRow({ vault }: { vault: ReturnType<typeof useVault> }) {
  const d = VAULT.asset.decimals;

  return (
    <div className={`stats-row ${vault.isConnected ? "stats-row-2" : "stats-row-1"}`}>
      <Stat label="Vault total" value={fmtUsd(vault.totalAssets, d)} loading={vault.isLoading} />
      {vault.isConnected && (
        <Stat
          label="Your deposit"
          value={`${fmtAmount(vault.deposited, d)} ${VAULT.asset.symbol}`}
          loading={vault.isLoading}
        />
      )}
    </div>
  );
}

function Stat({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{loading ? "…" : value}</span>
    </div>
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
        onMax={() => setAmount(vault.walletBalance > 0n ? trimUnits(vault.walletBalance, VAULT.asset.decimals) : "")}
        symbol={VAULT.asset.symbol}
        hint={`Wallet: ${fmtAmount(vault.walletBalance, VAULT.asset.decimals)} ${VAULT.asset.symbol}`}
        error={insufficient ? "Insufficient balance" : undefined}
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
  const insufficient = wei > vault.deposited;

  return (
    <div className="form">
      <AmountField
        value={amount}
        onChange={setAmount}
        onMax={() => setAmount(vault.deposited > 0n ? trimUnits(vault.deposited, VAULT.asset.decimals) : "")}
        symbol={VAULT.asset.symbol}
        hint={`Deposited: ${fmtAmount(vault.deposited, VAULT.asset.decimals)} ${VAULT.asset.symbol}`}
        error={insufficient ? "Exceeds your deposit" : undefined}
      />
      <TxStatus state={withdraw.state} verb="Withdraw" onDone={() => { setAmount(""); withdraw.reset(); }} />
      <button type="button" className="btn-primary" disabled={wei <= 0n || insufficient || withdraw.busy} onClick={() => withdraw.withdraw(amount)}>
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
          MAX
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
      <Banner tone="error">
        {state.error ?? humanizeError(null)}{" "}
        <button type="button" className="banner-link" onClick={onDone}>dismiss</button>
      </Banner>
    );
  }
  if (state.phase === "success") {
    return (
      <Banner tone="success">
        {verb} confirmed.{" "}
        {explorer && <a href={explorer} target="_blank" rel="noreferrer" className="banner-link">view tx</a>}{" "}
        <button type="button" className="banner-link" onClick={onDone}>done</button>
      </Banner>
    );
  }

  const msgs: Record<string, string> = {
    approving: "Confirm approval in wallet…",
    "approve-confirming": "Approval confirming…",
    signing: `Confirm ${verb.toLowerCase()} in wallet…`,
    pending: "Transaction confirming…",
  };

  return (
    <Banner tone="info">
      {msgs[state.phase]}{" "}
      {explorer && <a href={explorer} target="_blank" rel="noreferrer" className="banner-link">view tx</a>}
    </Banner>
  );
}

function Banner({ tone, children }: { tone: "info" | "warn" | "error" | "success"; children: React.ReactNode }) {
  return <div className={`banner banner-${tone}`}>{children}</div>;
}

function btnLabel(phase: TxPhase, verb: string) {
  if (phase === "signing") return "Confirm in wallet…";
  if (phase === "pending") return `${verb}ing…`;
  if (phase === "success") return "Done ✓";
  return verb;
}
