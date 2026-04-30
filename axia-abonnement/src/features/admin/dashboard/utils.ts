export function formatMoney(value: number) {
  return `${Number(value || 0).toFixed(2)} TND`;
}

export function getCurrentMonthLabel() {
  return new Date()
    .toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}

export function getTransactionCode(index: number) {
  return `TXN-${String(index + 1).padStart(3, "0")}`;
}