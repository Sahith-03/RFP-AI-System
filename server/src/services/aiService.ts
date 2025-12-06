import { GoogleGenerativeAI } from "@google/generative-ai";
import { IRFPStructure } from "../models/RFP";

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json",temperature: 0.1 }
});

export interface IParsedProposal {
    totalPrice: number;
    currency: string;
    deliveryTimeline: string;
    warranty: string;
    summary: string;
    vendorName: string;
}

export async function parseRFPRequest(userPrompt: string): Promise<IRFPStructure | null> {
    const prompt = `
    You are a procurement expert. Analyze this request: "${userPrompt}"
    
    Extract the data into this strict JSON format:
    {
      "title": "A short summary title",
      "budget": number (or 0 if not found),
      "currency": "USD",
      "items": [
        { "item_name": "string", "quantity": number, "specs": "string" }
      ],
      "requirements": ["list of other terms like delivery date, warranty, etc"]
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const data = JSON.parse(text) as IRFPStructure;
        return data;
    } catch (error) {
        console.error("AI Error:", error);
        return null;
    }
}

export async function parseVendorEmail(emailText: string): Promise<IParsedProposal | null> {
    const prompt = `
    You are a data extraction engine. Analyze this email from a vendor.
    
    Email Body:
    "${emailText}"

    Extract the following strictly as JSON:
    {
      "vendorName": "Name of the person or company signing the email",
      "totalPrice": number (just the value, e.g. 5000),
      "currency": "USD" (or EUR/GBP etc),
      "deliveryTimeline": "string (e.g. 2 weeks)",
      "warranty": "string (e.g. 1 year)",
      "summary": "A short 1-sentence summary of the offer"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text()) as IParsedProposal;
    } catch (error) {
        console.error("AI Email Parse Error:", error);
        return null;
    }
}

export async function compareProposalsWithAI(rfpRequirement: any, proposals: any[]) {
    const prompt = `
    You are a STRICT Procurement Officer. Your job is to evaluate vendor proposals against a Request for Proposal (RFP).
    
    CRITICAL: Do not be generous. Scores should reflect reality.
    - A perfect match = 90-100
    - Good but expensive/slow = 70-89
    - Major issues/Missing items = < 70

    1. THE GOLDEN STANDARD (RFP Requirements):
    ${JSON.stringify(rfpRequirement)}

    2. VENDOR PROPOSALS:
    ${JSON.stringify(proposals)}

    SCORING RUBRIC:
    - Price (40% weight): Compare against budget (${rfpRequirement.budget} ${rfpRequirement.currency}). Lower price is better, but significantly over budget should be penalized heavily.
    - Timeline (30% weight): Compare against required delivery date. Faster is better.
    - Compliance (30% weight): Did they meet specs? Warranty included?

    Output a JSON object exactly like this:
    {
        "recommendedVendor": "Name of the best vendor",
        "score": number (0-100),
        "reasoning": "Explain strictly why they won. Compare specific numbers (e.g. '$500 cheaper than competitor X').",
        "caveats": "List negative points (e.g. 'However, their delivery is 1 week slower than requested')."
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("AI Compare Error:", error);
        return null;
    }
}