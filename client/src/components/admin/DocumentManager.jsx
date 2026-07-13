import React, { useState, useEffect, useCallback } from 'react';
import { documentApi } from '../../api/documentApi';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Trash2, 
  Edit3, 
  Eye, 
  RefreshCw, 
  X, 
  FolderOpen, 
  AlertTriangle,
  Layers,
  FileCheck
} from 'lucide-react';

const DocumentManager = () => {
    const [documents, setDocuments] = useState([]);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [isViewOnly, setIsViewOnly] = useState(false);

    const categories = ['HR', 'Products', 'Policies', 'Documentation', 'FAQ'];

    const fetchDocuments = async () => {
        try {
            const data = await documentApi.getDocuments();
            if (data && Array.isArray(data.results)) {
                setDocuments(data.results);
            } else if (Array.isArray(data)) {
                setDocuments(data);
            } else {
                setDocuments([]);
            }
        } catch (err) {
            console.error("Failed to fetch documents", err);
        }
    };

    useEffect(() => {
        fetchDocuments();
        const interval = setInterval(() => {
            fetchDocuments();
        }, 5000); // Poll every 5s for status updates
        return () => clearInterval(interval);
    }, []);

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        if (!file || !title || !category) {
            setError("Please fill all fields");
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            setError("File size exceeds 50MB limit");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('file', file);

        setLoading(true);
        setError(null);
        try {
            await documentApi.uploadDocument(formData);
            setTitle('');
            setCategory('');
            setFile(null);
            fetchDocuments();
        } catch (err) {
            setError(err.response?.data?.detail || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const handleParse = async (id) => {
        try {
            await documentApi.parseDocument(id);
            fetchDocuments();
        } catch (err) {
            alert("Failed to queue parsing");
        }
    };

    const handleIndex = async (id) => {
        try {
            await documentApi.indexDocument(id);
            setPreviewDoc(null);
            fetchDocuments();
        } catch (err) {
            alert("Failed to queue indexing");
        }
    };

    const handleApproveAndIndex = async (id, updatedText) => {
        try {
            // First save the updated text
            await documentApi.updateDocument(id, { extracted_text: updatedText });
            // Then trigger indexing
            await documentApi.indexDocument(id);
            setPreviewDoc(null);
            fetchDocuments();
        } catch (err) {
            alert("Failed to approve and index document");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await documentApi.deleteDocument(id);
            fetchDocuments();
        } catch (err) {
            alert("Failed to delete document");
        }
    };

    const handleSavePreview = async () => {
        if (!previewDoc) return;
        try {
            await documentApi.updateDocument(previewDoc.id, { extracted_text: previewDoc.extracted_text });
            alert("Extracted text saved successfully as draft");
            setPreviewDoc(null);
            fetchDocuments();
        } catch (err) {
            alert("Failed to save changes");
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0];
            setFile(selectedFile);
            if (!title) {
                const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
                setTitle(nameWithoutExt);
            }
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            if (!title) {
                const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
                setTitle(nameWithoutExt);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('file-upload-input').click();
        }
    };

    // Helper to map DB statuses to RAG dashboard requirements
    const getDisplayStatusAndLabel = (doc) => {
        if (doc.status === 'Processing') {
            if (!doc.extracted_text) {
                return {
                    label: 'Parsing...',
                    badgeClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                    isSpinning: true,
                    phase: 'parsing'
                };
            } else {
                return {
                    label: 'Indexing...',
                    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    isSpinning: true,
                    phase: 'indexing'
                };
            }
        }
        if (doc.status === 'Indexed') {
            return {
                label: 'Indexed',
                badgeClass: 'bg-green-500/10 text-green-400 border-green-500/20',
                isSpinning: false,
                phase: 'indexed'
            };
        }
        if (doc.status === 'Pending Review') {
            return {
                label: 'Pending Review',
                badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                isSpinning: false,
                phase: 'pending_review'
            };
        }
        if (doc.status === 'Failed') {
            return {
                label: 'Failed',
                badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
                isSpinning: false,
                phase: 'failed'
            };
        }
        // Default: Uploaded
        return {
            label: 'Uploaded',
            badgeClass: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
            isSpinning: false,
            phase: 'uploaded'
        };
    };

    // Calculate metrics
    const totalDocs = documents.length;
    const pendingReviewDocs = documents.filter(d => d.status === 'Pending Review').length;
    const processingDocs = documents.filter(d => d.status === 'Processing').length;
    const indexedDocs = documents.filter(d => d.status === 'Indexed').length;

    return (
        <div className="w-full flex flex-col gap-8 bg-zinc-950 p-6 rounded-2xl border border-zinc-900">
            {/* Header Title Section */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-900 pb-6">
                <div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                        <Layers className="w-5 h-5 text-red-600" />
                        AI RAG Knowledge Manager
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                        Teach your chatbot by uploading documents and indexing them into the vector similarity search database.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-[11px] text-neutral-400">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    <span>Polling vectors active</span>
                </div>
            </div>

            {/* Top Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Uploaded */}
                <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-xl p-5 flex flex-col gap-1 transition-all duration-300 relative group overflow-hidden select-none">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-neutral-500 rounded-r-md"></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5" />
                        Total Uploaded
                    </span>
                    <span className="text-3xl font-black text-white mt-2 leading-none">{totalDocs}</span>
                    <span className="text-[10px] text-neutral-500 mt-1">Files in local disk storage</span>
                </div>

                {/* Pending Review */}
                <div className="bg-zinc-900 border border-purple-950/40 hover:border-purple-900/50 rounded-xl p-5 flex flex-col gap-1 transition-all duration-300 relative group overflow-hidden select-none">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-md"></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                        Pending Review
                    </span>
                    <span className="text-3xl font-black text-purple-400 mt-2 leading-none">{pendingReviewDocs}</span>
                    <span className="text-[10px] text-neutral-500 mt-1">Awaiting text review</span>
                </div>

                {/* Processing */}
                <div className="bg-zinc-900 border border-yellow-950/40 hover:border-yellow-900/50 rounded-xl p-5 flex flex-col gap-1 transition-all duration-305 relative group overflow-hidden select-none">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-md"></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Processing
                    </span>
                    <span className="text-3xl font-black text-yellow-400 mt-2 leading-none">{processingDocs}</span>
                    <span className="text-[10px] text-neutral-500 mt-1">Celery tasks running</span>
                </div>

                {/* Indexed */}
                <div className="bg-zinc-900 border border-green-950/40 hover:border-green-900/50 rounded-xl p-5 flex flex-col gap-1 transition-all duration-300 relative group overflow-hidden select-none">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r-md"></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5" />
                        Indexed (Ready)
                    </span>
                    <span className="text-3xl font-black text-green-400 mt-2 leading-none">{indexedDocs}</span>
                    <span className="text-[10px] text-neutral-500 mt-1">Active in chatbot</span>
                </div>
            </div>

            {/* Upload Section */}
            <form onSubmit={handleUpload} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-6">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
                    <UploadCloud className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-bold text-white tracking-wide">Upload Training Document</h3>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-950/30 text-red-400 rounded-lg p-4 text-xs flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    {/* Drag & Drop File Zone */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Document File</label>
                        <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload-input').click()}
                            onKeyDown={handleKeyDown}
                            tabIndex={0}
                            role="button"
                            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px] outline-none ${
                                dragActive 
                                ? 'border-red-600 bg-red-950/10' 
                                : file 
                                    ? 'border-green-600 bg-green-950/5' 
                                    : 'border-zinc-800 hover:border-red-900/50 hover:bg-zinc-900/40'
                            }`}
                        >
                            <input 
                                id="file-upload-input"
                                type="file"
                                accept=".pdf,.docx,.txt,.md"
                                onChange={handleFileInputChange}
                                className="hidden"
                            />
                            {file ? (
                                <div className="flex flex-col items-center gap-2.5 py-2">
                                    <div className="p-3.5 bg-green-500/10 rounded-full text-green-400 border border-green-500/20 shadow-lg shadow-green-950/10">
                                        <CheckCircle2 className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xs font-bold text-white max-w-[320px] truncate">{file.name}</span>
                                        <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider bg-green-950/20 px-2.5 py-0.5 rounded border border-green-500/20">File Loaded Successfully</span>
                                    </div>
                                    <span className="text-[10px] text-neutral-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                    <button 
                                        type="button"
                                        className="text-[10px] text-red-500 font-bold hover:text-red-400 hover:underline mt-2 cursor-pointer bg-zinc-950/50 px-3 py-1 rounded-full border border-zinc-800/80 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    >
                                        Change File
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3.5 py-4">
                                    <div className="p-4 bg-zinc-950 rounded-full text-red-600 border border-zinc-800/80 shadow-md transition-transform duration-300 hover:scale-105">
                                        <UploadCloud className="w-8 h-8 animate-pulse" />
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xs font-bold text-white">
                                            Drag & drop document or <span className="text-red-500 font-extrabold hover:underline">browse files</span>
                                        </span>
                                        <span className="text-[10px] text-neutral-500">Supports PDF, DOCX, TXT, MD (Max 50MB)</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Section - Slide open once a file is selected */}
                    {file && (
                        <div className="flex flex-col gap-6 pt-6 border-t border-zinc-850/80 transition-all duration-300 ease-out origin-top animate-in fade-in slide-in-from-top-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Title Input */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Document Title</label>
                                    <input 
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Clevertouch UX Pro Specifications"
                                        required
                                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-colors"
                                    />
                                </div>

                                {/* Category Select */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        required
                                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
                                    >
                                        <option value="" className="text-neutral-500">Select Document Category...</option>
                                        {categories.map(catOpt => (
                                            <option key={catOpt} value={catOpt} className="text-white bg-zinc-950">{catOpt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Ingestion Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shadow-md shadow-red-950/20 active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>UPLOADING DOCUMENT...</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-4 h-4" />
                                        <span>UPLOAD DOCUMENT</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </form>

            {/* Document List Table Area */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-bold text-white tracking-wide">Knowledge Base Documents</h3>
                </div>

                {documents.length === 0 ? (
                    <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl py-12 px-6 text-center flex flex-col items-center">
                        <FolderOpen className="w-10 h-10 text-neutral-700 mb-3" />
                        <span className="text-xs text-white font-bold">No documents indexed</span>
                        <span className="text-[10px] text-neutral-500 max-w-xs mt-1">
                            Uploaded training materials will appear in this database list.
                        </span>
                    </div>
                ) : (
                    <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-900 bg-zinc-900/50">
                                        <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Title</th>
                                        <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Category</th>
                                        <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Status</th>
                                        <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900/60">
                                    {documents.map(doc => {
                                        const statusInfo = getDisplayStatusAndLabel(doc);
                                        return (
                                            <tr key={doc.id} className="hover:bg-zinc-900/10 transition-colors">
                                                <td className="px-6 py-4 text-xs font-bold text-white max-w-[280px] truncate" title={doc.title}>
                                                    {doc.title}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-neutral-400">
                                                    <span className="bg-zinc-900 border border-zinc-800 text-neutral-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                                        {doc.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    <span className={`px-2.5 py-0.5 inline-flex items-center gap-1.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ${statusInfo.badgeClass}`}>
                                                        {statusInfo.isSpinning && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-semibold text-right">
                                                    <div className="flex items-center justify-end gap-2.5">
                                                        {/* Actions logic based on statusInfo.phase */}
                                                        {statusInfo.phase === 'uploaded' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleParse(doc.id)}
                                                                    className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-900 hover:text-white rounded-full transition-all cursor-pointer"
                                                                >
                                                                    Parse
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(doc.id)}
                                                                    className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-red-400 hover:bg-red-950/40 hover:text-red-300 rounded-full transition-all cursor-pointer"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}

                                                        {(statusInfo.phase === 'parsing' || statusInfo.phase === 'indexing') && null}

                                                        {statusInfo.phase === 'pending_review' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => { setIsViewOnly(false); setPreviewDoc(doc); }}
                                                                    className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-purple-950/20 border border-purple-900/30 text-purple-400 hover:bg-purple-900 hover:text-white rounded-full transition-all cursor-pointer"
                                                                >
                                                                    Preview & Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(doc.id)}
                                                                    className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-red-400 hover:bg-red-950/40 hover:text-red-300 rounded-full transition-all cursor-pointer"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}

                                                        {statusInfo.phase === 'indexed' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => { setIsViewOnly(true); setPreviewDoc(doc); }}
                                                                    className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-neutral-300 hover:bg-zinc-800 hover:text-white rounded-full transition-all cursor-pointer"
                                                                >
                                                                    View
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleIndex(doc.id)}
                                                                    className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-green-950/20 border border-green-900/30 text-green-400 hover:bg-green-900 hover:text-white rounded-full transition-all cursor-pointer"
                                                                >
                                                                    Re-Index
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(doc.id)}
                                                                    className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-red-400 hover:bg-red-950/40 hover:text-red-300 rounded-full transition-all cursor-pointer"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}

                                                        {statusInfo.phase === 'failed' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleParse(doc.id)}
                                                                    className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-900 hover:text-white rounded-full transition-all cursor-pointer"
                                                                >
                                                                    Retry Parse
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(doc.id)}
                                                                    className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-red-400 hover:bg-red-950/40 hover:text-red-300 rounded-full transition-all cursor-pointer"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview & Edit Modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/10">
                            <div>
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                                    {isViewOnly ? 'View Extracted Text' : 'Review & Refine'}
                                </span>
                                <h3 className="text-sm font-extrabold text-white mt-1">
                                    Review Extracted Text - {previewDoc.title}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setPreviewDoc(null)} 
                                className="p-1.5 text-neutral-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 flex-grow flex flex-col gap-3 min-h-0">
                            <div className="flex items-center justify-between text-[11px] text-neutral-400">
                                <span>Parsed Content Editor</span>
                                <span>{isViewOnly ? 'Currently active in chatbot RAG.' : 'Review and format the text before final vector database indexing.'}</span>
                            </div>
                            <textarea 
                                className="flex-grow w-full bg-zinc-900/30 border border-zinc-800 p-4 rounded-lg font-mono text-xs text-white focus:outline-none focus:border-red-600 transition-colors resize-none min-h-[340px]"
                                value={previewDoc.extracted_text || ''}
                                readOnly={isViewOnly}
                                onChange={(e) => setPreviewDoc({...previewDoc, extracted_text: e.target.value})}
                                placeholder="Parsed text content will appear here..."
                                aria-label="Extracted Text Editor"
                            />
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-zinc-900 flex justify-between items-center bg-zinc-900/10">
                            <span className="text-[10px] text-neutral-500">
                                Document Category: <strong className="text-white">{previewDoc.category}</strong>
                            </span>
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => setPreviewDoc(null)} 
                                    className="px-4 py-2 border border-zinc-850 text-neutral-300 rounded-lg hover:bg-zinc-900 hover:text-white transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
                                >
                                    Cancel
                                </button>
                                {!isViewOnly && (
                                    <>
                                        <button 
                                            onClick={handleSavePreview} 
                                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-lg transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                                        >
                                            Save Draft
                                        </button>
                                        <button 
                                            onClick={() => handleApproveAndIndex(previewDoc.id, previewDoc.extracted_text)} 
                                            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-red-950/20"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Approve & Index
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentManager;
