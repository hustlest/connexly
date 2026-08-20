export type TransferLogRir = "ARIN" | "RIPE" | "APNIC" | "LACNIC" | "AFRINIC";

export type TransferLogEntry = {
  transferDate: string;
  ipv4Range: string;
  recipientOrganization: string;
  sourceOrganization: string;
  registrationDate: string;
  transferType: string;
  sourceRir: TransferLogRir;
  recipientRir: TransferLogRir;
};

/**
 * Static fallback rows used when the live ARIN tracker is unreachable or no
 * password is configured.
 */
export const staticTransferLogRows: TransferLogEntry[] = [
  {
    transferDate: "02/13/2026",
    ipv4Range: "68.67.118.0/24",
    recipientOrganization: "Ryamer, LLC",
    sourceOrganization: "Bluebird Wireless Broadband Services, L.L.C.",
    registrationDate: "06/22/2009",
    transferType: "RESOURCE_TRANSFER",
    sourceRir: "RIPE",
    recipientRir: "RIPE",
  },
  {
    transferDate: "02/13/2026",
    ipv4Range: "68.67.119.0/24",
    recipientOrganization: "Ryamer, LLC",
    sourceOrganization: "Bluebird Wireless Broadband Services, L.L.C.",
    registrationDate: "06/22/2009",
    transferType: "RESOURCE_TRANSFER",
    sourceRir: "ARIN",
    recipientRir: "ARIN",
  },
  {
    transferDate: "02/13/2026",
    ipv4Range: "68.67.120.0/24",
    recipientOrganization: "Ryamer, LLC",
    sourceOrganization: "Bluebird Wireless Broadband Services, L.L.C.",
    registrationDate: "06/22/2009",
    transferType: "RESOURCE_TRANSFER",
    sourceRir: "RIPE",
    recipientRir: "RIPE",
  },
  {
    transferDate: "02/12/2026",
    ipv4Range: "68.67.121.0/24",
    recipientOrganization: "Ryamer, LLC",
    sourceOrganization: "Bluebird Wireless Broadband Services, L.L.C.",
    registrationDate: "06/22/2009",
    transferType: "RESOURCE_TRANSFER",
    sourceRir: "RIPE",
    recipientRir: "RIPE",
  },
  {
    transferDate: "02/12/2026",
    ipv4Range: "68.67.122.0/24",
    recipientOrganization: "Ryamer, LLC",
    sourceOrganization: "Bluebird Wireless Broadband Services, L.L.C.",
    registrationDate: "06/22/2009",
    transferType: "RESOURCE_TRANSFER",
    sourceRir: "ARIN",
    recipientRir: "ARIN",
  },
  {
    transferDate: "02/11/2026",
    ipv4Range: "68.67.123.0/24",
    recipientOrganization: "Ryamer, LLC",
    sourceOrganization: "Bluebird Wireless Broadband Services, L.L.C.",
    registrationDate: "06/22/2009",
    transferType: "RESOURCE_TRANSFER",
    sourceRir: "RIPE",
    recipientRir: "RIPE",
  },
  {
    transferDate: "02/10/2026",
    ipv4Range: "68.67.125.0/24",
    recipientOrganization: "Ryamer, LLC",
    sourceOrganization: "Bluebird Wireless Broadband Services, L.L.C.",
    registrationDate: "06/22/2009",
    transferType: "RESOURCE_TRANSFER",
    sourceRir: "RIPE",
    recipientRir: "RIPE",
  },
  {
    transferDate: "02/10/2026",
    ipv4Range: "68.67.126.0/24",
    recipientOrganization: "Ryamer, LLC",
    sourceOrganization: "Bluebird Wireless Broadband Services, L.L.C.",
    registrationDate: "06/22/2009",
    transferType: "RESOURCE_TRANSFER",
    sourceRir: "ARIN",
    recipientRir: "ARIN",
  },
];
