import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from './models/Vendor';

dotenv.config();

const vendors = [
    { name: "TechGiant Solutions", email: "techgiant+test@example.com", category: "Hardware" },
    { name: "OfficeDepot Pro", email: "supplies+test@example.com", category: "Office Supplies" },
    { name: "Global Logistics", email: "shipping+test@example.com", category: "Services" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("✅ DB Connected");

        await Vendor.deleteMany({}); // Clear old vendors
        await Vendor.insertMany(vendors);
        
        console.log("🌱 Vendors Seeded Successfully!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();