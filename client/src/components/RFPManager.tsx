import { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, ArrowRight, Mail, Loader2, X, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import type { IRFP } from '../types';
import VendorManager from './VendorManager';

interface IProposal {
    _id: string;
    vendorName: string;
    extractedData: {
        totalPrice: number;
        currency: string;
        deliveryTimeline: string;
        warranty: string;
        summary: string;
    }
}

const RFPManager = () => {
    const [rfps, setRfps] = useState<IRFP[]>([]);
    const [selectedRFP, setSelectedRFP] = useState<string | null>(null);
    const [proposals, setProposals] = useState<IProposal[]>([]);
    
    // UI States
    const [syncing, setSyncing] = useState(false);
    
    // --- MODAL STATES ---
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    // Data States
    const [analysis, setAnalysis] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchRFPs();
    }, []);

    useEffect(() => {
        if (selectedRFP) {
            fetchProposals(selectedRFP);
            setAnalysis(null);
        }
    }, [selectedRFP]);

    const fetchRFPs = async () => {
        const res = await axios.get('http://localhost:5000/api/rfps');
        setRfps(res.data);
    };

    const fetchProposals = async (id: string) => {
        const res = await axios.get(`http://localhost:5000/api/rfps/${id}/proposals`);
        setProposals(res.data);
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await axios.post('http://localhost:5000/api/rfps/sync-emails');
            if (selectedRFP) fetchProposals(selectedRFP);
            alert("Sync Complete! Check for new proposals.");
        } catch (e) {
            console.error(e);
        } finally {
            setSyncing(false);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedRFP) return;
        setShowAnalysisModal(true); // Open Modal immediately
        setAnalyzing(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/rfps/${selectedRFP}/analyze`);
            setAnalysis(res.data);
        } catch (e) {
            alert("Analysis failed.");
            setShowAnalysisModal(false);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSendMore = async () => {
        if (!selectedRFP || selectedVendors.length === 0) return;
        setSending(true);
        try {
            await axios.post(`http://localhost:5000/api/rfps/${selectedRFP}/send`, {
                vendorIds: selectedVendors
            });
            alert("Invites sent successfully!");
            setShowInviteModal(false);
            fetchRFPs(); 
        } catch (error) {
            alert("Failed to send emails.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">RFP Dashboard</h1>
                <button 
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded hover:bg-slate-50 shadow-sm font-medium"
                >
                    <RefreshCw className={syncing ? "animate-spin" : ""} size={18} />
                    {syncing ? "Syncing Inbox..." : "Check for Replies"}
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Left: List of RFPs */}
                <div className="col-span-1 space-y-3 h-[calc(100vh-200px)] overflow-y-auto px-2 py-1">
                    {rfps.map(rfp => (
                        <div
                            key={rfp._id}
                            onClick={() => setSelectedRFP(rfp._id)}
                            className={`p-4 border rounded-xl cursor-pointer transition-all ${
                                selectedRFP === rfp._id 
                                ? 'border-blue-600 bg-blue-50 shadow-sm ring-1 ring-blue-600' 
                                : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                            }`}
                        >
                            <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight mb-2 pb-1">{rfp.title}</h3>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">{new Date(rfp.createdAt).toLocaleDateString()}</span>
                                <span className={`px-2 py-1 rounded-full font-bold uppercase tracking-wide ${
                                    rfp.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {rfp.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Details Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px] relative">
                    {!selectedRFP ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                            <ArrowRight size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">Select a project to manage</p>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            {/* Toolbar */}
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-bold text-slate-800">Proposals</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                    >
                                        <Mail size={16} /> Invite Vendors
                                    </button>
                                    {proposals.length > 0 && (
                                        <button
                                            onClick={handleAnalyze}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm"
                                        >
                                            <Sparkles size={16} /> AI Compare
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Proposals Table */}
                            {proposals.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <Mail className="text-slate-300 mb-3" size={40} />
                                    <p className="text-slate-600 font-medium">No proposals received yet.</p>
                                    <p className="text-sm text-slate-400 mt-1">Sync your inbox or invite more vendors.</p>
                                </div>
                            ) : (
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium">
                                            <tr>
                                                <th className="p-3 pl-4">Vendor</th>
                                                <th className="p-3">Price</th>
                                                <th className="p-3">Timeline</th>
                                                <th className="p-3">Warranty</th>
                                                <th className="p-3">Summary</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {proposals.map(p => (
                                                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-3 pl-4 font-semibold text-slate-800">{p.vendorName}</td>
                                                    <td className="p-3 font-bold text-emerald-600">
                                                        {p.extractedData.totalPrice?.toLocaleString()} {p.extractedData.currency}
                                                    </td>
                                                    <td className="p-3">{p.extractedData.deliveryTimeline}</td>
                                                    <td className="p-3">{p.extractedData.warranty}</td>
                                                    <td className="p-3 text-slate-500 max-w-[200px] truncate" title={p.extractedData.summary}>
                                                        {p.extractedData.summary}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL 1: INVITE VENDORS --- */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Invite Vendors</h3>
                            <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <VendorManager onSelect={setSelectedVendors} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button 
                                onClick={() => setShowInviteModal(false)}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendMore}
                                disabled={sending || selectedVendors.length === 0}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                            >
                                {sending ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                                {sending ? "Sending..." : "Send Invites"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: AI ANALYSIS --- */}
            {showAnalysisModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-purple-600 text-white p-6 flex justify-between items-start">
                            <div className="flex gap-3">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                                    <Sparkles className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">AI Recommendation</h3>
                                    <p className="text-purple-100 text-sm opacity-90">Based on budget, timeline, and specs</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAnalysisModal(false)} className="text-white/70 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto">
                            {analyzing ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
                                    <p className="text-lg font-medium text-slate-600">Analyzing proposals...</p>
                                    <p className="text-sm text-slate-400">Comparing prices, warranties, and timelines</p>
                                </div>
                            ) : analysis ? (
                                <div className="space-y-6">
                                    {/* Winner Card */}
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex gap-4 items-start">
                                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={28} />
                                        <div>
                                            <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Best Choice</span>
                                            <h4 className="text-2xl font-bold text-slate-800 mb-2">{analysis.recommendedVendor}</h4>
                                            <div className="inline-block bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                                Score: {analysis.score}/100
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reasoning */}
                                    <div>
                                        <h5 className="font-bold text-slate-700 mb-2">Why this vendor?</h5>
                                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg">
                                            {analysis.reasoning}
                                        </p>
                                    </div>

                                    {/* Caveats */}
                                    {analysis.caveats && (
                                        <div className="flex gap-3 items-start p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800">
                                            <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
                                            <p className="text-sm">{analysis.caveats}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-red-500">Failed to load analysis.</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 p-4 border-t flex justify-end">
                            <button 
                                onClick={() => setShowAnalysisModal(false)}
                                className="px-6 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RFPManager;