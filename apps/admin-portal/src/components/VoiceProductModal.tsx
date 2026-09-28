'use client';

import { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Languages,
  RotateCcw,
  Zap,
  Package,
  Layers,
  IndianRupee,
  Check,
  Edit3,
  Plus,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface Category {
  id: string;
  name: string;
}

interface Variant {
  weight: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface ParsedVoiceProduct {
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  imageUrl: string;
  isFeatured: boolean;
  variants: Variant[];
  source?: 'gemini' | 'rules';
}

interface VoiceProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onApplyToForm: (data: ParsedVoiceProduct) => void;
  onDirectCreate: (data: ParsedVoiceProduct) => Promise<void>;
}

const SAMPLE_VOICE_COMMANDS = [
  {
    title: 'A2 Cow Ghee (2 Sizes)',
    text: 'Add Pure A2 Desi Cow Ghee, 1 litre at 1200 rupees and 500ml at 650 rupees, stock 40 units, under Dairy category, mark as featured',
    tag: 'Dairy',
  },
  {
    title: 'Mustard Oil (Multi-Pack)',
    text: 'Add Cold Pressed Mustard Oil, 1 litre price 220 rupees stock 60, 5 litre price 1050 rupees stock 25, under Oils category',
    tag: 'Oils',
  },
  {
    title: 'Forest Raw Honey',
    text: 'Add Natural Wild Forest Honey, 500g price 450 rupees stock 35, 250g price 250 rupees stock 50, featured product',
    tag: 'Honey',
  },
  {
    title: 'Sharbati Wheat Atta',
    text: 'Add Stone Ground MP Sharbati Wheat Flour, 5kg price 320 rupees stock 80, 10kg price 600 rupees stock 40, under Grains category',
    tag: 'Flour',
  },
];

export default function VoiceProductModal({
  isOpen,
  onClose,
  categories,
  onApplyToForm,
  onDirectCreate,
}: VoiceProductModalProps) {
  const [selectedLang, setSelectedLang] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [manualTranscript, setManualTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedVoiceProduct | null>(null);
  const [directCreating, setDirectCreating] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const {
    isListening,
    fullTranscript,
    audioLevel,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    playChime,
  } = useSpeechRecognition({
    lang: selectedLang,
  });

  // Sync speech transcript with manual editable textarea
  useEffect(() => {
    if (fullTranscript) {
      setManualTranscript(fullTranscript);
    }
  }, [fullTranscript]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setManualTranscript('');
      setParsedData(null);
      setCustomError(null);
      resetTranscript();
    }
  }, [isOpen, resetTranscript]);

  if (!isOpen) return null;

  const handleParseTranscript = async (textToParse?: string) => {
    const text = (textToParse || manualTranscript).trim();
    if (!text) {
      setCustomError('Please speak or type a product description first.');
      return;
    }

    if (isListening) {
      stopListening();
    }

    setIsParsing(true);
    setCustomError(null);

    try {
      const res = await fetch('/api/ai/parse-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          categories,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setParsedData(json.data);
        playChime('success');
      } else {
        setCustomError(json.error || 'Could not parse product details. Please try again.');
      }
    } catch (err: any) {
      setCustomError(err.message || 'Failed to connect to parser.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleQuickSample = (sampleText: string) => {
    setManualTranscript(sampleText);
    handleParseTranscript(sampleText);
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    if (!parsedData) return;
    const updatedVariants = [...parsedData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setParsedData({ ...parsedData, variants: updatedVariants });
  };

  const handleAddVariantRow = () => {
    if (!parsedData) return;
    setParsedData({
      ...parsedData,
      variants: [...parsedData.variants, { weight: '500g', price: 100, stock: 30, sku: '' }],
    });
  };

  const handleRemoveVariantRow = (index: number) => {
    if (!parsedData || parsedData.variants.length <= 1) return;
    setParsedData({
      ...parsedData,
      variants: parsedData.variants.filter((_, i) => i !== index),
    });
  };

  const handleApplyToFormClick = () => {
    if (!parsedData) return;
    onApplyToForm(parsedData);
    onClose();
  };

  const handleDirectCreateClick = async () => {
    if (!parsedData) return;
    setDirectCreating(true);
    try {
      await onDirectCreate(parsedData);
      onClose();
    } catch (err: any) {
      setCustomError(err.message || 'Failed to create product.');
    } finally {
      setDirectCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Voice Product Assistant</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-400/30 rounded-full">
                  AI + NLP
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Speak naturally in English or Hindi — we extract title, category, sizes, pricing & stock.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-stone-50/50">
          {/* Language & Engine Selector */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-stone-200/80 shadow-sm text-xs">
            <div className="flex items-center gap-2 text-stone-600 font-medium pl-2">
              <Languages className="w-4 h-4 text-emerald-600" />
              <span>Voice Accent / Dialect:</span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedLang('en-IN')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  selectedLang === 'en-IN'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                🇮🇳 English (India)
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('hi-IN')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  selectedLang === 'hi-IN'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                🇮🇳 हिंदी (Hindi / Hinglish)
              </button>
            </div>
          </div>

          {/* Central Microphone & Waveform Section */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm text-center relative overflow-hidden">
            {isListening && (
              <div
                className="absolute inset-0 bg-emerald-500/10 pointer-events-none transition-all duration-300"
                style={{ opacity: 0.3 + (audioLevel / 100) * 0.7 }}
              />
            )}

            {/* Mic Button with Dynamic Pulsing Wave */}
            <div className="relative inline-flex items-center justify-center my-2">
              {isListening && (
                <>
                  <div
                    className="absolute w-28 h-28 rounded-full bg-emerald-400/20 animate-ping pointer-events-none"
                    style={{ animationDuration: '2s' }}
                  />
                  <div
                    className="absolute w-24 h-24 rounded-full bg-emerald-500/30 transition-all duration-150"
                    style={{ transform: `scale(${1 + (audioLevel / 100) * 0.5})` }}
                  />
                </>
              )}

              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={!isSupported || isParsing}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/40 ring-4 ring-rose-200 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-105'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 animate-bounce" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            {/* Status Text & Audio Bars */}
            <div className="mt-3">
              <div className="text-sm font-bold text-stone-800">
                {isListening ? (
                  <span className="text-emerald-700 flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    Listening... Speak your product details now
                  </span>
                ) : manualTranscript ? (
                  <span className="text-stone-700 font-semibold">Transcript captured — Click Process with AI below</span>
                ) : (
                  <span className="text-stone-500">Tap the mic to start speaking or click an example below</span>
                )}
              </div>

              {/* Dynamic Audio Visualizer Bars */}
              {isListening && (
                <div className="flex items-center justify-center gap-1.5 h-8 mt-3">
                  {[40, 70, 100, 60, 90, 45, 85, 30].map((heightPct, idx) => {
                    const dynamicHeight = Math.max(15, Math.min(100, (audioLevel / 100) * heightPct + 15));
                    return (
                      <div
                        key={idx}
                        className="w-1.5 bg-emerald-600 rounded-full transition-all duration-75"
                        style={{ height: `${dynamicHeight}%` }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Realtime Live Transcript Box */}
            <div className="mt-4 text-left">
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-semibold uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-stone-400" />
                  Spoken Transcript (Editable)
                </span>
                {manualTranscript && (
                  <button
                    type="button"
                    onClick={() => {
                      setManualTranscript('');
                      resetTranscript();
                      setParsedData(null);
                    }}
                    className="text-stone-400 hover:text-stone-600 flex items-center gap-1 text-[10px]"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  value={manualTranscript}
                  onChange={(e) => setManualTranscript(e.target.value)}
                  placeholder="e.g. 'Pure A2 Desi Cow Ghee, 1 litre 1200 rupees and 500ml 650 rupees stock 40 units in dairy category...'"
                  className="w-full text-xs sm:text-sm font-medium p-3.5 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-stone-50/70 text-stone-800 placeholder-stone-400 resize-none transition-all"
                />
              </div>
            </div>

            {/* Error alerts */}
            {(speechError || customError) && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{speechError || customError}</span>
              </div>
            )}

            {/* Parse Action Button */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
                💡 Tip: You can mention multiple sizes like 1kg, 500g, 1L, etc.
              </span>
              <button
                type="button"
                disabled={!manualTranscript.trim() || isParsing}
                onClick={() => handleParseTranscript()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Extracting All Details...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Process with AI / NLP
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Try Sample Prompts */}
          {!parsedData && (
            <div>
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Or Try Ready-Made Sample Voice Commands:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_VOICE_COMMANDS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickSample(sample.text)}
                    className="p-3 bg-white hover:bg-emerald-50/60 border border-stone-200/80 hover:border-emerald-300 rounded-2xl text-left transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-800 group-hover:text-emerald-800 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        {sample.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 text-stone-600 group-hover:bg-emerald-100 group-hover:text-emerald-800">
                        {sample.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">
                      &quot;{sample.text}&quot;
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Parsed Result Preview Card with Inline Editing */}
          {parsedData && (
            <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500/40 shadow-lg shadow-emerald-900/5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                      Extracted Product Details
                    </h4>
                    <span className="text-[10px] text-stone-400">
                      Processed via {parsedData.source === 'gemini' ? 'Google Gemini AI' : 'Smart Precision Engine'}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {parsedData.variants.length} Package{parsedData.variants.length > 1 ? 's' : ''} Found
                </span>
              </div>

              {/* Product Info Grid */}
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={parsedData.imageUrl}
                  alt={parsedData.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-stone-200 flex-shrink-0 shadow-sm"
                />
                <div className="flex-1 space-y-2">
                  {/* Name Input */}
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Product Title:</label>
                    <input
                      type="text"
                      value={parsedData.name}
                      onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                      className="w-full font-bold text-sm text-stone-900 px-2 py-1 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Category & Featured */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase">Category:</label>
                      <select
                        value={parsedData.categoryId}
                        onChange={(e) => {
                          const catId = e.target.value;
                          const found = categories.find((c) => c.id === catId);
                          setParsedData({
                            ...parsedData,
                            categoryId: catId,
                            categoryName: found?.name || '',
                          });
                        }}
                        className="w-full text-xs font-semibold px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-3.5">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parsedData.isFeatured}
                          onChange={(e) => setParsedData({ ...parsedData, isFeatured: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span>Featured</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase">Description:</label>
                <textarea
                  rows={2}
                  value={parsedData.description}
                  onChange={(e) => setParsedData({ ...parsedData, description: e.target.value })}
                  className="w-full text-xs text-stone-600 p-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none bg-stone-50/50"
                />
              </div>

              {/* Variants Extracted Table with Edit Controls */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    Packaging, Pricing & Stock
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Size
                  </button>
                </div>
                <div className="border border-stone-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-stone-500 text-[10px] uppercase font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-2.5">Package / Weight</th>
                        <th className="p-2.5">Price (₹)</th>
                        <th className="p-2.5">Stock Quantity</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-800">
                      {parsedData.variants.map((v, i) => (
                        <tr key={i} className="hover:bg-stone-50/50">
                          <td className="p-2">
                            <input
                              type="text"
                              value={v.weight}
                              onChange={(e) => handleVariantChange(i, 'weight', e.target.value)}
                              className="w-24 px-2 py-1 font-bold text-emerald-950 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span className="text-stone-400">₹</span>
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => handleVariantChange(i, 'price', Number(e.target.value))}
                                className="w-20 px-2 py-1 font-bold text-stone-900 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => handleVariantChange(i, 'stock', Number(e.target.value))}
                              className="w-20 px-2 py-1 text-stone-700 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="p-2 text-right">
                            {parsedData.variants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantRow(i)}
                                className="p-1 text-stone-400 hover:text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confirmation Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleApplyToFormClick}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                  Review in Full Form
                </button>
                <button
                  type="button"
                  disabled={directCreating}
                  onClick={handleDirectCreateClick}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {directCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving to Catalog...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      Instant Create Product
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
