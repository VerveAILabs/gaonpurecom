import { NextRequest, NextResponse } from 'next/server';

interface CategoryItem {
  id: string;
  name: string;
}

interface ParsedVariant {
  weight: string;
  price: number;
  stock: number;
  sku: string;
}

interface ParsedProductResponse {
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  imageUrl: string;
  isFeatured: boolean;
  variants: ParsedVariant[];
  source: 'gemini' | 'rules';
}

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
  half: 0.5, quarter: 0.25,
  shunya: 0, ek: 1, do: 2, teen: 3, char: 4, paanch: 5, panch: 5, che: 6, saat: 7, aath: 8, nau: 9,
  das: 10, gyarah: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16, satrah: 17,
  atharah: 18, unnis: 19, bees: 20, tees: 30, chalis: 40, pachas: 50, saath: 60, sattar: 70,
  assi: 80, nabbe: 90, sau: 100, hazaar: 1000, aadha: 0.5, paav: 0.25, sava: 1.25, dedh: 1.5, dhai: 2.5
};

const CATEGORY_MAP = [
  { key: 'oils', words: ['oil', 'tel', 'mustard', 'sarson', 'groundnut', 'mungfali', 'sesame', 'til', 'coconut', 'nariyal', 'kachi ghani', 'cold pressed', 'edible oil'] },
  { key: 'dairy', words: ['ghee', 'butter', 'milk', 'doodh', 'makhan', 'paneer', 'curd', 'dahi', 'dairy', 'a2 cow', 'desi ghee', 'bilona'] },
  { key: 'honey', words: ['honey', 'madhu', 'shehad', 'shahad', 'raw honey', 'forest honey'] },
  { key: 'grains', words: ['atta', 'aata', 'flour', 'wheat', 'gehu', 'rice', 'chawal', 'grain', 'grains', 'millet', 'bajra', 'jowar', 'ragi', 'sharbati'] },
  { key: 'pulses', words: ['dal', 'daal', 'pulse', 'pulses', 'chana', 'moong', 'toor', 'urad', 'masoor', 'besan', 'rajma', 'chole'] },
  { key: 'spices', words: ['spice', 'spices', 'masala', 'haldi', 'turmeric', 'mirch', 'chilli', 'dhaniya', 'coriander', 'jeera', 'cumin', 'hing', 'garam masala', 'clove', 'laung'] },
  { key: 'sweeteners', words: ['jaggery', 'gud', 'gur', 'sugar', 'shakkar', 'khandsari', 'bura'] },
];

const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  ghee: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop',
  oil: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop',
  mustard: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop',
  honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop',
  flour: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop',
  atta: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop',
  wheat: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop',
  dal: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
  pulses: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
  spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop',
  masala: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop',
  turmeric: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop',
  jaggery: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop',
};

function pickSuggestedImage(title: string, category: string): string {
  const combined = `${title} ${category}`.toLowerCase();
  for (const [key, url] of Object.entries(DEFAULT_PRODUCT_IMAGES)) {
    if (combined.includes(key)) return url;
  }
  return DEFAULT_PRODUCT_IMAGES.default;
}

function generateDescriptiveText(name: string, category: string): string {
  const lower = `${name} ${category}`.toLowerCase();
  if (lower.includes('ghee')) {
    return `Traditional Vedic bilona churned pure Desi Cow Ghee with rich aroma, golden granular texture, and authentic natural nutrition.`;
  }
  if (lower.includes('mustard') || lower.includes('sarson') || lower.includes('oil') || lower.includes('tel')) {
    return `Wood-pressed authentic Kachi Ghani edible oil extracted naturally at low temperatures without chemical processing or additives.`;
  }
  if (lower.includes('honey') || lower.includes('madhu') || lower.includes('shehad')) {
    return `100% pure raw unprocessed forest honey harvested naturally from wild apiaries, preserving essential active enzymes and natural pollen.`;
  }
  if (lower.includes('atta') || lower.includes('flour') || lower.includes('wheat') || lower.includes('sharbati')) {
    return `Stone-ground slow milled whole grain flour retaining natural dietary fiber, bran, and essential micro-nutrients for soft rotis.`;
  }
  if (lower.includes('jaggery') || lower.includes('gud') || lower.includes('gur')) {
    return `Chemical-free naturally clarified organic jaggery prepared using traditional sugarcane boiling methods rich in iron and minerals.`;
  }
  if (lower.includes('haldi') || lower.includes('turmeric') || lower.includes('spice') || lower.includes('masala')) {
    return `High-potency farm fresh spices ground without extracting natural essential oils, delivering robust aroma, rich color and pure taste.`;
  }
  return `Authentic, 100% natural ${name} directly sourced from certified village farmers and prepared using traditional methods.`;
}

