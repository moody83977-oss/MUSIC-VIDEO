import React, { useState } from 'react';
import {
  Check,
  X,
  Sparkles,
  Shield,
  Zap,
  Flame,
  Crown,
  Smartphone,
  CreditCard,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Lock,
  Copy,
  Receipt,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onSelectPro: () => void;
}

type BillingPlan = 'weekly' | 'monthly' | 'yearly';
type PaymentMethod = 'gcash' | 'paypal' | 'maya_card';

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  isPro,
  onSelectPro,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [checkoutStep, setCheckoutStep] = useState<'plans' | 'checkout' | 'success'>('plans');

  // Checkout form state
  const [gcashNumber, setGcashNumber] = useState('0917-829-4501');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    refNumber: string;
    date: string;
    amount: string;
    method: string;
    planName: string;
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!isOpen) return null;

  const planPricing = {
    weekly: { amount: 199, label: '₱199 / linggo', name: 'Pro Artist - Weekly Pass' },
    monthly: { amount: 499, label: '₱499 / buwan', name: 'Pro Artist - Monthly Membership' },
    yearly: { amount: 3999, label: '₱3,999 / taon', name: 'Pro Artist - Annual VIP' },
  };

  const handleStartCheckout = () => {
    setCheckoutStep('checkout');
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const ref =
        paymentMethod === 'gcash'
          ? `GCASH-MP-${Math.floor(10000000 + Math.random() * 90000000)}`
          : paymentMethod === 'paypal'
          ? `PAYPAL-TX-${Math.floor(100000000 + Math.random() * 900000000)}`
          : `MAYA-${Math.floor(10000000 + Math.random() * 90000000)}`;

      const receipt = {
        refNumber: ref,
        date: new Date().toLocaleString(),
        amount: `₱${planPricing[selectedPlan].amount.toLocaleString()}`,
        method: paymentMethod === 'gcash' ? 'GCash' : paymentMethod === 'paypal' ? 'PayPal' : 'Maya / Card',
        planName: planPricing[selectedPlan].name,
      };

      setReceiptData(receipt);
      setIsProcessing(false);
      setCheckoutStep('success');
      onSelectPro();

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 1500);
  };

  const handleCopyRef = () => {
    if (receiptData) {
      navigator.clipboard.writeText(receiptData.refNumber);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setCheckoutStep('plans');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= STEP 1: PLANS OVERVIEW ================= */}
        {checkoutStep === 'plans' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Melomotion Pro Creator Plans (Philippines & International)
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Pumili ng Plan Para sa Iyong Musika
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-lg mx-auto">
                Magbayad gamit ang <strong>GCash</strong> o <strong>PayPal</strong>. Walang hassle, instant activation ng Pro features.
              </p>
            </div>

            {/* Billing Cadence Selector */}
            <div className="flex justify-center mb-6">
              <div className="p-1 bg-neutral-950 border border-neutral-800 rounded-xl inline-flex gap-1 text-xs">
                <button
                  onClick={() => setSelectedPlan('weekly')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedPlan === 'weekly'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Weekly Pass (₱199)
                </button>
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer relative ${
                    selectedPlan === 'monthly'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Monthly Pro (₱499)
                  <span className="ml-1 text-[10px] bg-amber-400 text-neutral-950 font-bold px-1.5 py-0.2 rounded-full">
                    POPULAR
                  </span>
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedPlan === 'yearly'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Annual VIP (₱3,999) -33%
                </button>
              </div>
            </div>

            {/* Pricing Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* FREE TIER (LIBRE) */}
              <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-white">Free Tier (Libre)</h3>
                    <span className="text-xs font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-800">
                      ₱0 Libre
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white mb-1">₱0</div>
                  <p className="text-xs text-neutral-400 mb-5">
                    Subukan nang libre. Walang credit card na kailangan.
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-300">
                        <strong>3 Takes bawat araw</strong> (Daily Generation Credits)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-300">
                        Haba ng video: Hanggang <strong>5 minutes</strong>
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-300">
                        Universal language auto-detection & subtitles
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-500">
                      <span className="w-4 h-4 text-center font-bold shrink-0">·</span>
                      <span>May maliit na watermark sa sulok</span>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-500">
                      <span className="w-4 h-4 text-center font-bold shrink-0">·</span>
                      <span>Standard queue (mabagal kapag maraming user)</span>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-500">
                      <span className="w-4 h-4 text-center font-bold shrink-0">·</span>
                      <span>Pang-personal use lang (Non-commercial)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-900">
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isPro ? 'You are already Pro' : 'Manatili sa Free Plan'}
                  </button>
                </div>
              </div>

              {/* PRO / PAID TIER (PHP PLAN) */}
              <div className="p-6 rounded-xl bg-gradient-to-b from-purple-950/40 via-neutral-950 to-neutral-950 border-2 border-purple-500 relative flex flex-col justify-between shadow-xl shadow-purple-950/30">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-[10px] font-bold tracking-wider uppercase">
                  RECOMMENDED FOR ARTISTS & CREATORS
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      Pro Artist (PHP Plan)
                    </h3>
                    <span className="text-xs font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40">
                      PHP Currency
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-black text-white">
                      ₱{planPricing[selectedPlan].amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {selectedPlan === 'weekly' ? '/ linggo' : selectedPlan === 'monthly' ? '/ buwan' : '/ taon'}
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/80 mb-5">
                    Commercial rights, zero watermark, at walang limitasyong takes.
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-100 font-medium">
                        <strong>Unlimited Generations</strong> (may Fair Use Policy)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-100 font-medium">
                        Up to <strong>10 - 15 minutes</strong> bawat video (Full Album Songs)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-100 font-medium">
                        <strong>HD / 4K Quality, WALANG watermark</strong>
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-100 font-medium">
                        <strong>Priority Fast Queue</strong> (mabilis mag-render)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-100 font-medium">
                        <strong>Commercial Use / Puwedeng gamitin pampatubo</strong> (YouTube Monetization, Spotify Canvas, TikTok Ads)
                      </span>
                    </div>
                  </div>

                  {/* Payment Badges (GCash & PayPal) */}
                  <div className="mt-4 pt-3 border-t border-purple-900/40 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Tinatanggap na Pagbabayad:</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 font-semibold border border-blue-500/30">
                        GCash
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-900/40 text-sky-300 font-semibold border border-sky-500/30">
                        PayPal
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <button
                    onClick={handleStartCheckout}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Mag-upgrade Ngayon ({planPricing[selectedPlan].label})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Comparison Table */}
            <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                    <th className="py-2 pr-4">Feature</th>
                    <th className="py-2 px-4">Free Tier (Libre)</th>
                    <th className="py-2 pl-4 text-purple-300">Pro / Paid Tier (PHP Plan)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-neutral-200">Daily Limit / Takes</td>
                    <td className="py-2.5 px-4 font-mono">3 Takes bawat araw</td>
                    <td className="py-2.5 pl-4 font-semibold text-purple-300">Unlimited Generations (Fair Use)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-neutral-200">Video Length</td>
                    <td className="py-2.5 px-4">5 minutes</td>
                    <td className="py-2.5 pl-4 font-semibold text-purple-300">Up to 10 - 15 minutes per video</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-neutral-200">Quality / Watermark</td>
                    <td className="py-2.5 px-4 text-neutral-400">May maliit na watermark</td>
                    <td className="py-2.5 pl-4 font-semibold text-emerald-400">HD / 4K Quality, WALANG watermark</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-neutral-200">Generation Speed</td>
                    <td className="py-2.5 px-4 text-neutral-400">Standard queue (mabagal)</td>
                    <td className="py-2.5 pl-4 font-semibold text-cyan-300">Priority Fast Queue (mabilis mag-render)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-neutral-200">Mani-monetize</td>
                    <td className="py-2.5 px-4 text-neutral-400">Pang-personal use lang</td>
                    <td className="py-2.5 pl-4 font-semibold text-emerald-400">Commercial Use / Puwedeng gamitin pampatubo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CHECKOUT MODAL (GCASH & PAYPAL) ================= */}
        {checkoutStep === 'checkout' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <button
                  onClick={() => setCheckoutStep('plans')}
                  className="text-xs text-purple-400 hover:text-purple-300 mb-1 flex items-center gap-1 cursor-pointer"
                >
                  ← Bumalik sa mga Plano
                </button>
                <h3 className="text-xl font-bold text-white">Payment Method / Paraan ng Pagbabayad</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-400">Kabuuang Halaga:</span>
                <div className="text-xl font-bold text-emerald-400">
                  ₱{planPricing[selectedPlan].amount.toLocaleString()} PHP
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-3">
              {/* GCash Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('gcash')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  paymentMethod === 'gcash'
                    ? 'border-blue-500 bg-blue-950/40 text-white ring-1 ring-blue-500/50'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                    G
                  </div>
                  {paymentMethod === 'gcash' && (
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  )}
                </div>
                <div className="text-xs font-bold text-white">GCash</div>
                <div className="text-[10px] text-neutral-400">InstaPay / QR / Number</div>
              </button>

              {/* PayPal Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  paymentMethod === 'paypal'
                    ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/50'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white text-xs">
                    P
                  </div>
                  {paymentMethod === 'paypal' && (
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  )}
                </div>
                <div className="text-xs font-bold text-white">PayPal</div>
                <div className="text-[10px] text-neutral-400">USD / PHP International</div>
              </button>

              {/* Maya / Cards Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('maya_card')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  paymentMethod === 'maya_card'
                    ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500/50'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                    M
                  </div>
                  {paymentMethod === 'maya_card' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </div>
                <div className="text-xs font-bold text-white">Maya / Card</div>
                <div className="text-[10px] text-neutral-400">Debit / Credit Card</div>
              </button>
            </div>

            {/* GCASH PAYMENT DETAILS */}
            {paymentMethod === 'gcash' && (
              <div className="p-5 rounded-xl bg-neutral-950 border border-blue-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">GCash Direct Checkout</h4>
                  </div>
                  <span className="text-[11px] font-mono text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
                    GCash Verified Merchant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GCash QR Code Box */}
                  <div className="p-4 bg-neutral-900/90 rounded-lg border border-neutral-800 text-center flex flex-col items-center justify-center">
                    <div className="w-32 h-32 bg-white p-2 rounded-lg flex items-center justify-center mb-2 shadow-md">
                      <div className="w-full h-full border-2 border-dashed border-blue-600 flex flex-col items-center justify-center text-neutral-900">
                        <QrCode className="w-16 h-16 text-blue-600 mb-1" />
                        <span className="text-[9px] font-mono font-bold">SCAN WITH GCASH</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-neutral-300">
                      I-scan gamit ang GCash App
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Merchant: MELOMOTION AI PH
                    </span>
                  </div>

                  {/* GCash Phone Number Input */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Numero ng GCash (Mobile Number):
                      </label>
                      <input
                        type="text"
                        value={gcashNumber}
                        onChange={(e) => setGcashNumber(e.target.value)}
                        placeholder="09XX-XXX-XXXX"
                        className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                      />
                      <span className="text-[11px] text-neutral-400 block mt-1">
                        Makatatanggap ka ng SMS prompt at Reference Code.
                      </span>
                    </div>

                    <div className="p-3 bg-blue-950/30 rounded-lg border border-blue-500/20 text-[11px] text-blue-200 space-y-1">
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <strong className="text-white">{planPricing[selectedPlan].name}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Halaga:</span>
                        <strong className="text-emerald-400">
                          ₱{planPricing[selectedPlan].amount.toLocaleString()} PHP
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAYPAL PAYMENT DETAILS */}
            {paymentMethod === 'paypal' && (
              <div className="p-5 rounded-xl bg-neutral-950 border border-sky-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sky-400 text-sm">PayPal</span>
                    <h4 className="text-sm font-bold text-white">Express Checkout</h4>
                  </div>
                  <span className="text-[11px] font-mono text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-500/30">
                    Worldwide / All Currencies
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      PayPal Account Email:
                    </label>
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="your-email@example.com"
                      className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-sky-950/30 rounded-lg border border-sky-500/20 text-[11px] text-sky-200 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">
                        {planPricing[selectedPlan].name}
                      </div>
                      <div className="text-neutral-400">
                        ₱{planPricing[selectedPlan].amount.toLocaleString()} PHP (approx. $
                        {(planPricing[selectedPlan].amount / 56).toFixed(2)} USD)
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">
                      ₱{planPricing[selectedPlan].amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* MAYA / CARD DETAILS */}
            {paymentMethod === 'maya_card' && (
              <div className="p-5 rounded-xl bg-neutral-950 border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Maya / Debit & Credit Card</h4>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    Visa / Mastercard / Maya
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="text-neutral-400 block mb-1">Card Number / Maya Number:</label>
                    <input
                      type="text"
                      defaultValue="4532 •••• •••• 8912"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Expiry:</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">CVV:</label>
                    <input
                      type="password"
                      defaultValue="891"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Guarantee & Action */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                256-bit Encrypted Secure Gateway
              </span>

              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all cursor-pointer flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-white" />
                    <span>Pinoproseso ang Bayad...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {paymentMethod === 'gcash'
                        ? `Magbayad sa GCash (₱${planPricing[selectedPlan].amount.toLocaleString()})`
                        : paymentMethod === 'paypal'
                        ? `Magbayad sa PayPal (₱${planPricing[selectedPlan].amount.toLocaleString()})`
                        : `Kumpirmahin ang Bayad (₱${planPricing[selectedPlan].amount.toLocaleString()})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PAYMENT SUCCESS & DIGITAL RECEIPT ================= */}
        {checkoutStep === 'success' && receiptData && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-950">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Matagumpay ang Pagbabayad!
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Aktibo na ang iyong <strong>Pro Artist Plan</strong>. Tanggal na ang lahat ng watermark at unlimited na ang iyong takes!
              </p>
            </div>

            {/* Official Digital Receipt Box */}
            <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 text-left text-xs max-w-md mx-auto space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400 flex items-center gap-1.5 font-sans">
                  <Receipt className="w-4 h-4 text-purple-400" />
                  Official Digital Receipt
                </span>
                <span className="text-emerald-400 font-bold font-sans">PAID</span>
              </div>

              <div className="space-y-1.5 text-neutral-300 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Plan:</span>
                  <span className="font-semibold text-white">{receiptData.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Halaga:</span>
                  <span className="font-bold text-emerald-400">{receiptData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Paraan:</span>
                  <span className="text-white">{receiptData.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Petsa:</span>
                  <span className="text-neutral-400">{receiptData.date}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-neutral-900">
                  <span className="text-neutral-500">Ref No:</span>
                  <button
                    onClick={handleCopyRef}
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    <span>{receiptData.refNumber}</span>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                {copiedRef && (
                  <div className="text-right text-[10px] text-emerald-400">
                    Kopya na sa clipboard!
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
              >
                Magsimulang Gumawa ng Music Video Ngayon
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
