import mongoose, { Schema, Document } from 'mongoose';

export interface IProposal extends Document {
    rfpId: mongoose.Types.ObjectId;
    vendorName: string; // Extracted from email
    senderEmail: string;
    receivedAt: Date;
    rawEmailBody: string;
    
    // AI Extracted Data
    extractedData: {
        totalPrice: number;
        currency: string;
        deliveryTimeline: string;
        warranty: string;
        summary: string;
    };
}

const ProposalSchema: Schema = new Schema({
    rfpId: { type: Schema.Types.ObjectId, ref: 'RFP', required: true },
    vendorName: String,
    senderEmail: String,
    receivedAt: { type: Date, default: Date.now },
    rawEmailBody: String,
    extractedData: {
        totalPrice: Number,
        currency: String,
        deliveryTimeline: String,
        warranty: String,
        summary: String
    }
});

export default mongoose.model<IProposal>('Proposal', ProposalSchema);