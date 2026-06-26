import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Search } from "lucide-react";
import { fmtEur, fmtNum, fmtDec } from "@/lib/format";

const columns = [
  { key: "cpr", label: "CNP", align: "left" },
  { key: "nome", label: "Produto", align: "left" },
  { key: "laboratorio", label: "Laboratório", align: "left" },
  { key: "qty", label: "Qtd (12m)", align: "right" },
  { key: "pvp_txt", label: "PVP", align: "right", money: true },
  { key: "pcu_txt", label: "PCU", align: "right", money: true },
  { key: "rent_txt_total", label: "Rent. Real", align: "right", money: true },
  { key: "rent_xls_total", label: "Rent. Cardex", align: "right", money: true },
  { key: "diff_total", label: "Diferença", align: "right", money: true, tone: true },
  { key: "melhor_desconto", label: "Melhor Desconto", align: "left" },
];

export const ProductTable = ({ products, labs, lab, setLab }) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("rent_txt_total");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = useMemo(() => {
    let rows = products;
    if (lab !== "all") rows = rows.filter((p) => p.laboratorio === lab);
    if (search.trim()) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (p) => (p.nome || "").toLowerCase().includes(s) || String(p.cpr).includes(s)
      );
    }
    const sorted = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return sorted;
  }, [products, lab, search, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="product-search"
            placeholder="Pesquisar produto ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={lab} onValueChange={setLab}>
          <SelectTrigger className="w-full sm:w-64" data-testid="product-lab-filter">
            <SelectValue placeholder="Laboratório" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os laboratórios</SelectItem>
            {labs.map((l) => (
              <SelectItem key={l.laboratorio} value={l.laboratorio}>
                {l.laboratorio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table containerClassName="max-h-[560px]">
          <TableHeader className="sticky top-0 z-20">
            <TableRow>
              {columns.map((c) => (
                <TableHead
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className={`sticky top-0 bg-muted cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                    c.align === "right" ? "text-right" : "text-left"
                  }`}
                  data-testid={`sort-${c.key}`}
                >
                  <span className={`inline-flex items-center gap-1 ${c.align === "right" ? "flex-row-reverse" : ""}`}>
                    {c.label}
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p, i) => (
              <TableRow key={p.cpr + "-" + i} className="transition-colors duration-150 hover:bg-muted/50">
                <TableCell className="tabular-nums text-muted-foreground">{p.cpr}</TableCell>
                <TableCell className="max-w-[280px] truncate" title={p.nome}>
                  {p.nome}
                </TableCell>
                <TableCell>{p.laboratorio}</TableCell>
                <TableCell className="text-right tabular-nums">{fmtNum(p.qty)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmtDec(p.pvp_txt)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmtDec(p.pcu_txt)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmtEur(p.rent_txt_total)}</TableCell>
                <TableCell className="text-right tabular-nums">{fmtEur(p.rent_xls_total)}</TableCell>
                <TableCell
                  className={`text-right tabular-nums font-medium ${
                    p.diff_total >= 0 ? "text-[#1A7B5E]" : "text-[#B23A3A]"
                  }`}
                >
                  {fmtEur(p.diff_total)}
                </TableCell>
                <TableCell>
                  {p.melhor_desconto ? (
                    <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground whitespace-nowrap">
                      {p.melhor_desconto}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{filtered.length} produtos</p>
    </div>
  );
};
