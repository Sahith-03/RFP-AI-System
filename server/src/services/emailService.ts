import nodemailer from 'nodemailer';
import { IRFP } from '../models/RFP';
import { IVendor } from '../models/Vendor';

// Configure Transporter (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // This must be your App Password
    }
});

export async function sendRFPEmail(vendor: IVendor, rfp: IRFP) {
    const subject = `RFP Invitation: ${rfp.title} [Ref:${rfp._id}]`;
    
    // Create a nice HTML table for the email body
    const itemsTable = rfp.jsonOutput.items.map(i => 
        `<li><b>${i.item_name}</b> (Qty: ${i.quantity}) - ${i.specs}</li>`
    ).join('');

    const htmlBody = `
        <h3>Request for Proposal</h3>
        <p>Dear ${vendor.name},</p>
        <p>We are inviting you to submit a quote for the following requirements:</p>
        <ul>${itemsTable}</ul>
        <p><b>Budget Indication:</b> ${rfp.jsonOutput.currency} ${rfp.jsonOutput.budget}</p>
        <p><b>Requirements:</b> ${rfp.jsonOutput.requirements.join(', ')}</p>
        <hr/>
        <p>Please reply directly to this email with your proposal attached or in the body.</p>
        <p><i>Reference ID: ${rfp._id}</i></p>
    `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: vendor.email, // Sends to the vendor's actual email
        subject: subject,
        html: htmlBody
    });

    console.log(`📧 Email sent to ${vendor.name}`);
}