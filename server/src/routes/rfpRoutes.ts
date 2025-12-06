import express, { Request, Response } from 'express';
import RFP from '../models/RFP';
import { parseRFPRequest } from '../services/aiService';
import Vendor from '../models/Vendor';
import { sendRFPEmail } from '../services/emailService';
import { checkEmailsForReplies } from '../services/imapService';
import Proposal from '../models/Proposals'; // You'll need this later
import { compareProposalsWithAI } from '../services/aiService';

const router = express.Router();

// POST: Generate RFP
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userPrompt } = req.body;
        if (!userPrompt) {
            res.status(400).json({ error: "Prompt is required" });
            return;
        }

        // 1. AI Parsing
        const structuredData = await parseRFPRequest(userPrompt);

        if (!structuredData) {
            res.status(500).json({ error: "Failed to parse RFP" });
            return;
        }

        // 2. Save to DB
        const newRFP = new RFP({
            title: structuredData.title,
            originalPrompt: userPrompt,
            jsonOutput: structuredData
        });

        await newRFP.save();
        res.json(newRFP);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch All
router.get('/', async (req: Request, res: Response) => {
    const rfps = await RFP.find().sort({ createdAt: -1 });
    res.json(rfps);
});

router.post('/:id/send', async (req: Request, res: Response): Promise<void> => {
    try {
        const { vendorIds } = req.body; // Array of Vendor IDs
        const rfp = await RFP.findById(req.params.id);
        
        if (!rfp) {
            res.status(404).json({ error: "RFP not found" });
            return;
        }

        const vendors = await Vendor.find({ _id: { $in: vendorIds } });

        // Send emails in parallel
        await Promise.all(vendors.map(v => sendRFPEmail(v, rfp)));

        // Update status
        rfp.status = 'Sent';
        await rfp.save();

        res.json({ message: `Sent to ${vendors.length} vendors` });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/sync-emails', async (req: Request, res: Response) => {
    try {
        const result = await checkEmailsForReplies();
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Get Proposals for a specific RFP
router.get('/:id/proposals', async (req: Request, res: Response) => {
    try {
        const proposals = await Proposal.find({ rfpId: req.params.id });
        res.json(proposals);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/analyze', async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Get the RFP and its Proposals
        const rfp = await RFP.findById(req.params.id);
        const proposals = await Proposal.find({ rfpId: req.params.id });

        if (!rfp || proposals.length === 0) {
            res.status(400).json({ error: "No proposals to analyze" });
            return;
        }

        // 2. Ask AI
        const analysis = await compareProposalsWithAI(rfp.jsonOutput, proposals);
        
        res.json(analysis);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/preview', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userPrompt } = req.body;
        // Call AI
        const structuredData = await parseRFPRequest(userPrompt);
        
        if (!structuredData) {
            res.status(500).json({ error: "Failed to generate structure" });
            return;
        }
        // Return JSON but DO NOT save to DB yet
        res.json(structuredData);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/create', async (req: Request, res: Response): Promise<void> => {
    try {
        const { rfpData, originalPrompt } = req.body; // Expects the JSON from the preview
        
        const newRFP = new RFP({
            title: rfpData.title,
            originalPrompt: originalPrompt,
            jsonOutput: rfpData,
            status: 'Draft' // Default to Draft
        });

        await newRFP.save();
        res.json(newRFP);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


export default router;