import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, TrendingUp, TrendingDown, Boxes, FlaskConical, Wallet } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { KpiCard } from "@/components/KpiCard";
import { LabChart } from "@/components/LabChart";
import { ProductTable } from "@/components/ProductTable";
import { getCardex, getLatestAnalysis, uploadAnalysis } from "@/lib/api";
import { fmtEur, fmtNum, fmtDate } from "@/lib/format";

export default function Dashboard() {
  const [cardex, setCardex] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCardex().then(setCardex).catch(() => setCardex({ exists: false }));
    getLatestAnalysis()
      .then((d) => d.exists && setAnalysis(d))
      .catch(() => {});
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
              title="Diferença"
              value={fmtEur(s.total_diff)}
              subtitle={s.total_diff >= 0 ? "Acima do Cardex" : "Abaixo do Cardex"}
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
            <h2 className="text-2xl font-heading font-medium tracking-tight mb-4">Resumo por Laboratório</h2>
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
                    <TableRow key={l.laboratorio} className="hover:bg-muted/50 transition-colors duration-150" data-testid={`lab-row-${l.laboratorio}`}>
                      <TableCell className="font-medium">{l.laboratorio}</TableCell>
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

          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-2xl font-heading font-medium tracking-tight">Detalhe por Produto</h2>
              <p className="text-xs text-muted-foreground">Análise de {fmtDate(analysis.created_at)} · {analysis.filename}</p>
            </div>
            <ProductTable products={analysis.products} labs={analysis.labs} />
          </Card>
        </>
      )}
    </div>
  );
}
