export type ThemeMode = "light" | "dark" | "system";

export type BorderRadiusOption = "sharp" | "compact" | "normal" | "smooth" | "pill";
export type ButtonStyleOption = "filled" | "outlined" | "tonal" | "elevated";
export type DensityOption = "compact" | "normal" | "comfortable";

export type CustomColors = {
  themeMode: ThemeMode;
  presetName?: string;
  borderRadius?: BorderRadiusOption;
  buttonStyle?: ButtonStyleOption;
  density?: DensityOption;
  backgroundColor: string;
  cardColor: string;
  foregroundColor: string;
  borderColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  destructiveColor: string;
  chartColors: string[];
};

export type GooglePreset = {
  id: string;
  name: string;
  nameEn: string;
  primaryColor: string;
  accentColor: string;
  light: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    cardColor: string;
    foregroundColor: string;
    borderColor: string;
    successColor: string;
    warningColor: string;
    destructiveColor: string;
    chartColors: string[];
  };
  dark: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    cardColor: string;
    foregroundColor: string;
    borderColor: string;
    successColor: string;
    warningColor: string;
    destructiveColor: string;
    chartColors: string[];
  };
};

export const GOOGLE_PRESETS: GooglePreset[] = [
  {
    id: "google-blue",
    name: "Google Classic Blue (น้ำเงินคลาสสิก)",
    nameEn: "Google Blue",
    primaryColor: "#1A73E8",
    accentColor: "#D2E3FC",
    light: {
      primaryColor: "#1A73E8",
      secondaryColor: "#E8F0FE",
      accentColor: "#D2E3FC",
      backgroundColor: "#F8FAFD",
      cardColor: "#FFFFFF",
      foregroundColor: "#202124",
      borderColor: "#DADCE0",
      successColor: "#188038",
      warningColor: "#B06000",
      destructiveColor: "#D93025",
      chartColors: ["#188038", "#1A73E8", "#B06000", "#D93025", "#8430CE"],
    },
    dark: {
      primaryColor: "#8AB4F8",
      secondaryColor: "#303134",
      accentColor: "#3C4043",
      backgroundColor: "#202124",
      cardColor: "#292A2D",
      foregroundColor: "#F8F9FA",
      borderColor: "#5F6368",
      successColor: "#81C995",
      warningColor: "#FDD663",
      destructiveColor: "#F28B82",
      chartColors: ["#81C995", "#8AB4F8", "#FDD663", "#F28B82", "#C58AF9"],
    },
  },
  {
    id: "google-green",
    name: "Google Emerald Green (เขียวชีต & ไดรฟ์)",
    nameEn: "Google Green",
    primaryColor: "#188038",
    accentColor: "#CEEAD6",
    light: {
      primaryColor: "#188038",
      secondaryColor: "#E6F4EA",
      accentColor: "#CEEAD6",
      backgroundColor: "#F8FAF8",
      cardColor: "#FFFFFF",
      foregroundColor: "#202124",
      borderColor: "#DADCE0",
      successColor: "#188038",
      warningColor: "#B06000",
      destructiveColor: "#D93025",
      chartColors: ["#188038", "#1A73E8", "#E37400", "#D93025", "#5E35B1"],
    },
    dark: {
      primaryColor: "#81C995",
      secondaryColor: "#28332A",
      accentColor: "#344437",
      backgroundColor: "#1E2420",
      cardColor: "#282D29",
      foregroundColor: "#F8F9FA",
      borderColor: "#546357",
      successColor: "#81C995",
      warningColor: "#FDD663",
      destructiveColor: "#F28B82",
      chartColors: ["#81C995", "#8AB4F8", "#FDD663", "#F28B82", "#C58AF9"],
    },
  },
  {
    id: "google-amber",
    name: "Google Amber Yellow (ส้มทองคีพ & ปฏิทิน)",
    nameEn: "Google Amber",
    primaryColor: "#E37400",
    accentColor: "#FEEFC3",
    light: {
      primaryColor: "#E37400",
      secondaryColor: "#FEF7E0",
      accentColor: "#FEEFC3",
      backgroundColor: "#FAF9F6",
      cardColor: "#FFFFFF",
      foregroundColor: "#202124",
      borderColor: "#DADCE0",
      successColor: "#188038",
      warningColor: "#B06000",
      destructiveColor: "#D93025",
      chartColors: ["#188038", "#E37400", "#1A73E8", "#D93025", "#8430CE"],
    },
    dark: {
      primaryColor: "#FDD663",
      secondaryColor: "#383222",
      accentColor: "#473F28",
      backgroundColor: "#24221D",
      cardColor: "#2D2B26",
      foregroundColor: "#F8F9FA",
      borderColor: "#665F4C",
      successColor: "#81C995",
      warningColor: "#FDD663",
      destructiveColor: "#F28B82",
      chartColors: ["#FDD663", "#8AB4F8", "#81C995", "#F28B82", "#C58AF9"],
    },
  },
  {
    id: "google-red",
    name: "Google Coral Red (แดงจีเมล & สดใส)",
    nameEn: "Google Red",
    primaryColor: "#D93025",
    accentColor: "#FAD2CF",
    light: {
      primaryColor: "#D93025",
      secondaryColor: "#FCE8E6",
      accentColor: "#FAD2CF",
      backgroundColor: "#FAF8F8",
      cardColor: "#FFFFFF",
      foregroundColor: "#202124",
      borderColor: "#DADCE0",
      successColor: "#188038",
      warningColor: "#B06000",
      destructiveColor: "#D93025",
      chartColors: ["#188038", "#D93025", "#1A73E8", "#E37400", "#7C4DFF"],
    },
    dark: {
      primaryColor: "#F28B82",
      secondaryColor: "#382626",
      accentColor: "#492F2F",
      backgroundColor: "#241E1E",
      cardColor: "#2E2828",
      foregroundColor: "#F8F9FA",
      borderColor: "#695252",
      successColor: "#81C995",
      warningColor: "#FDD663",
      destructiveColor: "#F28B82",
      chartColors: ["#F28B82", "#8AB4F8", "#81C995", "#FDD663", "#C58AF9"],
    },
  },
  {
    id: "google-violet",
    name: "Google Deep Violet (ม่วงฟอร์ม & คลาวด์)",
    nameEn: "Google Violet",
    primaryColor: "#7C4DFF",
    accentColor: "#E8D4FB",
    light: {
      primaryColor: "#7C4DFF",
      secondaryColor: "#F3E8FD",
      accentColor: "#E8D4FB",
      backgroundColor: "#F9F8FC",
      cardColor: "#FFFFFF",
      foregroundColor: "#202124",
      borderColor: "#DADCE0",
      successColor: "#188038",
      warningColor: "#B06000",
      destructiveColor: "#D93025",
      chartColors: ["#188038", "#7C4DFF", "#1A73E8", "#E37400", "#D93025"],
    },
    dark: {
      primaryColor: "#C58AF9",
      secondaryColor: "#33283D",
      accentColor: "#423252",
      backgroundColor: "#221E26",
      cardColor: "#2C2733",
      foregroundColor: "#F8F9FA",
      borderColor: "#615273",
      successColor: "#81C995",
      warningColor: "#FDD663",
      destructiveColor: "#F28B82",
      chartColors: ["#C58AF9", "#8AB4F8", "#81C995", "#FDD663", "#F28B82"],
    },
  },
  {
    id: "neon-ai",
    name: "Neon AI (ม่วงฟ้าเรืองแสง)",
    nameEn: "Neon AI",
    primaryColor: "#9B7BFF",
    accentColor: "#F7E58B",
    light: {
      primaryColor: "#6D4AFF",
      secondaryColor: "#EEE9FF",
      accentColor: "#F7E58B",
      backgroundColor: "#F5F2FF",
      cardColor: "#FFFFFF",
      foregroundColor: "#20183A",
      borderColor: "#C9B9FF",
      successColor: "#86E3C2",
      warningColor: "#E8C95D",
      destructiveColor: "#E87891",
      chartColors: ["#6D4AFF", "#86E3C2", "#E8C95D", "#E87891", "#B56CFF"],
    },
    dark: {
      primaryColor: "#B59AFF",
      secondaryColor: "#30245A",
      accentColor: "#F7E58B",
      backgroundColor: "#17112D",
      cardColor: "#211942",
      foregroundColor: "#F5F1FF",
      borderColor: "#6655A1",
      successColor: "#8BE7C9",
      warningColor: "#F7E58B",
      destructiveColor: "#FF8FA8",
      chartColors: ["#B59AFF", "#8BE7C9", "#F7E58B", "#FF8FA8", "#D384FF"],
    },
  },
  {
    id: "google-teal",
    name: "Google Teal Ocean (เขียวอมฟ้า & มีท)",
    nameEn: "Google Teal",
    primaryColor: "#00796B",
    accentColor: "#B2DFDB",
    light: {
      primaryColor: "#00796B",
      secondaryColor: "#E0F2F1",
      accentColor: "#B2DFDB",
      backgroundColor: "#F7FAFA",
      cardColor: "#FFFFFF",
      foregroundColor: "#202124",
      borderColor: "#DADCE0",
      successColor: "#188038",
      warningColor: "#B06000",
      destructiveColor: "#D93025",
      chartColors: ["#188038", "#00796B", "#1A73E8", "#E37400", "#8430CE"],
    },
    dark: {
      primaryColor: "#4DB6AC",
      secondaryColor: "#223331",
      accentColor: "#2C423F",
      backgroundColor: "#1C2423",
      cardColor: "#262E2D",
      foregroundColor: "#F8F9FA",
      borderColor: "#4F6360",
      successColor: "#81C995",
      warningColor: "#FDD663",
      destructiveColor: "#F28B82",
      chartColors: ["#4DB6AC", "#8AB4F8", "#81C995", "#FDD663", "#C58AF9"],
    },
  },
];

