import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import RFP from '../models/RFP';
import Proposal from '../models/Proposals';
import { parseVendorEmail } from './aiService';

const config = {
    imap: {
        user: process.env.EMAIL_USER as string,
        password: process.env.EMAIL_PASS as string,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
        tlsOptions: { 
            rejectUnauthorized: false 
        }
    }
};

export async function checkEmailsForReplies() {
    console.log("🔄 Connecting to IMAP...");
    
    try {
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        // 1. Search for Unseen emails
        const searchCriteria = ['UNSEEN'];
        const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true, struct: true };
        
        // const allMessages = await connection.search(['UNSEEN'], { bodies: ['HEADER'] });
        // const recentMessages = allMessages.slice(-20);
        // console.log(`🔎 Found ${allMessages.length} unread. Checking last ${recentMessages.length}...`);

        const fastSearchCriteria = [
            ['UNSEEN'],
            ['HEADER', 'SUBJECT', 'Ref:'] // Only fetch emails with "Ref:" in subject
        ];
        
        const messages = await connection.search(fastSearchCriteria, fetchOptions);
        console.log(`📩 Found ${messages.length} RELEVANT vendor emails.`);

        let processedCount = 0;

        for (const item of messages) {
            // 2. Extract Parts strictly
            const headerPart = item.parts.find((p: any) => p.which === 'HEADER');
            const textPart = item.parts.find((p: any) => p.which === 'TEXT');

            if (!headerPart || !textPart) {
                console.log("⚠️ Skipping email with missing parts");
                continue;
            }

            // 3. Get Subject from Header Object (Reliable)
            // imap-simple returns headers as arrays (e.g. subject: ['My Subject'])
            const subject = headerPart.body.subject ? headerPart.body.subject[0] : "No Subject";
            const fromRaw = headerPart.body.from ? headerPart.body.from[0] : "";

            console.log(`🔎 Checking Subject: "${subject}"`);

            // 4. Regex for RFP ID: [Ref:...]
            const match = subject.match(/Ref:([a-f0-9]{24})/);
            
            if (match && match[1]) {
                const rfpId = match[1];
                
                // Verify RFP exists
                const rfp = await RFP.findById(rfpId);
                if (rfp) {
                    console.log(`✅ MATCH! Linked to RFP: ${rfp.title}`);
                    
                    // 5. Clean the Body Text (Remove HTML tags, newlines)
                    // We pass the raw text to simpleParser just to clean it up
                    const parsedBody = await simpleParser(textPart.body);
                    const cleanText = parsedBody.text || textPart.body; // Fallback to raw

                    // 6. AI Extraction
                    console.log("🤖 Asking Gemini to parse body...");
                    const extracted = await parseVendorEmail(cleanText);
                    
                    if (extracted) {
                        const proposal = new Proposal({
                            rfpId: rfp._id,
                            vendorName: extracted.vendorName || "Unknown Vendor",
                            senderEmail: fromRaw,
                            rawEmailBody: cleanText,
                            extractedData: extracted
                        });
                        
                        await proposal.save();
                        console.log(`💾 Saved Proposal: ${extracted.totalPrice} ${extracted.currency}`);
                        processedCount++;
                    }
                } else {
                    console.log("❌ RFP ID found in subject, but not in DB.");
                }
            } else {
                console.log("⏩ Ignored (No RFP Ref ID)");
            }
        }

        connection.end();
        return { success: true, count: processedCount };
    } catch (error) {
        console.error("IMAP Error:", error);
        return { success: false, error };
    }
}