import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Database, FlaskConical } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { getCardex, uploadCardex } from "@/lib/api";
import { fmtNum, fmtDate, fmtDec } from "@/lib/format";

export default function Settings() {
  const [cardex, setCardex] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => getCardex().then(setCardex).catch(() => setCardex({ exists: false }));
  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (file) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const data = await uploadCardex(fd);
      toast.success(`Cardex atualizado: ${data.count} produtos, ${data.labs.length} laboratórios.`);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao processar o ficheiro Excel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-semibold tracking-tight">Definições</h1>
        <p className="text-muted-foreground mt-1">
          Carregue e atualize o ficheiro Cardex (Excel) com os produtos e descontos por laboratório.
        </p>
      </div>

      <Card className="p-6 border border-border">
        <FileDropzone
          testid="xls-dropzone"
          accept=".xlsx,.xls"
          loading={loading}
          onFile={handleUpload}
          label="Carregar ficheiro Cardex (.xlsx)"
          hint="Arraste o ficheiro Excel ou clique para selecionar. Substitui o Cardex atual."
        />
      </Card>

      {cardex?.exists && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border border-border" data-testid="cardex-status">
              <div className="flex items-center gap-2 text-[#1A7B5E]">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Cardex Ativo</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3 break-all">{cardex.filename}</p>
              <p className="text-xs text-muted-foreground mt-1">Atualizado: {fmtDate(cardex.uploaded_at)}</p>
            </Card>
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Database className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Produtos</span>
              </div>
              <p className="mt-3 text-3xl font-heading font-semibold tabular-nums">{fmtNum(cardex.count)}</p>
            </Card>
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FlaskConical className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Laboratórios</span>
              </div>
              <p className="mt-3 text-3xl font-heading font-semibold tabular-nums">{cardex.labs.length}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {cardex.labs.slice(0, 10).map((l) => (
                  <Badge key={l} variant="secondary" className="font-normal">
                    {l}
                  </Badge>
                ))}
                {cardex.labs.length > 10 && (
                  <Badge variant="outline" className="font-normal">+{cardex.labs.length - 10}</Badge>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-6 border border-border">
            <h2 className="text-2xl font-heading font-medium tracking-tight mb-4">Amostra de produtos</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="max-h-[480px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted z-10">
                    <TableRow>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CNP</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Descrição</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Laboratório</TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">PVP</TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">PCU</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cardex.sample.map((p) => (
                      <TableRow key={p.cnp} className="hover:bg-muted/50 transition-colors duration-150">
                        <TableCell className="tabular-nums">{p.cnp}</TableCell>
                        <TableCell className="max-w-[320px] truncate" title={p.descricao}>{p.descricao}</TableCell>
                        <TableCell>{p.laboratorio}</TableCell>
                        <TableCell className="text-right tabular-nums">{fmtDec(p.pvp)}</TableCell>
                        <TableCell className="text-right tabular-nums">{fmtDec(p.pcu)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">A mostrar os primeiros {cardex.sample.length} de {fmtNum(cardex.count)} produtos.</p>
          </Card>
        </>
      )}
    </div>
  );
}
