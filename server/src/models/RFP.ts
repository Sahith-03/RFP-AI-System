import mongoose, { Schema, Document } from 'mongoose';

// 1. Define the Interface (The Shape of the Data)
export interface IRFPItem {
    item_name: string;
    quantity: number;
    specs: string;
}

export interface IRFPStructure {
    title: string;
    budget: number;
    currency: string;
    items: IRFPItem[];
    requirements: string[]; // e.g. ["Delivery by Friday", "Warranty included"]
}

export interface IRFP extends Document {
    title: string;
    originalPrompt: string;
    status: 'Draft' | 'Sent' | 'Closed';
    createdAt: Date;
    jsonOutput: IRFPStructure; // <--- Strictly Typed!
}

// 2. Define the Schema
const RFPSchema: Schema = new Schema({
    title: { type: String, required: true },
    originalPrompt: { type: String, required: true },
    status: { type: String, default: 'Draft' },
    createdAt: { type: Date, default: Date.now },
    jsonOutput: {
        budget: { type: Number },
        currency: { type: String },
        items: [{
            item_name: String,
            quantity: Number,
            specs: String
        }],
        requirements: [String]
    }
});

export default mongoose.model<IRFP>('RFP', RFPSchema);