import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
    name: string;
    email: string;
    category: string;
}

const VendorSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String }
});

export default mongoose.model<IVendor>('Vendor', VendorSchema);