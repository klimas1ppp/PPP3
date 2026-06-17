"use client";

import { VAULT } from "@/config";
import { fmtAmount, fmtUsd, humanizeError, sanitizeAmount, toUnits, trimUnits } from "@/lib/format";
import {
  useDeposit,
  useVault,
  useWithdraw,
  type TxPhase,
  type VaultState,
} from "@/hooks/use-vault";
import { WalletButton } from "@/components/wallet-button";
import { Info, Loader2 } from "lucide-react";
import { useState } from "react";

export function VaultPanel() {
  const vault = useVault();
  const deposit = useDeposit(vault);
  const withdraw = useWithdraw(vault);
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");

  const canTransact = vault.isConnected && vault.isOnBase;
  const txBusy = deposit.busy || withdraw.busy;
  const showTransact = canTransact || txBusy;

  return (
    <div className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-md sm:p-8">
      <StatsRow vault={vault} />

      {!showTransact ? (
        vault.isConnected && !vault.isOnBase ? (
          <SwitchNetworkButton vault={vault} />
        ) : (
          <ConnectNudge />
        )
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-background/60 p-1">
            {(["deposit", "withdraw"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`h-10 rounded-lg text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "deposit" ? (
            <DepositForm vault={vault} deposit={deposit} />
          ) : (
            <WithdrawForm vault={vault} withdraw={withdraw} />
          )}
        </>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground/80">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Live on {VAULT.chainName}.{" "}
          <a
            href={`${VAULT.explorer}/address/${VAULT.address}`}
            target="_blank"
            rel="noreferrer"
            className="text-gold underline-offset-2 hover:underline"
          >
            View vault on BaseScan
          </a>
        </span>
      </p>
    </div>
  );
}

function ConnectNudge() {
  return (
    <div className="mt-6">
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Connect your wallet to deposit USDC and put your savings to work for good — your principal
        stays fully yours.
      </p>
      <WalletButton variant="primary" />
    </div>
  );
}

function SwitchNetworkButton({ vault }: { vault: VaultState }) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Your wallet is connected on another network. Switch to {VAULT.chainName} to deposit.
      </p>
      {error && <TxBanner tone="error">{error}</TxBanner>}
      <button
        type="button"
        className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={vault.isSwitching}
        onClick={() => {
          setError(null);
          void vault.switchToBase().catch((e) => setError(humanizeError(e)));
        }}
      >
        {vault.isSwitching ? "Switching…" : `Switch to ${VAULT.chainName}`}
      </button>
    </div>
  );
}

function StatsRow({ vault }: { vault: VaultState }) {
  const d = VAULT.asset.decimals;

  return (
    <div className={`grid gap-3 ${vault.isConnected ? "grid-cols-2" : "grid-cols-1"}`}>
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
    <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="mt-0.5 font-heading text-lg font-semibold tabular-nums">
        {loading ? "…" : value}
      </p>
    </div>
  );
}

function DepositForm({
  vault,
  deposit,
}: {
  vault: VaultState;
  deposit: ReturnType<typeof useDeposit>;
}) {
  const [amount, setAmount] = useState("");

  const wei = toUnits(amount, VAULT.asset.decimals);
  const insufficient = wei > vault.walletBalance;
  const blocked = insufficient;

  return (
    <div className="mt-6">
      <AmountField
        value={amount}
        onChange={setAmount}
        onMax={() => {
          setAmount(
            vault.walletBalance > 0n ? trimUnits(vault.walletBalance, VAULT.asset.decimals) : "",
          );
        }}
        symbol={VAULT.asset.symbol}
        hint={`Wallet: ${fmtAmount(vault.walletBalance, VAULT.asset.decimals)} ${VAULT.asset.symbol}`}
        error={insufficient ? "Insufficient balance" : undefined}
        disabled={deposit.busy}
      />
      <TxStatus state={deposit.state} verb="Deposit" onDone={() => deposit.reset()} />
      <ActionButton
        phase={deposit.state.phase}
        verb="Deposit"
        busy={deposit.busy}
        disabled={deposit.state.phase === "success" ? false : wei <= 0n || blocked || deposit.busy}
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
      />
    </div>
  );
}

function WithdrawForm({
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
    <div className="mt-6">
      <AmountField
        value={amount}
        onChange={setAmount}
        onMax={() =>
          setAmount(vault.deposited > 0n ? trimUnits(vault.deposited, VAULT.asset.decimals) : "")
        }
        symbol={VAULT.asset.symbol}
        hint={`Deposited: ${fmtAmount(vault.deposited, VAULT.asset.decimals)} ${VAULT.asset.symbol}`}
        error={insufficient ? "Exceeds your deposit" : undefined}
        disabled={withdraw.busy}
      />
      <TxStatus state={withdraw.state} verb="Withdraw" onDone={() => withdraw.reset()} />
      <ActionButton
        phase={withdraw.state.phase}
        verb="Withdraw"
        busy={withdraw.busy}
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
      />
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
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onMax: () => void;
  symbol: string;
  hint: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Amount</span>
        <span className="text-muted-foreground">{hint}</span>
      </div>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-background/60 px-4 py-3 ${
          error ? "border-destructive/60" : "border-border"
        }`}
      >
        <input
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(sanitizeAmount(e.target.value))}
          className="w-full bg-transparent text-2xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
        />
        <span className="font-medium text-muted-foreground">{symbol}</span>
        <button
          type="button"
          onClick={onMax}
          disabled={disabled}
          className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-primary/25 disabled:opacity-40"
        >
          MAX
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ActionButton({
  phase,
  verb,
  busy,
  disabled,
  onClick,
}: {
  phase: TxPhase;
  verb: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy && phase !== "success" && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {btnLabel(phase, verb)}
    </button>
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
      <TxBanner tone="error">
        {state.error ?? humanizeError(null)}{" "}
        <button type="button" className="underline underline-offset-2" onClick={onDone}>
          dismiss
        </button>
      </TxBanner>
    );
  }
  if (state.phase === "success") {
    return (
      <TxBanner tone="success">
        {verb} confirmed.{" "}
        {explorer && (
          <a href={explorer} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            view tx
          </a>
        )}{" "}
        <button type="button" className="underline underline-offset-2" onClick={onDone}>
          done
        </button>
      </TxBanner>
    );
  }

  const msgs: Record<string, string> = {
    signing: `Confirm ${verb.toLowerCase()} in wallet…`,
    pending: "Transaction confirming…",
  };

  return (
    <TxBanner tone="info">
      {msgs[state.phase]}{" "}
      {explorer && (
        <a href={explorer} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          view tx
        </a>
      )}
    </TxBanner>
  );
}

function TxBanner({
  tone,
  children,
}: {
  tone: "info" | "error" | "success";
  children: React.ReactNode;
}) {
  const tones = {
    info: "border-border/60 bg-background/60 text-muted-foreground",
    error: "border-destructive/40 bg-destructive/10 text-destructive",
    success: "border-primary/40 bg-primary/10 text-foreground",
  };

  return (
    <p className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}>
      {children}
    </p>
  );
}

function btnLabel(phase: TxPhase, verb: string) {
  if (phase === "signing") return "Confirm in wallet…";
  if (phase === "pending") return `${verb}ing…`;
  if (phase === "success") return "Done ✓";
  return verb;
}
