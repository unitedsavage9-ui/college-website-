import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Check, AlertCircle, FileText, Download, ShieldCheck, QrCode, Building, ArrowRight, Loader2 } from 'lucide-react';
import { FeeItem, Student } from '../types';

interface FeesTabProps {
  student: Student;
  fees: FeeItem[];
  onPayFee: (feeId: string, transactionId: string) => void;
}

export default function FeesTab({
  student,
  fees,
  onPayFee,
}: FeesTabProps) {
  const [selectedFeeToPay, setSelectedFeeToPay] = useState<FeeItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [receiptFee, setReceiptFee] = useState<FeeItem | null>(null);

  // Form Fields
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const pendingFees = fees.filter((f) => f.status !== 'paid');
  const paidFees = fees.filter((f) => f.status === 'paid');

  const handleOpenPayment = (fee: FeeItem) => {
    setSelectedFeeToPay(fee);
    setPaymentCompleted(false);
    setIsProcessing(false);
  };

  const handleCardNumberChange = (val: string) => {
    const sanitized = val.replace(/\D/g, '');
    const formatted = sanitized.match(/.{1,4}/g)?.join(' ') || sanitized;
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpiryChange = (val: string) => {
    const sanitized = val.replace(/\D/g, '');
    if (sanitized.length <= 2) {
      setCardExpiry(sanitized);
    } else {
      setCardExpiry(`${sanitized.slice(0, 2)}/${sanitized.slice(2, 4)}`);
    }
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeToPay) return;

    setIsProcessing(true);

    // Simulate network latency
    setTimeout(() => {
      const generatedTxnId = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;
      onPayFee(selectedFeeToPay.id, generatedTxnId);
      
      const updatedFee = {
        ...selectedFeeToPay,
        status: 'paid' as const,
        transactionId: generatedTxnId,
        paymentDate: new Date().toISOString().split('T')[0],
      };

      setReceiptFee(updatedFee);
      setIsProcessing(false);
      setPaymentCompleted(true);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20"
    >
      {/* Fees Summary Hero Card */}
      <section className="glass-card p-6 rounded-2xl shadow-md border-t-4 border-error/75 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-error/5 flex items-center justify-center text-error">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-gray uppercase tracking-wider">Total Outstanding Dues</span>
            <h3 className="font-serif text-3xl font-bold text-oxford-navy">₹{student.feesDue}</h3>
            <p className="text-xs text-slate-gray font-medium">B.Sc Physics, Semester IV</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-center sm:text-right w-full sm:w-auto">
          <span className="text-[10px] font-bold text-slate-gray uppercase">Payment Status</span>
          <span className={`font-serif text-lg font-bold ${student.feesDue > 0 ? 'text-error' : 'text-green-600'}`}>
            {student.feesDue > 0 ? 'Dues Outstanding' : 'All Clear / Paid'}
          </span>
          <p className="text-[10px] text-slate-gray font-medium">Accumulated history: ₹{student.feesPaid} Paid</p>
        </div>
      </section>

      {/* Outstanding Fees Section */}
      <section className="space-y-3">
        <h3 className="font-serif text-xl font-bold text-oxford-navy px-1">Unpaid Dues & Invoices</h3>
        {pendingFees.length === 0 ? (
          <div className="glass-card p-6 rounded-xl text-center space-y-2 border border-dashed border-outline-variant/40">
            <ShieldCheck className="w-10 h-10 text-green-600 mx-auto" />
            <h4 className="font-sans font-semibold text-oxford-navy text-sm">No Pending Fees Due!</h4>
            <p className="text-xs text-slate-gray">You have paid all current invoices. Keep up the great standing!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingFees.map((fee) => (
              <div key={fee.id} className="glass-card p-4 rounded-xl shadow-sm flex justify-between items-center border border-outline-variant/20 hover:border-error/30 transition-all">
                <div>
                  <span className="text-[10px] font-bold font-sans bg-error-container/20 text-error px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Due: {fee.dueDate}
                  </span>
                  <h4 className="font-sans text-sm md:text-base font-semibold text-oxford-navy mt-1.5">
                    {fee.title}
                  </h4>
                  <p className="text-xs text-slate-gray">{fee.category} Fee Category</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="font-serif text-lg font-bold text-error">
                    ₹{fee.amount}
                  </span>
                  <button
                    onClick={() => handleOpenPayment(fee)}
                    className="px-3 py-1.5 text-xs font-bold bg-oxford-navy text-white hover:bg-oxford-navy/95 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                    id={`pay-now-btn-${fee.id}`}
                  >
                    Pay Now
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Payment History List */}
      <section className="space-y-3">
        <h3 className="font-serif text-xl font-bold text-oxford-navy px-1">Payment History Ledger</h3>
        <div className="space-y-3">
          {paidFees.map((fee) => (
            <div key={fee.id} className="glass-card p-4 rounded-xl shadow-sm flex justify-between items-center border border-outline-variant/20 hover:border-prestige-gold/30 transition-all">
              <div>
                <span className="text-[10px] font-bold font-sans bg-green-50 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit">
                  <Check className="w-3 h-3" /> Paid on {fee.paymentDate}
                </span>
                <h4 className="font-sans text-sm md:text-base font-semibold text-oxford-navy mt-1.5">
                  {fee.title}
                </h4>
                <p className="text-xs text-slate-gray font-mono">Txn ID: {fee.transactionId}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className="font-serif text-base font-bold text-oxford-navy">
                  ₹{fee.amount}
                </span>
                <button
                  onClick={() => {
                    setReceiptFee(fee);
                    setPaymentCompleted(true);
                    setSelectedFeeToPay(null);
                  }}
                  className="p-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-slate-gray hover:text-oxford-navy transition-colors cursor-pointer"
                  title="View Receipt"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Payment Checkout / Receipt Modal */}
      <AnimatePresence>
        {(selectedFeeToPay || paymentCompleted) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedFeeToPay(null);
                setPaymentCompleted(false);
              }}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[85vh]"
            >
              {paymentCompleted ? (
                /* === SUCCESSFUL RECEIPT VIEW === */
                <div className="flex flex-col h-full overflow-y-auto">
                  <div className="bg-green-600 text-white p-6 text-center shrink-0">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-serif text-xl font-bold">Payment Successful</h3>
                    <p className="text-xs text-white/80 mt-1">Transaction Completed on {receiptFee?.paymentDate}</p>
                  </div>

                  <div className="p-6 space-y-4 flex-1">
                    <div className="text-center pb-4 border-b border-outline-variant/20">
                      <span className="text-[10px] font-bold text-slate-gray uppercase">Receipt For</span>
                      <h4 className="font-serif text-lg font-bold text-oxford-navy mt-1">{receiptFee?.title}</h4>
                      <p className="text-xs text-slate-gray font-mono mt-1">Receipt Ref: REC-{Math.floor(10000000 + Math.random() * 90000000)}</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-gray font-medium">Paid To:</span>
                        <span className="text-oxford-navy font-semibold">Dhemaji College, Assam</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-gray font-medium">Candidate Name:</span>
                        <span className="text-oxford-navy font-semibold">{student.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-gray font-medium">Candidate Roll ID:</span>
                        <span className="text-oxford-navy font-mono font-medium">{student.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-gray font-medium">Transaction ID:</span>
                        <span className="text-oxford-navy font-mono text-xs">{receiptFee?.transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-gray font-medium">Fee Category:</span>
                        <span className="text-oxford-navy font-medium">{receiptFee?.category}</span>
                      </div>
                      <div className="h-px bg-outline-variant/30 my-2" />
                      <div className="flex justify-between font-bold text-base">
                        <span className="text-oxford-navy">Amount Paid:</span>
                        <span className="text-green-600">₹{receiptFee?.amount}</span>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-center text-xs text-slate-gray gap-1 bg-surface-container rounded-xl p-3 items-center">
                      <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                      <span>This is an official computer-generated receipt. No signature required.</span>
                    </div>
                  </div>

                  <div className="p-4 bg-surface-container border-t border-outline-variant/30 flex justify-end gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setPaymentCompleted(false);
                        setReceiptFee(null);
                      }}
                      className="w-full py-2.5 bg-oxford-navy hover:bg-oxford-navy/95 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer text-center"
                    >
                      Done / Back to Ledger
                    </button>
                  </div>
                </div>
              ) : (
                /* === DYNAMIC CHECKOUT FORM === */
                <form onSubmit={handleCompletePayment} className="flex flex-col h-full overflow-y-auto">
                  <div className="bg-oxford-navy text-white p-5 shrink-0 flex justify-between items-center">
                    <div>
                      <h3 className="font-serif text-lg font-bold">Portal Payment</h3>
                      <p className="text-xs text-white/70">Secure SBI Academic Gateway</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFeeToPay(null)}
                      className="p-1 hover:bg-white/10 rounded-lg text-white"
                    >
                      <Check className="w-5 h-5 rotate-45" />
                    </button>
                  </div>

                  {/* Summary row */}
                  <div className="bg-surface-container p-4 border-b border-outline-variant/20 flex justify-between items-center shrink-0">
                    <div>
                      <span className="text-[10px] font-bold text-slate-gray uppercase">Paying Invoice</span>
                      <h4 className="text-sm font-bold text-oxford-navy truncate max-w-56">{selectedFeeToPay?.title}</h4>
                    </div>
                    <span className="font-serif text-base font-bold text-oxford-navy">₹{selectedFeeToPay?.amount}</span>
                  </div>

                  <div className="p-5 space-y-4 flex-1">
                    {/* Payment methods selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-gray uppercase mb-2">
                        Select Payment Method
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            paymentMethod === 'card'
                              ? 'bg-oxford-navy text-white border-oxford-navy shadow-sm'
                              : 'bg-white text-on-surface border-outline-variant/40 hover:bg-surface-container'
                          }`}
                        >
                          Credit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            paymentMethod === 'upi'
                              ? 'bg-oxford-navy text-white border-oxford-navy shadow-sm'
                              : 'bg-white text-on-surface border-outline-variant/40 hover:bg-surface-container'
                          }`}
                        >
                          UPI (Scan)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('netbanking')}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            paymentMethod === 'netbanking'
                              ? 'bg-oxford-navy text-white border-oxford-navy shadow-sm'
                              : 'bg-white text-on-surface border-outline-variant/40 hover:bg-surface-container'
                          }`}
                        >
                          Net Banking
                        </button>
                      </div>
                    </div>

                    {/* Card payment layout */}
                    {paymentMethod === 'card' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-gray uppercase mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Rahul Sharma"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full text-sm bg-surface-container-low border border-outline-variant/40 rounded-xl p-2.5 outline-none focus:border-prestige-gold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-gray uppercase mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="4532 9841 2309 8842"
                            value={cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            className="w-full text-sm bg-surface-container-low border border-outline-variant/40 rounded-xl p-2.5 outline-none focus:border-prestige-gold font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-gray uppercase mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => handleExpiryChange(e.target.value)}
                              className="w-full text-sm bg-surface-container-low border border-outline-variant/40 rounded-xl p-2.5 outline-none focus:border-prestige-gold font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-gray uppercase mb-1">
                              CVV Code
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="•••"
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              className="w-full text-sm bg-surface-container-low border border-outline-variant/40 rounded-xl p-2.5 outline-none focus:border-prestige-gold font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UPI Scan Layout */}
                    {paymentMethod === 'upi' && (
                      <div className="flex flex-col items-center py-2 space-y-3 text-center">
                        <QrCode className="w-32 h-32 text-oxford-navy bg-surface-container p-3 rounded-2xl" />
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-gray bg-surface-container-high px-2 py-1 rounded-full">
                            upi://dhemajicollege@sbi
                          </span>
                          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                            Scan the secure merchant QR code above using any UPI App (GPay, PhonePe, Paytm). After scanning, you can click "Complete Payment" below to complete simulation.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Net Banking layout */}
                    {paymentMethod === 'netbanking' && (
                      <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-slate-gray uppercase mb-1">
                          Select Banking Institute
                        </label>
                        <select className="w-full text-sm bg-surface-container-low border border-outline-variant/40 rounded-xl p-2.5 text-oxford-navy font-medium outline-none focus:border-prestige-gold cursor-pointer">
                          <option>State Bank of India (SBI)</option>
                          <option>Punjab National Bank (PNB)</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Assam Gramin Vikash Bank</option>
                        </select>
                        <p className="text-xs text-slate-gray pt-1">
                          You will be redirected to the secure portal of your selected bank after clicking.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-surface-container border-t border-outline-variant/30 flex justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedFeeToPay(null)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 py-2.5 bg-oxford-navy hover:bg-oxford-navy/95 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      id="submit-payment-btn"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          Processing Security...
                        </>
                      ) : (
                        `Authorize Payment (₹${selectedFeeToPay?.amount})`
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