export const DEFAULT_COLORS_LIGHT: CustomColors = {
  themeMode: "light",
  presetName: "neon-ai",
  borderRadius: "normal",
  buttonStyle: "filled",
  density: "normal",
  backgroundColor: "#F5F2FF",
  cardColor: "#FFFFFF",
  foregroundColor: "#20183A",
  borderColor: "#C9B9FF",
  primaryColor: "#6D4AFF",
  secondaryColor: "#EEE9FF",
  accentColor: "#F7E58B",
  successColor: "#86E3C2",
  warningColor: "#E8C95D",
  destructiveColor: "#E87891",
  chartColors: ["#6D4AFF", "#86E3C2", "#E8C95D", "#E87891", "#B56CFF"],
};

export const DEFAULT_COLORS_DARK: CustomColors = {
  themeMode: "dark",
  presetName: "neon-ai",
  borderRadius: "normal",
  buttonStyle: "filled",
  density: "normal",
  backgroundColor: "#17112D",
  cardColor: "#211942",
  foregroundColor: "#F5F1FF",
  borderColor: "#6655A1",
  primaryColor: "#B59AFF",
  secondaryColor: "#30245A",
  accentColor: "#F7E58B",
  successColor: "#8BE7C9",
  warningColor: "#F7E58B",
  destructiveColor: "#FF8FA8",
  chartColors: ["#B59AFF", "#8BE7C9", "#F7E58B", "#FF8FA8", "#D384FF"],
};

