"use client";

import { VAULT } from "@/config";
import { fmtAmount, fmtUsd, humanizeError, sanitizeAmount, toUnits, trimUnits } from "@/lib/format";
import {
  useDeposit,
  useVault,
  useWalletProfile,
  useWithdraw,
  type TxPhase,
  type VaultState,
} from "@/hooks/use-vault";
import { Switch } from "@/components/switch";
import { useState } from "react";

export function VaultApp() {
  const vault = useVault();
  const { profile } = useWalletProfile(vault.address, vault.isConnected);
  const [payWithEth, setPayWithEth] = useState(false);
  const deposit = useDeposit(vault, profile, payWithEth);
  const withdraw = useWithdraw(vault);
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");

  const canTransact = vault.isConnected && vault.isOnBase;
  const txBusy = deposit.busy || withdraw.busy;
  const showTransact = canTransact || txBusy;

  return (
    <div className="vault-card">
      <header className="vault-header">
        <p className="vault-eyebrow">Charity Vault · {VAULT.chainName}</p>
        <h2 className="vault-title">Deposit USDC</h2>
      </header>

      <StatsRow vault={vault} />

      {!showTransact ? (
        vault.isConnected && !vault.isOnBase ? (
          <SwitchNetworkButton vault={vault} />
        ) : (
          <ConnectNudge vault={vault} />
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
          {tab === "deposit" ? (
            <DepositPanel vault={vault} deposit={deposit} payWithEth={payWithEth} onPayWithEthChange={setPayWithEth} />
          ) : (
            <WithdrawPanel vault={vault} withdraw={withdraw} />
          )}
        </>
      )}

      {vault.connectError && <Banner tone="error">{vault.connectError}</Banner>}

      <footer className="vault-footer">
        <a href={`${VAULT.explorer}/address/${VAULT.address}`} target="_blank" rel="noreferrer">
          View vault on BaseScan →
        </a>
      </footer>
    </div>
  );
}

function ConnectNudge({ vault }: { vault: VaultState }) {
  return (
    <div className="connect-nudge">
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
    </div>
  );
}

function SwitchNetworkButton({ vault }: { vault: VaultState }) {
  return (
    <button type="button" className="btn-primary" onClick={vault.switchToBase} disabled={vault.isSwitching}>
      {vault.isSwitching ? "Switching…" : `Switch to ${VAULT.chainName}`}
    </button>
  );
}

function StatsRow({ vault }: { vault: VaultState }) {
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

function DepositPanel({
  vault,
  deposit,
  payWithEth,
  onPayWithEthChange,
}: {
  vault: VaultState;
  deposit: ReturnType<typeof useDeposit>;
  payWithEth: boolean;
  onPayWithEthChange: (v: boolean) => void;
}) {
  const [amount, setAmount] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const wei = toUnits(amount, VAULT.asset.decimals);
  const insufficient = wei > vault.walletBalance;
  const gasBlocker = deposit.depositBlocker(amount);
  const blocked = insufficient || Boolean(gasBlocker);

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
      {gasBlocker && !insufficient && wei > 0n && (
        <Banner tone="warn">{gasBlocker}</Banner>
      )}
      {deposit.gasHint && !deposit.busy && (
        <p className="gas-hint">{deposit.gasHint}</p>
      )}
      <TxStatus state={deposit.state} verb="Deposit" onDone={() => { deposit.reset(); }} />
      <button
        type="button"
        className="btn-primary"
        disabled={
          deposit.state.phase === "success"
            ? false
            : wei <= 0n || blocked || deposit.busy
        }
        onClick={() => {
          if (deposit.state.phase === "success") {
            deposit.reset();
            return;
          }
          if (deposit.busy || wei <= 0n || blocked) return;
          const value = amount;
          setAmount("");
          void deposit.deposit(value);
        }}
      >
        {btnLabel(deposit.state.phase, "Deposit")}
      </button>
      <div className="advanced">
        <button
          type="button"
          className="advanced-toggle"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
        >
          Advanced {showAdvanced ? "▾" : "▸"}
        </button>
        {showAdvanced && (
          <Switch
            id="pay-with-eth"
            checked={payWithEth}
            onChange={onPayWithEthChange}
            label="Pay with ETH"
            className="advanced-option"
          />
        )}
      </div>
    </div>
  );
}

function WithdrawPanel({
  vault,
  withdraw,
}: {
  vault: VaultState;
  withdraw: ReturnType<typeof useWithdraw>;
}) {
  const [amount, setAmount] = useState("");

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
      <TxStatus state={withdraw.state} verb="Withdraw" onDone={() => { withdraw.reset(); }} />
      <button
        type="button"
        className="btn-primary"
        disabled={
          withdraw.state.phase === "success"
            ? false
            : wei <= 0n || insufficient || withdraw.busy
        }
        onClick={() => {
          if (withdraw.state.phase === "success") {
            withdraw.reset();
            return;
          }
          if (withdraw.busy || wei <= 0n || insufficient) return;
          const value = amount;
          setAmount("");
          void withdraw.withdraw(value);
        }}
      >
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
  state: { phase: TxPhase; error?: string; hash?: `0x${string}`; gasPaidInUsdc?: boolean };
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
        {verb} confirmed.
        {state.gasPaidInUsdc ? " Gas paid in USDC." : ""}{" "}
        {explorer && <a href={explorer} target="_blank" rel="noreferrer" className="banner-link">view tx</a>}{" "}
        <button type="button" className="banner-link" onClick={onDone}>done</button>
      </Banner>
    );
  }

  const msgs: Record<string, string> = {
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
