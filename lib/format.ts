export const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("th-TH", { dateStyle: "medium" }) : "—");