function hexToRgb(value: string) {
  const hex = value.trim().replace(/^#/, "");
  if (![3, 6].includes(hex.length) || !/^[0-9a-f]+$/i.test(hex)) return null;
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => `${c}${c}`)
          .join("")
      : hex;
  return [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255);
}

export function readableForeground(color: string, fallback: string) {
  const rgb = hexToRgb(color);
  if (!rgb) return fallback;
  const linear = rgb.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const luminance =
    0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
  return luminance > 0.48 ? "#202124" : "#F8F9FA";
}

export function getRadiusValue(option?: BorderRadiusOption): string {
  switch (option) {
    case "sharp":
      return "0.25rem"; // 4px
    case "compact":
      return "0.5rem"; // 8px
    case "normal":
      return "0.75rem"; // 12px (Google standard)
    case "smooth":
      return "1rem"; // 16px
    case "pill":
      return "1.5rem"; // 24px
    default:
      return "0.75rem";
  }
}

export function applyTheme(colors: Partial<CustomColors>) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const mode = colors.themeMode ?? "system";

  let isDark = false;
  if (mode === "dark") {
    isDark = true;
  } else if (mode === "system") {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  const preset = GOOGLE_PRESETS.find((p) => p.id === colors.presetName) ?? GOOGLE_PRESETS[0];
  const defaults = isDark
    ? (preset?.dark ?? DEFAULT_COLORS_DARK)
    : (preset?.light ?? DEFAULT_COLORS_LIGHT);
  const fallbackForeground = isDark ? "#F8F9FA" : "#202124";

  const bg = colors.backgroundColor || defaults.backgroundColor;
  const card = colors.cardColor || defaults.cardColor;
  const fg = colors.foregroundColor || defaults.foregroundColor;
  const border = colors.borderColor || defaults.borderColor;
  const primary = colors.primaryColor || defaults.primaryColor;
  const secondary = colors.secondaryColor || defaults.secondaryColor;
  const accent = colors.accentColor || defaults.accentColor;
  const success = colors.successColor || defaults.successColor;
  const warning = colors.warningColor || defaults.warningColor;
  const destructive = colors.destructiveColor || defaults.destructiveColor;
  const charts = colors.chartColors?.length ? colors.chartColors : defaults.chartColors;

  // Custom radii & layout attributes
  const radius = getRadiusValue(colors.borderRadius);
  root.style.setProperty("--radius", radius);

  const density = colors.density ?? "normal";
  root.setAttribute("data-density", density);

  const buttonStyle = colors.buttonStyle ?? "filled";
  root.setAttribute("data-button-style", buttonStyle);

  // Density padding / spacing
  if (density === "compact") {
    root.style.setProperty("--density-padding", "0.5rem");
    root.style.setProperty("--density-gap", "0.5rem");
  } else if (density === "comfortable") {
    root.style.setProperty("--density-padding", "1.25rem");
    root.style.setProperty("--density-gap", "1.25rem");
  } else {
    root.style.setProperty("--density-padding", "0.75rem");
    root.style.setProperty("--density-gap", "0.75rem");
  }

  root.style.setProperty("--background", bg);
  root.style.setProperty("--foreground", fg);
  root.style.setProperty("--card", card);
  root.style.setProperty("--card-foreground", fg);
  root.style.setProperty("--popover", card);
  root.style.setProperty("--popover-foreground", fg);
  root.style.setProperty("--primary", primary);
  root.style.setProperty("--primary-foreground", readableForeground(primary, fallbackForeground));
  root.style.setProperty("--secondary", secondary);
  root.style.setProperty(
    "--secondary-foreground",
    readableForeground(secondary, fallbackForeground),
  );
  root.style.setProperty("--muted", `color-mix(in oklab, ${secondary} 72%, ${bg})`);
  root.style.setProperty("--muted-foreground", `color-mix(in oklab, ${fg} 64%, ${bg})`);
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-foreground", readableForeground(accent, fallbackForeground));
  root.style.setProperty("--success", success);
  root.style.setProperty("--success-foreground", readableForeground(success, fallbackForeground));
  root.style.setProperty("--success-soft", `color-mix(in oklab, ${success} 14%, ${bg})`);
  root.style.setProperty("--warning", warning);
  root.style.setProperty("--warning-foreground", readableForeground(warning, fallbackForeground));
  root.style.setProperty("--warning-soft", `color-mix(in oklab, ${warning} 14%, ${bg})`);
  root.style.setProperty("--destructive", destructive);
  root.style.setProperty(
    "--destructive-foreground",
    readableForeground(destructive, fallbackForeground),
  );
  root.style.setProperty("--destructive-soft", `color-mix(in oklab, ${destructive} 14%, ${bg})`);
  root.style.setProperty("--info-soft", `color-mix(in oklab, ${primary} 12%, ${bg})`);
  root.style.setProperty("--border", border);
  root.style.setProperty("--input", border);
  root.style.setProperty("--ring", primary);
  root.style.setProperty(
    "--gradient-header",
    `linear-gradient(115deg, ${primary} 0%, color-mix(in oklab, ${primary} 70%, ${accent}) 100%)`,
  );
  root.style.setProperty("--sidebar", card);
  root.style.setProperty("--sidebar-foreground", fg);
  root.style.setProperty("--sidebar-primary", primary);
  root.style.setProperty(
    "--sidebar-primary-foreground",
    readableForeground(primary, fallbackForeground),
  );
  root.style.setProperty("--sidebar-accent", accent);
  root.style.setProperty(
    "--sidebar-accent-foreground",
    readableForeground(accent, fallbackForeground),
  );
  root.style.setProperty("--sidebar-border", border);
  root.style.setProperty("--sidebar-ring", primary);

  charts.forEach((color, index) => {
    root.style.setProperty(`--chart-${index + 1}`, color);
  });
}
