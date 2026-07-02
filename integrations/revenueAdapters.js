export const confirmedRevenueAdapters = {
  paymentWhatsAppGroup: null,
  crm: null,
  invoiceSystem: null,
  accountingSystem: null,
};

export const normalizeConfirmedRevenue = (records = []) =>
  records.map((record) => ({
    id: record.id,
    bookingId: record.bookingId,
    amount: Number(record.amount || 0),
    currency: record.currency || "AED",
    collectedAt: record.collectedAt || null,
    source: record.source || "unknown",
  }));
