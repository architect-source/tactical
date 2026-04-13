/**
 * VOID-METAL // S-1792
 * THREAT_SIGNATURE_DATABASE
 */

export const SCAM_MARKERS = {
  GAMBLING_CASINO: [
    "Instant Withdrawals",
    "Same-Day Payouts",
    "100% Win Rate",
    "Guaranteed Wins",
    "Rigged in Your Favor",
    "Deposit now before offer expires",
    "bonus multipliers",
    "axtkprox.com"
  ],
  ADVANCE_FEE_INVESTMENT: [
    "You’ve won a prize",
    "upfront fee required",
    "pig butchering",
    "Fake job offers",
    "Crypto recovery",
    "recover your lost funds",
    "Impersonation of banks"
  ],
  TECHNICAL_BEHAVIORAL: [
    "wallet connect",
    "seed phrases",
    "credential harvesting",
    "Fake login portals",
    "Multiple redirects"
  ]
};

export const THREAT_SIGNATURES = [
  ...SCAM_MARKERS.GAMBLING_CASINO,
  ...SCAM_MARKERS.ADVANCE_FEE_INVESTMENT,
  ...SCAM_MARKERS.TECHNICAL_BEHAVIORAL
];