function normalizeTranscript(raw: string): string {
  let text = raw;

  // Normalize fractions & words
  text = text.replace(/\b(aadha|half|1\/2)\s*(kg|kilo|litre|liter|l)\b/gi, '500g');
  text = text.replace(/\b(paav|quarter|1\/4)\s*(kg|kilo|litre|liter|l)\b/gi, '250g');
  text = text.replace(/\b(dedh|1\.5|1 1\/2)\s*(kg|kilo|litre|liter|l)\b/gi, '1.5kg');
  text = text.replace(/\b(dhai|2\.5|2 1\/2)\s*(kg|kilo|litre|liter|l)\b/gi, '2.5kg');

  for (const [word, num] of Object.entries(NUMBER_WORDS)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    text = text.replace(regex, num.toString());
  }

  // Normalize units
  text = text.replace(/\b(kilos|kilo|kgs)\b/gi, 'kg');
  text = text.replace(/\b(litres|liters|liter|litre|ltrs|ltr)\b/gi, 'L');
  text = text.replace(/\b(grams|gram|gms|gm)\b/gi, 'g');
  text = text.replace(/\b(milliliters|millilitre|milliliter|mls)\b/gi, 'ml');
  text = text.replace(/\b(packets|pack|packet|packs|bottles|bottle|jars|jar|dabba|dabbas)\b/gi, 'pack');

  // Normalize currency words
  text = text.replace(/\b(rupaye|rupayee|rupees|rupee|rupya|inr|rs\.|rs)\b/gi, '₹');

  return text;
}

