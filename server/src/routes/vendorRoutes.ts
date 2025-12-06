import express, { Request, Response } from 'express';
import Vendor from '../models/Vendor';

const router = express.Router();

// POST: Add a new vendor
router.post('/', async (req: Request, res: Response) => {
    try {
        const vendor = new Vendor(req.body);
        await vendor.save();
        res.status(201).json(vendor);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET: List all vendors
router.get('/', async (req: Request, res: Response) => {
    try {
        const vendors = await Vendor.find();
        res.json(vendors);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;