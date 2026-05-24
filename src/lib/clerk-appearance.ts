import { dark, experimental_createTheme } from "@clerk/themes";

const modalRadius = "var(--radius-lg)";

/** Clerk appearance aligned with SportStream's Charcoal & Ember design system. */
export const clerkAppearance = experimental_createTheme({
  name: "sportstream",
  baseTheme: dark,
  layout: {
    unsafe_disableDevelopmentModeWarnings: true,
  },
  variables: {
    colorBackground: "var(--card)",
    colorDanger: "var(--destructive)",
    colorForeground: "var(--foreground)",
    colorInput: "var(--input)",
    colorInputForeground: "var(--foreground)",
    colorModalBackdrop: "oklch(0 0 0 / 0.72)",
    colorMuted: "var(--muted)",
    colorMutedForeground: "var(--muted-foreground)",
    colorNeutral: "var(--foreground)",
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorRing: "var(--ring)",
    borderRadius: modalRadius,
    fontFamily: '"Figtree", ui-sans-serif, system-ui, sans-serif',
    fontFamilyButtons: '"Figtree", ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    rootBox: {
      maxHeight: "min(720px, calc(100dvh - 2rem))",
    },
    cardBox: {
      borderRadius: modalRadius,
      overflow: "hidden",
      isolation: "isolate",
      boxShadow: "var(--shadow-card)",
      border: "1px solid var(--border)",
      maxHeight: "min(720px, calc(100dvh - 2rem))",
    },
    card: {
      borderRadius: modalRadius,
      overflow: "hidden",
      maxHeight: "min(720px, calc(100dvh - 2rem))",
      display: "flex",
      flexDirection: "column",
    },
    modalContent: {
      borderRadius: modalRadius,
      overflow: "hidden",
      backgroundColor: "var(--card)",
      border: "none",
      maxHeight: "min(720px, calc(100dvh - 2rem))",
      display: "flex",
      flexDirection: "column",
    },
    scrollBox: {
      flex: "1 1 auto",
      minHeight: 0,
      overflowY: "auto",
      overflowX: "hidden",
    },
    pageScrollBox: {
      flex: "1 1 auto",
      minHeight: 0,
      overflowY: "auto",
      overflowX: "hidden",
    },
    navbar: {
      backgroundColor: "var(--card)",
      borderTopLeftRadius: modalRadius,
      borderBottom: "1px solid var(--border)",
      marginRight: "0",
      overflow: "hidden",
    },
    navbarButton: {
      color: "var(--foreground)",
    },
    headerTitle: {
      fontFamily: '"Outfit", ui-sans-serif, system-ui, sans-serif',
      fontWeight: "600",
    },
    formFieldInput: {
      backgroundColor: "var(--input)",
      borderColor: "var(--border)",
      color: "var(--foreground)",
    },
    formButtonPrimary: {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      boxShadow: "none",
    },
    socialButtonsBlockButton: {
      backgroundColor: "var(--secondary)",
      border: "1px solid var(--border)",
      color: "var(--foreground)",
    },
    dividerLine: {
      backgroundColor: "var(--border)",
    },
    dividerText: {
      color: "var(--muted-foreground)",
    },
    footerActionLink: {
      color: "var(--primary)",
    },
    userButtonPopoverCard: {
      backgroundColor: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: modalRadius,
      overflow: "hidden",
      boxShadow: "var(--shadow-card)",
    },
    userButtonPopoverActionButton: {
      color: "var(--foreground)",
    },
    userButtonPopoverActionButtonIcon: {
      color: "var(--muted-foreground)",
    },
    userPreviewMainIdentifier: {
      fontFamily: '"Outfit", ui-sans-serif, system-ui, sans-serif',
    },
    providerIcon__apple: { filter: "invert(1)" },
    providerIcon__github: { filter: "invert(1)" },
    providerIcon__okx_wallet: { filter: "invert(1)" },
    providerIcon__vercel: { filter: "invert(1)" },
  },
});
