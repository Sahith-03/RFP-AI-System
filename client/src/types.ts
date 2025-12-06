export interface IRFPItem {
    item_name: string;
    quantity: number;
    specs: string;
}

export interface IRFPStructure {
    title: string;
    budget: number;
    currency: string;
    items: IRFPItem[];
    requirements: string[];
}

export interface IRFP {
    _id: string;
    title: string;
    originalPrompt: string;
    status: 'Draft' | 'Sent' | 'Closed';
    createdAt: string;
    jsonOutput: IRFPStructure;
}