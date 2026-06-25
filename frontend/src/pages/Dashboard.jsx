import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, TrendingUp, TrendingDown, Boxes, FlaskConical, Wallet, FileSpreadsheet, ChevronRight } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { KpiCard } from "@/components/KpiCard";
import { LabChart } from "@/components/LabChart";
import { ProductTable } from "@/components/ProductTable";
import { getCardex, uploadAnalysis, API } from "@/lib/api";
import { fmtEur, fmtNum, fmtDate } from "@/lib/format";

export default function Dashboard() {
  const [cardex, setCardex] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [labFilter, setLabFilter] = useState("all");
  const productRef = useRef(null);

  const selectLab = (l) => {
    setLabFilter(l);
    setTimeout(() => productRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  useEffect(() => {
    // Só verifica se o Cardex existe; o dashboard arranca vazio,
    // a análise só aparece depois de carregar um ficheiro de vendas.
    getCardex().then(setCardex).catch(() => setCardex({ exists: false }));
  }, []);

  const handleUpload = async (file) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const data = await uploadAnalysis(fd);
      setAnalysis(data);
      toast.success(`Análise concluída: ${data.summary.n_products} produtos, ${data.summary.n_labs} laboratórios.`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao processar o ficheiro.");
    } finally {
      setLoading(false);
    }
  };

  const s = analysis?.summary;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-semibold tracking-tight">Rentabilidade por Laboratório</h1>
        <p className="text-muted-foreground mt-1">
          Carregue o ficheiro de vendas (.txt) para calcular o ganho/perda da farmácia.
        </p>
      </div>

      {cardex && !cardex.exists && (
        <Card className="p-4 border border-[#B23A3A]/30 bg-[#F7E6E6] flex items-center gap-3" data-testid="no-cardex-banner">
          <AlertCircle className="h-5 w-5 text-[#B23A3A] shrink-0" />
          <p className="text-sm text-[#B23A3A]">
            Ainda não carregou o ficheiro Cardex (Excel). Vá a{" "}
            <Link to="/definicoes" className="font-semibold underline">
              Definições
            </Link>{" "}
            para o carregar antes de analisar vendas.
          </p>
        </Card>
      )}

      <Card className="p-6 border border-border">
        <FileDropzone
          testid="txt-dropzone"
          accept=".txt"
          loading={loading}
          onFile={handleUpload}
          label="Carregar ficheiro de vendas (.txt)"
          hint="Arraste o ficheiro INFOPREX...TXT ou clique para selecionar"
        />
        {cardex?.exists && (
          <p className="text-xs text-muted-foreground mt-3">
            Cardex ativo: <strong>{cardex.filename}</strong> · {fmtNum(cardex.count)} produtos · {cardex.labs.length} laboratórios
          </p>
        )}
      </Card>

      {analysis && s && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <KpiCard
              testid="kpi-rent-real"
              title="Rentabilidade Real"
              value={fmtEur(s.total_rent_txt)}
              subtitle="Margem das vendas (12 meses)"
              icon={Wallet}
              tone="gain"
            />
            <KpiCard
              testid="kpi-rent-cardex"
              title="Rentabilidade Cardex"
              value={fmtEur(s.total_rent_xls)}
              subtitle="Margem de referência"
              icon={Wallet}
            />
            <KpiCard
              testid="kpi-diff"
              title="Diferença (Cardex − Real)"
              value={fmtEur(s.total_diff)}
              subtitle={s.total_diff >= 0 ? "A farmácia ganha mais com o Cardex" : "Vendas acima do Cardex"}
              icon={s.total_diff >= 0 ? TrendingUp : TrendingDown}
              tone={s.total_diff >= 0 ? "gain" : "loss"}
            />
            <KpiCard testid="kpi-products" title="Produtos" value={fmtNum(s.n_products)} subtitle="Com vendas e Cardex" icon={Boxes} />
            <KpiCard testid="kpi-labs" title="Laboratórios" value={fmtNum(s.n_labs)} subtitle="Analisados" icon={FlaskConical} />
          </div>

          <Card className="p-6 border border-border">
            <h2 className="text-2xl font-heading font-medium tracking-tight mb-4">Real vs Cardex por Laboratório</h2>
            <LabChart labs={analysis.labs} />
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-heading font-medium tracking-tight">Resumo por Laboratório</h2>
                <p className="text-sm text-muted-foreground mt-1">Clique num laboratório para ver os produtos individuais.</p>
              </div>
              <a
                href={`${API}/analysis/${analysis.id}/export`}
                data-testid="export-excel-btn"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-md px-4 py-2 text-sm transition-colors duration-200"
              >
                <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
              </a>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Laboratório</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produtos</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Qtd (12m)</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rent. Real</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rent. Cardex</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Diferença</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.labs.map((l) => (
                    <TableRow
                      key={l.laboratorio}
                      onClick={() => selectLab(l.laboratorio)}
                      className="hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
                      data-testid={`lab-row-${l.laboratorio}`}
                    >
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-1">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          {l.laboratorio}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(l.n_products)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(l.qty)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtEur(l.rent_txt_total)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtEur(l.rent_xls_total)}</TableCell>
                      <TableCell className={`text-right tabular-nums font-medium ${l.diff_total >= 0 ? "text-[#1A7B5E]" : "text-[#B23A3A]"}`}>
                        {fmtEur(l.diff_total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card ref={productRef} className="p-6 border border-border scroll-mt-20">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-2xl font-heading font-medium tracking-tight">
                Detalhe por Produto{labFilter !== "all" ? ` — ${labFilter}` : ""}
              </h2>
              <p className="text-xs text-muted-foreground">Análise de {fmtDate(analysis.created_at)} · {analysis.filename}</p>
            </div>
            <ProductTable products={analysis.products} labs={analysis.labs} lab={labFilter} setLab={setLabFilter} />
          </Card>
        </>
      )}
    </div>
  );
}
