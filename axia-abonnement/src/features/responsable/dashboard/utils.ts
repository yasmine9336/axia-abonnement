export function monthLabelFR(date = new Date()) {
  const value = date.toLocaleString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function monthShortFR(date = new Date()) {
  const value = date.toLocaleString("fr-FR", {
    month: "short",
  });

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatMoney(value: number) {
  return `${Number(value || 0).toFixed(2)} TND`;
}