import { useState } from "react";
import { CreditCard, Building2, Wallet, QrCode, Info } from "lucide-react";
import { motion } from "framer-motion";

export type PaymentMethod = "bank_transfer" | "ewallet" | "qris" | "credit_card";

interface Props {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const methods = [
  {
    id: "bank_transfer" as PaymentMethod,
    label: "Transfer Bank",
    desc: "BCA, BNI, BRI, Mandiri",
    icon: Building2,
  },
  {
    id: "ewallet" as PaymentMethod,
    label: "E-Wallet",
    desc: "GoPay, OVO, Dana, ShopeePay",
    icon: Wallet,
  },
  {
    id: "qris" as PaymentMethod,
    label: "QRIS",
    desc: "Scan QR dari aplikasi apapun",
    icon: QrCode,
  },
  {
    id: "credit_card" as PaymentMethod,
    label: "Kartu Kredit/Debit",
    desc: "Visa, Mastercard",
    icon: CreditCard,
  },
];

const PaymentMethodSelector = ({ selected, onSelect }: Props) => {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-primary" /> Metode Pembayaran
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {methods.map((m) => {
          const isSelected = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`text-left p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <m.icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium text-foreground">{m.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </button>
          );
        })}
      </div>
      <div className="flex items-start gap-2 bg-warning/10 rounded-lg p-3">
        <Info className="h-4 w-4 text-warning mt-0.5 shrink-0" />
        <p className="text-xs text-warning">
          Fitur pembayaran online sedang dalam tahap pengembangan. Saat ini booking akan diproses secara manual oleh admin.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
