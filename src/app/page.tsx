"use client";

import { useState } from "react";
import InvoiceList from "@/components/forms/tax-invoice/invoice-list";
import TaxInvoiceForm from "@/components/forms/tax-invoice";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  
  const handleCreateNew = () => {
    setShowForm(true);
  };
  
  return (
    <main className="container mx-auto py-8">
      {showForm ? (
        <TaxInvoiceForm />
      ) : (
        <InvoiceList onCreateNew={handleCreateNew} />
      )}
    </main>
  );
}