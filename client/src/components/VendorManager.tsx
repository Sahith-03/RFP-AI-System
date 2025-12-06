import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Vendor {
    _id: string;
    name: string;
    email: string;
}

interface Props {
    onSelect: (vendorIds: string[]) => void;
}

const VendorManager: React.FC<Props> = ({ onSelect }) => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [newVendor, setNewVendor] = useState({ name: '', email: '' });

    // Fetch vendors on load
    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        const res = await axios.get('http://localhost:5000/api/vendors');
        setVendors(res.data);
    };

    const addVendor = async () => {
        if (!newVendor.name || !newVendor.email) return;
        await axios.post('http://localhost:5000/api/vendors', newVendor);
        setNewVendor({ name: '', email: '' });
        fetchVendors();
    };

    const toggleVendor = (id: string) => {
        const updated = selected.includes(id) 
            ? selected.filter(v => v !== id)
            : [...selected, id];
        setSelected(updated);
        onSelect(updated);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
            <h3 className="text-xl font-bold mb-4">Select Vendors</h3>
            
            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {vendors.map(v => (
                    <div 
                        key={v._id}
                        onClick={() => toggleVendor(v._id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selected.includes(v._id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                checked={selected.includes(v._id)} 
                                readOnly 
                                className="w-5 h-5"
                            />
                            <div>
                                <p className="font-semibold">{v.name}</p>
                                <p className="text-sm text-gray-500">{v.email}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Add Form */}
            <div className="flex gap-2 items-end border-t pt-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">New Vendor Name</label>
                    <input 
                        className="w-full border p-2 rounded"
                        value={newVendor.name}
                        onChange={e => setNewVendor({...newVendor, name: e.target.value})}
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                    <input 
                        className="w-full border p-2 rounded"
                        value={newVendor.email}
                        onChange={e => setNewVendor({...newVendor, email: e.target.value})}
                    />
                </div>
                <button 
                    onClick={addVendor}
                    className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-black"
                >
                    Add
                </button>
            </div>
        </div>
    );
};

export default VendorManager;