// Deterministic Tokenizer-Based Voice Engine
function parseVoiceWithRules(transcript: string, categories: CategoryItem[]): ParsedProductResponse {
  const normalized = normalizeTranscript(transcript);
  const lower = normalized.toLowerCase();

  // 1. Featured Check
  const isFeatured = /\b(featured|special|star|top product|highlight|best seller|khas)\b/i.test(lower);

  // 2. Extract Stock / Quantity
  let defaultStock = 50;
  const stockMatch = lower.match(/\b(?:stock|quantity|qty|units|pieces|total)\s*(?:is|of|:|=|me|hai)?\s*(\d+)\b/i) ||
                     lower.match(/\b(\d+)\s*(?:units|pieces|packets|bottles|stock|dabba)\b/i);
  if (stockMatch) {
    defaultStock = parseInt(stockMatch[1], 10) || 50;
  }

  // 3. Multi-Variant Scanner using Token Positions
  const weightRegex = /\b(\d+(?:\.\d+)?\s*(?:kg|g|L|ml|pack))\b/gi;
  const weightTokens: { weight: string; index: number; length: number }[] = [];
  let wMatch;
  while ((wMatch = weightRegex.exec(normalized)) !== null) {
    weightTokens.push({
      weight: wMatch[1].replace(/\s+/g, ''),
      index: wMatch.index,
      length: wMatch[0].length,
    });
  }

  const variants: ParsedVariant[] = [];

  if (weightTokens.length > 0) {
    for (let i = 0; i < weightTokens.length; i++) {
      const curr = weightTokens[i];
      const next = weightTokens[i + 1];

      const chunkStart = curr.index + curr.length;
      const chunkEnd = next ? next.index : normalized.length;
      const chunk = normalized.substring(chunkStart, chunkEnd);

      let price = 0;
      const preCurrencyMatch = chunk.match(/\b(\d+)\s*(?:₹|rupees|rupaye|rs|inr)\b/i);
      if (preCurrencyMatch) {
        price = parseInt(preCurrencyMatch[1], 10);
      } else {
        const postCurrencyMatch = chunk.match(/\b(?:₹|price|rate|cost|for|at|is|daam|ke)\s*₹?\s*(\d+)\b/i) ||
                                  chunk.match(/₹\s*(\d+)\b/i);
        if (postCurrencyMatch) {
          price = parseInt(postCurrencyMatch[1], 10);
        } else {
          const standaloneNumMatch = chunk.match(/\b(?<![a-zA-Z])(\d{2,5})(?![a-zA-Z])\b/);
          if (standaloneNumMatch) {
            price = parseInt(standaloneNumMatch[1], 10);
          }
        }
      }

      if (price <= 0) price = 100;

      let variantStock = defaultStock;
      const varStockMatch = chunk.match(/\b(?:stock|quantity|qty|units)\s*(?:is|of|:|=|me)?\s*(\d+)\b/i);
      if (varStockMatch) {
        variantStock = parseInt(varStockMatch[1], 10);
      }

      if (!variants.some((v) => v.weight.toLowerCase() === curr.weight.toLowerCase())) {
        variants.push({
          weight: curr.weight,
          price,
          stock: variantStock,
          sku: '',
        });
      }
    }
  } else {
    const priceMatch = normalized.match(/\b(\d+)\s*(?:₹|rupees|rupaye|rs|inr)\b/i) ||
                       normalized.match(/\b(?:₹|price|rate|cost|rupees|rs|daam)\s*(\d+)\b/i) ||
                       normalized.match(/\b(?<![a-zA-Z])(\d{2,5})(?![a-zA-Z])\b/);
    const p = priceMatch ? parseInt(priceMatch[1], 10) : 150;
    variants.push({
      weight: '1kg',
      price: p,
      stock: defaultStock,
      sku: '',
    });
  }

  // 4. Intelligent Category Resolver
  let matchedCategoryId = categories[0]?.id || '';
  let matchedCategoryName = categories[0]?.name || '';

  for (const cat of categories) {
    const cName = cat.name.toLowerCase();
    if (lower.includes(cName)) {
      matchedCategoryId = cat.id;
      matchedCategoryName = cat.name;
      break;
    }
  }

  if (!matchedCategoryName || matchedCategoryId === categories[0]?.id) {
    for (const mapping of CATEGORY_MAP) {
      if (mapping.words.some((w) => {
        const wordRegex = new RegExp(`\\b${w}\\b`, 'i');
        return wordRegex.test(lower);
      })) {
        const found = categories.find((c) => {
          const cLower = c.name.toLowerCase();
          return cLower.includes(mapping.key) || mapping.words.some((w) => cLower.includes(w));
        });
        if (found) {
          matchedCategoryId = found.id;
          matchedCategoryName = found.name;
          break;
        }
      }
    }
  }

  // 5. Clean Product Title
  let cleanName = transcript;
  cleanName = cleanName.replace(/^(add|create|new|please add|insert|banao|daal do|add karo)\s+/i, '');
  cleanName = cleanName.replace(/(?:under|in|category|into|ke andar)\s+[a-zA-Z0-9\s_-]+(?:category|me|daal do)?/gi, ' ');
  cleanName = cleanName.replace(/\b(mark as featured|featured product|featured|special product)\b/gi, ' ');
  cleanName = cleanName.replace(/\b\d+(?:\.\d+)?\s*(?:kg|kilo|kilos|gm|g|gram|grams|litre|liter|litres|liters|ltr|ltrs|l|ml|packet|pack|box|pcs|pieces)\b/gi, ' ');
  cleanName = cleanName.replace(/\b(?:at|price|rate|cost|for|is|of|₹|rupees|rupaye|rs|inr|stock|quantity|qty|units|pieces|bottles|packets|aur|and|with|me|hai|daal do|karo)\b/gi, ' ');
  cleanName = cleanName.replace(/\b(?<![a-zA-Z])\d+(?![a-zA-Z])\b/g, ' ');
  cleanName = cleanName.replace(/[,;:\-_]/g, ' ').replace(/\s+/g, ' ').trim();

  if (!cleanName || cleanName.length < 2) {
    cleanName = 'Pure Village Food Item';
  }

  cleanName = cleanName
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const imageUrl = pickSuggestedImage(cleanName, matchedCategoryName);
  const description = generateDescriptiveText(cleanName, matchedCategoryName);

  return {
    name: cleanName,
    description,
    categoryId: matchedCategoryId,
    categoryName: matchedCategoryName,
    imageUrl,
    isFeatured,
    variants,
    source: 'rules',
  };
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, categories = [] } = await req.json();

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return NextResponse.json(
        { success: false, error: 'Voice transcript is required.' },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // If no Gemini API key is configured, use the high-precision tokenizer NLP engine
    if (!apiKey) {
      const parsed = parseVoiceWithRules(transcript, categories);
      return NextResponse.json({ success: true, data: parsed });
    }

    // Call Google Gemini API (2.0 Flash / 1.5 Flash)
    const categoryPromptList = (categories as CategoryItem[])
      .map((c) => `- ID: "${c.id}", Name: "${c.name}"`)
      .join('\n');

    const prompt = `You are an expert e-commerce catalog assistant for "Gaon Pure", an online store selling authentic village, farm-fresh & organic grocery products in India.
The admin has spoken a voice command to add a product.

ADMIN TRANSCRIPT:
"""${transcript}"""

EXISTING STORE CATEGORIES:
${categoryPromptList || 'None provided'}

Extract and structure the product into strict JSON. Follow these rules:
1. "name": Clean, professional, capitalized product title (e.g. "Pure A2 Desi Cow Ghee", "Cold Pressed Mustard Oil"). DO NOT include quantities, prices, or command words in the title.
2. "description": A concise, appealing 2-sentence product description highlighting purity, natural sourcing, and village quality.
3. "categoryId": Pick the best matching category ID from the list above. If none match, return empty string "".
4. "isFeatured": Set to true if words like "featured", "top product", "special", "star" are mentioned, else false.
5. "variants": Array of all variant packages extracted from the voice (e.g. weight like "500g", "1kg", "1L", "5L", price as positive number in INR, stock as integer number). If multiple weights are spoken (e.g. "1kg for 1200 and 500ml for 650"), create a variant for each.
6. "suggestedImageKeyword": A single lowercase keyword for image lookup (e.g. "ghee", "oil", "honey", "flour", "rice", "dal", "spices", "jaggery", "dairy").

Output ONLY valid JSON adhering to this exact format:
{
  "name": "string",
  "description": "string",
  "categoryId": "string",
  "isFeatured": boolean,
  "suggestedImageKeyword": "string",
  "variants": [
    {
      "weight": "string",
      "price": number,
      "stock": number,
      "sku": "string"
    }
  ]
}`;

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      if (!geminiRes.ok) {
        console.warn('Gemini API returned non-200 status, using robust rules parser');
        const fallback = parseVoiceWithRules(transcript, categories);
        return NextResponse.json({ success: true, data: fallback });
      }

      const geminiJson = await geminiRes.json();
      const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        const fallback = parseVoiceWithRules(transcript, categories);
        return NextResponse.json({ success: true, data: fallback });
      }

      const parsedGemini = JSON.parse(rawText);

      // Resolve category
      let finalCategoryId = parsedGemini.categoryId;
      if (!finalCategoryId || !categories.some((c: CategoryItem) => c.id === finalCategoryId)) {
        // Run category resolver from rules
        const rulesCat = parseVoiceWithRules(transcript, categories);
        finalCategoryId = rulesCat.categoryId || categories[0]?.id || '';
      }
      const catObj = categories.find((c: CategoryItem) => c.id === finalCategoryId);

      const keyword = parsedGemini.suggestedImageKeyword || parsedGemini.name;
      const imageUrl = pickSuggestedImage(keyword, catObj?.name || '');

      const formattedVariants: ParsedVariant[] = Array.isArray(parsedGemini.variants) && parsedGemini.variants.length > 0
        ? parsedGemini.variants.map((v: any) => ({
            weight: String(v.weight || '1kg'),
            price: Number(v.price) || 100,
            stock: Number(v.stock) || 50,
            sku: String(v.sku || ''),
          }))
        : [{ weight: '1kg', price: 100, stock: 50, sku: '' }];

      const responsePayload: ParsedProductResponse = {
        name: parsedGemini.name || 'New Farm Product',
        description: parsedGemini.description || generateDescriptiveText(parsedGemini.name, catObj?.name || ''),
        categoryId: finalCategoryId,
        categoryName: catObj?.name || 'Uncategorized',
        imageUrl,
        isFeatured: Boolean(parsedGemini.isFeatured),
        variants: formattedVariants,
        source: 'gemini',
      };

      return NextResponse.json({ success: true, data: responsePayload });
    } catch (geminiErr) {
      console.warn('Gemini error, using robust fallback parser:', geminiErr);
      const fallback = parseVoiceWithRules(transcript, categories);
      return NextResponse.json({ success: true, data: fallback });
    }
  } catch (error: any) {
    console.error('Voice parse API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error parsing voice command.' },
      { status: 500 }
    );
  }
}
