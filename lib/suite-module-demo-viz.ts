/**
 * Illustrative per-module metrics for marketing Modules spotlight.
 * Sample data only — label in UI as demo / sample.
 */

import type { ChartPoint } from "@/lib/motion/chart-samples";
import type { ProductId } from "@/lib/products";
import { STATEWIDE_HOSPITAL_MEMBER_COUNT } from "@/lib/marketing-constants";

export type ModuleDemoStat = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
};

export type ModuleDemoViz = {
  chartTitle: string;
  chart: ChartPoint[];
  stats: ModuleDemoStat[];
};

export const PRODUCT_DEMO_VIZ: Record<ProductId, ModuleDemoViz> = {
  work: {
    chartTitle: "Staff tasks resolved · sample week",
    chart: [
      { label: "M", value: 18 },
      { label: "T", value: 24 },
      { label: "W", value: 21 },
      { label: "T", value: 31 },
      { label: "F", value: 28 },
      { label: "S", value: 12 },
    ],
    stats: [
      { label: "Open exceptions", value: "4", delta: "−2", trend: "down" },
      { label: "Avg response", value: "2.1h", delta: "−18%", trend: "down" },
      { label: "Modules touched", value: "6", trend: "flat" },
    ],
  },
  members: {
    chartTitle: "MemberPulse · sample 6 mo",
    chart: [
      { label: "O", value: 62 },
      { label: "N", value: 68 },
      { label: "D", value: 71 },
      { label: "J", value: 74 },
      { label: "F", value: 78 },
      { label: "M", value: 81 },
    ],
    stats: [
      { label: "Member hospitals", value: String(STATEWIDE_HOSPITAL_MEMBER_COUNT), delta: "Statewide", trend: "flat" },
      { label: "Renewal rate", value: "94%", delta: "+1pt", trend: "up" },
      { label: "At-risk", value: "18", delta: "−3", trend: "down" },
    ],
  },
  crm: {
    chartTitle: "New contacts captured · sample",
    chart: [
      { label: "W1", value: 42 },
      { label: "W2", value: 58 },
      { label: "W3", value: 51 },
      { label: "W4", value: 67 },
      { label: "W5", value: 72 },
      { label: "W6", value: 79 },
    ],
    stats: [
      { label: "Unified records", value: "8.4K", trend: "flat" },
      { label: "Web captures", value: "214", delta: "+31", trend: "up" },
      { label: "Duplicates merged", value: "38", trend: "flat" },
    ],
  },
  deals: {
    chartTitle: "Pipeline value · sample quarter",
    chart: [
      { label: "J", value: 120 },
      { label: "F", value: 145 },
      { label: "M", value: 168 },
      { label: "A", value: 152 },
      { label: "M", value: 190 },
      { label: "J", value: 210 },
    ],
    stats: [
      { label: "Open deals", value: "24", trend: "flat" },
      { label: "Forecast", value: "$1.2M", delta: "+8%", trend: "up" },
      { label: "Win rate", value: "34%", delta: "+2pt", trend: "up" },
    ],
  },
  events: {
    chartTitle: "Registrations · sample event",
    chart: [
      { label: "−6w", value: 12 },
      { label: "−4w", value: 48 },
      { label: "−2w", value: 96 },
      { label: "−1w", value: 142 },
      { label: "Evt", value: 218 },
      { label: "+1d", value: 231 },
    ],
    stats: [
      { label: "Registered", value: "231", delta: "+18/wk", trend: "up" },
      { label: "Checked in", value: "198", trend: "flat" },
      { label: "Revenue", value: "$42K", delta: "+12%", trend: "up" },
    ],
  },
  advertising: {
    chartTitle: "Impressions delivered · sample",
    chart: [
      { label: "W1", value: 820 },
      { label: "W2", value: 940 },
      { label: "W3", value: 880 },
      { label: "W4", value: 1020 },
      { label: "W5", value: 1100 },
      { label: "W6", value: 1180 },
    ],
    stats: [
      { label: "Active campaigns", value: "6", trend: "flat" },
      { label: "MLR cleared", value: "98%", trend: "up" },
      { label: "Reconciled", value: "$284K", trend: "flat" },
    ],
  },
  learn: {
    chartTitle: "CE completions · sample",
    chart: [
      { label: "Q1", value: 420 },
      { label: "Q2", value: 510 },
      { label: "Q3", value: 488 },
      { label: "Q4", value: 562 },
      { label: "Q1", value: 601 },
      { label: "Q2", value: 640 },
    ],
    stats: [
      { label: "Credits issued", value: "1.8K", delta: "+6%", trend: "up" },
      { label: "Courses live", value: "42", trend: "flat" },
      { label: "On profile", value: "100%", trend: "flat" },
    ],
  },
  giving: {
    chartTitle: "Gift revenue · sample",
    chart: [
      { label: "J", value: 28 },
      { label: "F", value: 34 },
      { label: "M", value: 41 },
      { label: "A", value: 38 },
      { label: "M", value: 52 },
      { label: "J", value: 48 },
    ],
    stats: [
      { label: "YTD raised", value: "$241K", delta: "+9%", trend: "up" },
      { label: "Campaigns", value: "3", trend: "flat" },
      { label: "Avg gift", value: "$186", trend: "flat" },
    ],
  },
  commerce: {
    chartTitle: "Order volume · sample",
    chart: [
      { label: "W1", value: 64 },
      { label: "W2", value: 72 },
      { label: "W3", value: 68 },
      { label: "W4", value: 81 },
      { label: "W5", value: 88 },
      { label: "W6", value: 94 },
    ],
    stats: [
      { label: "Orders", value: "94", delta: "+7%", trend: "up" },
      { label: "Dues SKUs", value: "12", trend: "flat" },
      { label: "Cart conv.", value: "68%", delta: "+3pt", trend: "up" },
    ],
  },
  engage: {
    chartTitle: "Member sends · sample",
    chart: [
      { label: "W1", value: 8 },
      { label: "W2", value: 14 },
      { label: "W3", value: 11 },
      { label: "W4", value: 19 },
      { label: "W5", value: 22 },
      { label: "W6", value: 24 },
    ],
    stats: [
      { label: "Segments", value: "18", trend: "flat" },
      { label: "Open rate", value: "41%", delta: "+2pt", trend: "up" },
      { label: "Sends/mo", value: "24K", trend: "flat" },
    ],
  },
  insights: {
    chartTitle: "Board KPI snapshot · sample",
    chart: [
      { label: "K1", value: 72 },
      { label: "K2", value: 78 },
      { label: "K3", value: 81 },
      { label: "K4", value: 79 },
      { label: "K5", value: 86 },
      { label: "K6", value: 88 },
    ],
    stats: [
      { label: "Widgets", value: "14", trend: "flat" },
      { label: "Retention", value: "91%", delta: "+1pt", trend: "up" },
      { label: "Export ready", value: "Yes", trend: "flat" },
    ],
  },
  advocacy: {
    chartTitle: "Take-action responses · sample week",
    chart: [
      { label: "M", value: 42 },
      { label: "T", value: 58 },
      { label: "W", value: 71 },
      { label: "T", value: 89 },
      { label: "F", value: 96 },
      { label: "S", value: 72 },
    ],
    stats: [
      { label: "Priority issues", value: "12", delta: "+2", trend: "up" },
      { label: "Hospitals engaged", value: "169", delta: "72%", trend: "up" },
      { label: "Bills tracked", value: "34", trend: "flat" },
    ],
  },
};
