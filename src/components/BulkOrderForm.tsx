/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Building2, ArrowRight, CheckCircle } from "lucide-react";
import { BulkOrderRequest } from "../types";

interface BulkOrderFormProps {
  onSubmitBulk: (request: Omit<BulkOrderRequest, "id" | "status" | "createdAt">) => void;
  bulkHistory: BulkOrderRequest[];
}

export default function BulkOrderForm({ onSubmitBulk, bulkHistory }: BulkOrderFormProps) {
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [clientType, setClientType] = useState("");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone || !email || !description || !preferredDate || !clientType) {
      alert("Please fill in all the required fields.");
      return;
    }

    onSubmitBulk({
      clientName,
      companyName,
      phone,
      email,
      clientType,
      description,
      preferredDate,
    });

    const text = encodeURIComponent(
      `🏢 *FNB BULK / INSTITUTIONAL ORDER INQUIRY* 🏢\n\n` +
      `*Client Details:*\n` +
      `- Client Name: ${clientName}\n` +
      `- Entity/Company Name: ${companyName || "N/A"}\n` +
      `- Client Type / Sector: ${clientType}\n` +
      `- Phone: ${phone}\n` +
      `- Email: ${email}\n\n` +
      `*Project Specifications:*\n` +
      `- Target Date: ${preferredDate}\n` +
      `- Project Requirements: ${description}\n\n` +
      `We require direct factory manufacturing pricing. Looking forward to discussing quotes.`
    );
    window.open(`https://wa.me/918830402066?text=${text}`, "_blank");

    setSubmitted(true);
    setClientName("");
    setCompanyName("");
    setPhone("");
    setEmail("");
    setClientType("");
    setDescription("");
    setPreferredDate("");

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      
      {/* Intro section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-800 uppercase tracking-wider">
          <Building2 className="h-4 w-4" />
          <span>B2B Manufacturing & Commercial Supply</span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Factory-Direct Institutional Furnishing
        </h1>
        <p className="text-sm font-light text-stone-500">
          We manufacture premium school benches, custom restaurant booths, luxurious hotel suites setups, and heavy-gauge panel cabinets. Delivered directly to your sites anywhere in Maharashtra.
        </p>
      </div>

      {/* Bulk Quote Form */}
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          
          {submitted && (
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold text-emerald-800">
                Bulk quote requested! Dispatching details on WhatsApp...
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-stone-900">Request a Bulk Quote</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-700"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Institution / Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-700"
                  placeholder="E.g. Sayaji Hotel, Pune"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Direct Mobile No. *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-700"
                  placeholder="E.g. 8830402066"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-700"
                  placeholder="E.g. purchase@company.com"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Selected Sector *
                </label>
                <input
                  type="text"
                  required
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-700"
                  placeholder="Enter your sector (e.g., Hotel, School, Office, Cafe)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Target completion date not compulsory *
                </label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-700"
                />
              </div>

            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Scope of Project / Material & Quantity Required *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-700"
                placeholder="Mention product name, required quantity  or material thickness..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-amber-950 hover:bg-stone-900 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow transition-colors"
            >
              <span>Submit and Consult via WhatsApp</span>
              <ArrowRight className="h-4 w-4" />
            </button>

          </form>
        </div>
      </div>

      {/* Local Bulk History logs */}
      {bulkHistory.length > 0 && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-stone-200 bg-stone-50 p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-amber-700" />
            <h3 className="font-serif text-lg font-bold text-stone-900">Institutional Inquiry Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <th className="py-2">Client</th>
                  <th className="py-2">Company/Org</th>
                  <th className="py-2">Sector</th>
                  <th className="py-2">Completion Target</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-700 font-light">
                {bulkHistory.map((req) => (
                  <tr key={req.id}>
                    <td className="py-2.5 font-semibold text-stone-900">{req.clientName}</td>
                    <td className="py-2.5">{req.companyName || "Personal"}</td>
                    <td className="py-2.5">{req.clientType}</td>
                    <td className="py-2.5">{req.preferredDate}</td>
                    <td className="py-2.5">
                      <span className="inline-block rounded px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800">
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
