const eur = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });
const num = new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 });
const dec = new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtEur = (v) => (v === null || v === undefined ? "—" : eur.format(v));
export const fmtNum = (v) => (v === null || v === undefined ? "—" : num.format(v));
export const fmtDec = (v) => (v === null || v === undefined ? "—" : dec.format(v));

export const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-PT", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};
