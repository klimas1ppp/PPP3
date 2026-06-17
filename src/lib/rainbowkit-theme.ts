import { darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import type { Theme } from "@rainbow-me/rainbowkit";

const BODY_FONT = "var(--font-sans)";

const SHARED_OPTS = {
  borderRadius: "medium" as const,
  fontStack: "system" as const,
  overlayBlur: "small" as const,
};

type ThemeVars = ReturnType<typeof lightTheme>;

function withOverrides(
  base: ThemeVars,
  colors: Partial<ThemeVars["colors"]>,
  shadows?: Partial<ThemeVars["shadows"]>,
): ThemeVars {
  return {
    ...base,
    fonts: { body: BODY_FONT },
    colors: { ...base.colors, ...colors },
    shadows: shadows ? { ...base.shadows, ...shadows } : base.shadows,
  };
}

export function getRainbowKitTheme(mode: "light" | "dark"): Theme {
  if (mode === "dark") {
    const base = darkTheme({
      accentColor: "#f0c84a",
      accentColorForeground: "#0c2319",
      ...SHARED_OPTS,
    });

    return withOverrides(
      base,
      {
        connectButtonBackground: "rgba(40, 64, 53, 0.4)",
        connectButtonInnerBackground: "transparent",
        connectButtonText: "#f0d878",
        connectButtonBackgroundError: "rgba(180, 60, 50, 0.85)",
        connectButtonTextError: "#fff",
        modalBackground: "#182a22",
        modalBorder: "#264035",
        modalBackdrop: "rgba(12, 35, 25, 0.55)",
        modalText: "#f0d878",
        modalTextSecondary: "#9a8f72",
        modalTextDim: "rgba(154, 143, 114, 0.45)",
        profileAction: "#1a3026",
        profileActionHover: "rgba(240, 200, 74, 0.1)",
        profileForeground: "rgba(38, 64, 53, 0.55)",
        actionButtonBorder: "rgba(240, 200, 74, 0.14)",
        actionButtonBorderMobile: "rgba(240, 200, 74, 0.14)",
        actionButtonSecondaryBackground: "rgba(240, 200, 74, 0.08)",
        generalBorder: "rgba(240, 200, 74, 0.14)",
        generalBorderDim: "rgba(38, 64, 53, 0.45)",
        closeButton: "#9a8f72",
        closeButtonBackground: "rgba(240, 200, 74, 0.08)",
        connectionIndicator: "#6fbf7f",
        menuItemBackground: "rgba(111, 191, 127, 0.12)",
        selectedOptionBorder: "rgba(240, 200, 74, 0.22)",
      },
      {
        dialog: "0 16px 40px rgba(0, 0, 0, 0.4)",
        profileDetailsAction: "0 2px 6px rgba(0, 0, 0, 0.2)",
      },
    );
  }

  const base = lightTheme({
    accentColor: "#1e3a2f",
    accentColorForeground: "#f5f0e6",
    ...SHARED_OPTS,
  });

  return withOverrides(
    base,
    {
      connectButtonBackground: "rgba(255, 252, 247, 0.85)",
      connectButtonInnerBackground: "transparent",
      connectButtonText: "#1e3a2f",
      connectButtonBackgroundError: "#c44",
      connectButtonTextError: "#fff",
      modalBackground: "#fffcf7",
      modalBorder: "#ddd2c0",
      modalBackdrop: "rgba(12, 35, 25, 0.55)",
      modalText: "#1e3a2f",
      modalTextSecondary: "#7a6e60",
      modalTextDim: "rgba(122, 110, 96, 0.45)",
      profileAction: "#fffcf7",
      profileActionHover: "rgba(212, 168, 83, 0.1)",
      profileForeground: "rgba(221, 210, 192, 0.55)",
      actionButtonBorder: "rgba(107, 68, 35, 0.14)",
      actionButtonBorderMobile: "rgba(107, 68, 35, 0.14)",
      actionButtonSecondaryBackground: "rgba(221, 210, 192, 0.35)",
      generalBorder: "rgba(107, 68, 35, 0.14)",
      generalBorderDim: "rgba(221, 210, 192, 0.5)",
      closeButton: "#7a6e60",
      closeButtonBackground: "rgba(221, 210, 192, 0.35)",
      connectionIndicator: "#4a8f55",
      menuItemBackground: "rgba(74, 143, 85, 0.1)",
      selectedOptionBorder: "rgba(107, 68, 35, 0.2)",
    },
    {
      dialog: "0 20px 50px rgba(30, 58, 47, 0.15)",
      profileDetailsAction: "0 2px 6px rgba(37, 41, 46, 0.06)",
    },
  );
}
