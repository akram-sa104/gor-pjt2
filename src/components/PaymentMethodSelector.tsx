import { Banknote, Info } from "lucide-react";

const PaymentMethodSelector = () => {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
        <Banknote className="h-4 w-4 text-primary" /> Metode Pembayaran
      </h4>
      <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary bg-primary/5">
        <Banknote className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Bayar di Lokasi (Cash)</p>
          <p className="text-xs text-muted-foreground">Pembayaran dilakukan langsung di tempat GOR Jasa Tirta II</p>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-warning/10 rounded-lg p-3">
        <Info className="h-4 w-4 text-warning mt-0.5 shrink-0" />
        <p className="text-xs text-warning">
          Silakan datang 1×24 jam sebelum waktu booking dan lakukan pembayaran cash di lokasi.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;