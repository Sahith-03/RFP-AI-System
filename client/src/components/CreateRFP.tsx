import { useState } from 'react';
import axios from 'axios';
import { Loader2, Send, CheckCircle, Save } from 'lucide-react'; // Icons
import type { IRFP, IRFPStructure } from '../types';
import VendorManager from './VendorManager';
import { Mail } from 'lucide-react';

const CreateRFP = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [rfp, setRfp] = useState<IRFP | null>(null);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [sending, setSending] = useState(false);

    const [previewData, setPreviewData] = useState<IRFPStructure | null>(null);

    const [savedRfpId, setSavedRfpId] = useState<string | null>(null);
    
    const [processingAction, setProcessingAction] = useState(false);


    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            // Call your backend running on port 5000
            const res = await axios.post('http://localhost:5000/api/rfps/generate', {
                userPrompt: prompt
            });
            setRfp(res.data);
            console.log(res.data)
        } catch (error) {
            console.error("Error generating RFP", error);
            alert("Failed to generate RFP. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!rfp || selectedVendors.length === 0) return;

        setSending(true); // <--- Start Loading
        try {
            await axios.post(`http://localhost:5000/api/rfps/${rfp._id}/send`, {
                vendorIds: selectedVendors
            });
            alert("Emails sent successfully!");
        } catch (error) {
            alert("Failed to send emails.");
        } finally {
            setSending(false); // <--- Stop Loading
        }
    };

    const handlePreview = async () => {
        if (!prompt) return;
        setLoading(true);
        setSavedRfpId(null); // Reset if they regenerate
        try {
            const res = await axios.post('http://localhost:5000/api/rfps/preview', {
                userPrompt: prompt
            });
            setPreviewData(res.data);
        } catch (error) {
            alert("Failed to generate preview.");
        } finally {
            setLoading(false);
        }
    };

    const saveToDb = async () => {
        if (!previewData) return null;
        const res = await axios.post('http://localhost:5000/api/rfps/create', {
            rfpData: previewData,
            originalPrompt: prompt
        });
        return res.data._id; // Return the new MongoDB ID
    };

    const handleSaveDraft = async () => {
        setProcessingAction(true);
        try {
            const id = await saveToDb();
            setSavedRfpId(id);
            alert("RFP Saved as Draft!");
        } catch (error) {
            alert("Failed to save draft.");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleSendAndSave = async () => {
        if (selectedVendors.length === 0) return;
        setProcessingAction(true);
        try {
            // A. First, Save to DB (if not already saved)
            let id = savedRfpId;
            if (!id) {
                id = await saveToDb();
                setSavedRfpId(id);
            }

            // B. Then, Send Emails using that ID
            await axios.post(`http://localhost:5000/api/rfps/${id}/send`, {
                vendorIds: selectedVendors
            });
            
            alert("RFP Saved & Emails Sent Successfully!");
            
            // Optional: Reset form or redirect
            // setPreviewData(null);
            // setPrompt("");
        } catch (error) {
            alert("Failed to send emails.");
        } finally {
            setProcessingAction(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Create New RFP</h1>
            
            {/* Input Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Describe what you need (Natural Language)
                </label>
                <textarea
                    className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="E.g. I need 20 MacBook Pros..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <button
                    onClick={handlePreview}
                    disabled={loading || !prompt}
                    className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    {loading ? "AI is Thinking..." : "Generate Preview"}
                </button>
            </div>

            {/* Preview Section */}
            {previewData && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 mb-4 text-blue-600">
                        <CheckCircle size={24} />
                        <h2 className="text-xl font-bold">RFP Preview</h2>
                    </div>

                    {/* Render Details (Table etc) */}
                    <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <span className="text-xs text-slate-500 uppercase font-bold">Title</span>
                                <p className="font-medium text-lg">{previewData.title}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <span className="text-xs text-slate-500 uppercase font-bold">Budget</span>
                                <p className="font-medium text-lg">
                                    {previewData.currency} {previewData.budget?.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <table className="w-full text-left text-sm border rounded overflow-hidden">
                            <thead className="bg-slate-100 border-b">
                                <tr>
                                    <th className="p-3">Item</th>
                                    <th className="p-3">Qty</th>
                                    <th className="p-3">Specs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.items.map((item, idx) => (
                                    <tr key={idx} className="border-b last:border-0">
                                        <td className="p-3">{item.item_name}</td>
                                        <td className="p-3">{item.quantity}</td>
                                        <td className="p-3 text-slate-500">{item.specs}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- ACTION AREA --- */}
                    <div className="border-t pt-6">
                        {savedRfpId ? (
                             <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center font-bold mb-4">
                                ✅ Saved to Database
                             </div>
                        ) : null}

                        <h3 className="font-bold mb-4">Choose Action:</h3>
                        
                        <div className="flex flex-col gap-6">
                            {/* Option 1: Save Draft */}
                            {!savedRfpId && (
                                <div className="flex items-center justify-between p-4 border border-dashed rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-600">Not ready to send? Save for later.</p>
                                    <button
                                        onClick={handleSaveDraft}
                                        disabled={processingAction}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-black disabled:opacity-50"
                                    >
                                        <Save size={18} /> Save as Draft
                                    </button>
                                </div>
                            )}

                            {/* Option 2: Select Vendors & Send */}
                            <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
                                <p className="text-sm text-blue-800 mb-4 font-bold">Ready to send? Select Vendors:</p>
                                
                                <VendorManager onSelect={setSelectedVendors} />
                                
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleSendAndSave}
                                        disabled={processingAction || selectedVendors.length === 0}
                                        className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold shadow-md"
                                    >
                                        {processingAction ? <Loader2 className="animate-spin" /> : <Mail />}
                                        {savedRfpId ? "Send Emails" : "Save & Send Emails"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default CreateRFP;