import React, { useState, useEffect } from 'react';
import { documentApi } from '../../api/documentApi';
import { 
  UploadCloud, FileText, Loader2, Trash2, 
  Edit3, Eye, RefreshCw, X, FolderOpen, AlertTriangle, 
  Database, FileCheck, Search, ArrowRight, Sparkles,
  ChevronRight, CheckCircle2, Clock, AlertCircle
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
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

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
        }, 5000);
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
            await documentApi.updateDocument(id, { extracted_text: updatedText });
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

    const getDisplayStatusAndLabel = (doc) => {
        if (doc.status === 'Processing') {
            if (!doc.extracted_text) {
                return {
                    label: 'Parsing',
                    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
                    dotClass: 'bg-amber-500',
                    isSpinning: true,
                    phase: 'parsing'
                };
            } else {
                return {
                    label: 'Indexing',
                    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
                    dotClass: 'bg-blue-500',
                    isSpinning: true,
                    phase: 'indexing'
                };
            }
        }
        if (doc.status === 'Indexed') {
            return {
                label: 'Indexed',
                badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                dotClass: 'bg-emerald-500',
                isSpinning: false,
                phase: 'indexed'
            };
        }
        if (doc.status === 'Pending Review') {
            return {
                label: 'Pending Review',
                badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
                dotClass: 'bg-violet-500',
                isSpinning: false,
                phase: 'pending_review'
            };
        }
        if (doc.status === 'Failed') {
            return {
                label: 'Failed',
                badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
                dotClass: 'bg-rose-500',
                isSpinning: false,
                phase: 'failed'
            };
        }
        return {
            label: 'Uploaded',
            badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
            dotClass: 'bg-slate-500',
            isSpinning: false,
            phase: 'uploaded'
        };
    };

    const totalDocs = documents.length;
    const pendingReviewDocs = documents.filter(d => d.status === 'Pending Review').length;
    const processingDocs = documents.filter(d => d.status === 'Processing').length;
    const indexedDocs = documents.filter(d => d.status === 'Indexed').length;

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             doc.id.toString().includes(searchQuery);
        const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ width: '100%' }}>
            {/* Header / Intro Panel */}
            <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--red)' }}>AI Knowledge Base</span>
                        </div>
                        <h2 className="admin-welcome-title" style={{ margin: 0 }}>Document Manager</h2>
                        <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
                            Upload, review, and manage training documents for your AI assistant.
                        </p>
                    </div>
                    <button
                        onClick={fetchDocuments}
                        className="admin-btn"
                        style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh List
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="admin-stats-grid" style={{ marginBottom: '32px' }}>
                <div className="admin-stat-card">
                    <p className="admin-stat-label">Total Documents</p>
                    <p className="admin-stat-value">{totalDocs}</p>
                    <p className="admin-stat-subtext">All uploaded files</p>
                </div>

                <div className="admin-stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <p className="admin-stat-label" style={{ color: '#8b5cf6' }}>Awaiting Review</p>
                    <p className="admin-stat-value" style={{ color: '#8b5cf6' }}>{pendingReviewDocs}</p>
                    <p className="admin-stat-subtext">Awaiting approval</p>
                </div>

                <div className="admin-stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <p className="admin-stat-label" style={{ color: '#f59e0b' }}>Processing</p>
                    <p className="admin-stat-value" style={{ color: '#f59e0b' }}>{processingDocs}</p>
                    <p className="admin-stat-subtext">Currently parsing/indexing</p>
                </div>

                <div className="admin-stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
                    <p className="admin-stat-label" style={{ color: '#16a34a' }}>Active in Chatbot</p>
                    <p className="admin-stat-value" style={{ color: '#16a34a' }}>{indexedDocs}</p>
                    <p className="admin-stat-subtext">Live and searchable</p>
                </div>
            </div>

            {/* Upload Section Panel */}
            <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Upload Document</h3>
                
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#ef4444', fontSize: '13px' }}>
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <strong>Upload failed:</strong> {error}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        {/* Drag and Drop Zone */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="admin-label" style={{ margin: 0 }}>Document File <span style={{ color: 'var(--red)' }}>*</span></label>
                            <div
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-upload-input').click()}
                                onKeyDown={handleKeyDown}
                                tabIndex={0}
                                role="button"
                                style={{
                                    border: dragActive ? '2px dashed var(--red)' : '2px dashed var(--line)',
                                    borderRadius: '8px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: dragActive ? 'var(--line-soft)' : file ? 'rgba(22, 163, 74, 0.04)' : 'var(--ink)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '160px',
                                    outline: 'none'
                                }}
                            >
                                <input 
                                    id="file-upload-input"
                                    type="file"
                                    accept=".pdf,.docx,.txt,.md"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />
                                {file ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.2)', borderRadius: '50%' }}>
                                            <FileCheck className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)', margin: 0 }}>{file.name}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--grey)', margin: '2px 0 0' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                        <button 
                                            type="button"
                                            style={{ fontSize: '11px', color: 'var(--red)', textDecoration: 'underline', marginTop: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        >
                                            Remove and choose another
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'var(--line-soft)', borderRadius: '50%' }}>
                                            <UploadCloud className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--white)', margin: 0 }}>
                                                Drop your file here, or <span style={{ color: 'var(--red)', textDecoration: 'underline' }}>browse</span>
                                            </p>
                                            <p style={{ fontSize: '11px', color: 'var(--grey)', margin: '4px 0 0' }}>PDF, DOCX, TXT, MD · Max 50MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title and Category */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label className="admin-label" style={{ margin: 0 }}>Title <span style={{ color: 'var(--red)' }}>*</span></label>
                                <input 
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Employee Handbook 2026"
                                    required
                                    style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label className="admin-label" style={{ margin: 0 }}>Category <span style={{ color: 'var(--red)' }}>*</span></label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                    style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px', cursor: 'pointer' }}
                                >
                                    <option value="" style={{ background: 'var(--ink-2)' }}>Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} style={{ background: 'var(--ink-2)', color: 'var(--white)' }}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !file}
                                className="admin-btn"
                                style={{
                                    marginTop: '8px',
                                    padding: '10px 24px',
                                    width: '100%',
                                    opacity: (loading || !file) ? 0.5 : 1,
                                    cursor: (loading || !file) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                                ) : (
                                    <><UploadCloud className="w-4 h-4" /> Upload Document</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Documents Table */}
            <div className="admin-welcome-panel" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '15px', fontWeight: '600' }}>All Documents</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--grey)' }}>
                            Showing {filteredDocuments.length} of {documents.length} documents
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search className="w-4 h-4" style={{ position: 'absolute', left: '10px', color: 'var(--grey)' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search documents..."
                                style={{
                                    background: 'var(--ink)',
                                    border: '1px solid var(--line)',
                                    padding: '8px 12px 8px 32px',
                                    borderRadius: '6px',
                                    color: 'var(--white)',
                                    fontSize: '13px',
                                    width: '200px'
                                }}
                            />
                        </div>

                        {/* Category Filters */}
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--ink)', padding: '4px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                            <button
                                onClick={() => setFilterCategory('All')}
                                style={{
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    borderRadius: '4px',
                                    background: filterCategory === 'All' ? 'var(--panel)' : 'none',
                                    color: filterCategory === 'All' ? 'var(--white)' : 'var(--grey)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    style={{
                                        padding: '4px 10px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        borderRadius: '4px',
                                        background: filterCategory === cat ? 'var(--panel)' : 'none',
                                        color: filterCategory === cat ? 'var(--white)' : 'var(--grey)',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {filteredDocuments.length === 0 ? (
                    <div style={{ padding: '48px 0', textAlign: 'center' }}>
                        <FolderOpen className="w-12 h-12" style={{ color: 'var(--grey)', margin: '0 auto 12px', opacity: 0.5 }} />
                        <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--white)', fontWeight: '600' }}>
                            {documents.length === 0 ? 'No documents yet' : 'No matches found'}
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--grey)' }}>
                            {documents.length === 0 ? 'Upload your first document above.' : 'Try adjusting your search query or category filter.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--grey)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    <th style={{ padding: '12px 16px' }}>Document</th>
                                    <th style={{ padding: '12px 16px' }}>Category</th>
                                    <th style={{ padding: '12px 16px' }}>Status</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocuments.map(doc => {
                                    const statusInfo = getDisplayStatusAndLabel(doc);
                                    
                                    // Custom badge colors
                                    let badgeColor = 'rgba(148, 163, 184, 0.08)'; // Slate / Uploaded
                                    let badgeTextColor = '#64748b';
                                    if (statusInfo.phase === 'parsing') {
                                        badgeColor = 'rgba(245, 158, 11, 0.08)';
                                        badgeTextColor = '#d97706';
                                    } else if (statusInfo.phase === 'indexing') {
                                        badgeColor = 'rgba(59, 130, 246, 0.08)';
                                        badgeTextColor = '#2563eb';
                                    } else if (statusInfo.phase === 'indexed') {
                                        badgeColor = 'rgba(16, 185, 129, 0.08)';
                                        badgeTextColor = '#16a34a';
                                    } else if (statusInfo.phase === 'pending_review') {
                                        badgeColor = 'rgba(139, 92, 246, 0.08)';
                                        badgeTextColor = '#7c3aed';
                                    } else if (statusInfo.phase === 'failed') {
                                        badgeColor = 'rgba(239, 68, 68, 0.08)';
                                        badgeTextColor = '#dc2626';
                                    }

                                    return (
                                        <tr key={doc.id} style={{ borderBottom: '1px solid var(--line-soft)', fontSize: '14px' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'var(--line-soft)', borderRadius: '6px' }}>
                                                        <FileText className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--white)' }}>{doc.title}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--grey)', marginTop: '2px' }}>ID: {doc.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                                                <span className="admin-welcome-chip" style={{ background: 'var(--line-soft)', border: '1px solid var(--line)', padding: '4px 8px', fontSize: '11px' }}>
                                                    {doc.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    backgroundColor: badgeColor,
                                                    color: badgeTextColor
                                                }}>
                                                    <span style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        background: badgeTextColor,
                                                        animation: statusInfo.isSpinning ? 'pulse 2s infinite' : 'none'
                                                    }}></span>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    {statusInfo.phase === 'uploaded' && (
                                                        <>
                                                            <button onClick={() => handleParse(doc.id)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 14px', fontSize: '12px' }}>
                                                                Parse
                                                            </button>
                                                            <button onClick={() => handleDelete(doc.id)} className="admin-logout-btn" style={{ padding: '6px', color: 'var(--grey)' }} title="Delete">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {statusInfo.phase === 'pending_review' && (
                                                        <>
                                                            <button onClick={() => { setIsViewOnly(false); setPreviewDoc(doc); }} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 14px', fontSize: '12px', background: 'var(--white)', color: 'var(--panel)', border: '1px solid var(--line)' }}>
                                                                Review
                                                            </button>
                                                            <button onClick={() => handleDelete(doc.id)} className="admin-logout-btn" style={{ padding: '6px', color: 'var(--grey)' }} title="Delete">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {statusInfo.phase === 'indexing' && (
                                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb', padding: '6px 12px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '4px' }}>
                                                            Indexing...
                                                        </span>
                                                    )}
                                                    {statusInfo.phase === 'parsing' && (
                                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#d97706', padding: '6px 12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '4px' }}>
                                                            Parsing...
                                                        </span>
                                                    )}
                                                    {statusInfo.phase === 'indexed' && (
                                                        <>
                                                            <button onClick={() => { setIsViewOnly(true); setPreviewDoc(doc); }} className="admin-logout-btn" style={{ padding: '6px', color: 'var(--grey)' }} title="View">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleIndex(doc.id)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 14px', fontSize: '12px', background: 'none', border: '1px solid var(--red)', color: 'var(--red)', boxShadow: 'none' }}>
                                                                Re-Index
                                                            </button>
                                                            <button onClick={() => handleDelete(doc.id)} className="admin-logout-btn" style={{ padding: '6px', color: 'var(--grey)' }} title="Delete">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {statusInfo.phase === 'failed' && (
                                                        <>
                                                            <button onClick={() => handleParse(doc.id)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 14px', fontSize: '12px' }}>
                                                                Retry
                                                            </button>
                                                            <button onClick={() => handleDelete(doc.id)} className="admin-logout-btn" style={{ padding: '6px', color: 'var(--grey)' }} title="Delete">
                                                                <Trash2 className="w-4 h-4" />
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
                )}
            </div>

            {/* Preview Modal */}
            {previewDoc && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px'
                }}>
                    <div style={{
                        background: 'var(--panel)',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'var(--line-soft)', borderRadius: '6px' }}>
                                    <FileText className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--white)' }}>
                                        {isViewOnly ? 'View Document' : 'Review & Edit'}
                                    </h4>
                                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--grey)' }}>{previewDoc.title}</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} style={{ padding: '4px', cursor: 'pointer', color: 'var(--grey)' }}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px', background: 'var(--ink)', flexGrow: 1, overflowY: 'auto' }}>
                            <textarea 
                                className="w-full h-96 bg-white border border-gray-300 rounded-lg p-4 font-mono text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                                value={previewDoc.extracted_text || ''}
                                readOnly={isViewOnly}
                                onChange={(e) => setPreviewDoc({...previewDoc, extracted_text: e.target.value})}
                            />
                        </div>

                        {/* Modal Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid var(--line)', background: 'var(--panel)' }}>
                            <div>
                                <span className="admin-welcome-chip" style={{ background: 'var(--line-soft)', border: '1px solid var(--line)', padding: '4px 8px', fontSize: '11px' }}>
                                    {previewDoc.category}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setPreviewDoc(null)} className="admin-btn" style={{ background: 'none', border: '1px solid var(--line)', color: 'var(--white)', width: 'auto', padding: '8px 16px', boxShadow: 'none' }}>
                                    Cancel
                                </button>
                                {!isViewOnly && (
                                    <>
                                        <button onClick={handleSavePreview} className="admin-btn" style={{ background: 'var(--line-soft)', border: '1px solid var(--line)', color: 'var(--white)', width: 'auto', padding: '8px 16px', boxShadow: 'none' }}>
                                            Save Draft
                                        </button>
                                        <button onClick={() => handleApproveAndIndex(previewDoc.id, previewDoc.extracted_text)} className="admin-btn" style={{ width: 'auto', padding: '8px 16px' }}>
                                            Approve & Index
                                            <ArrowRight className="w-4 h-4" />
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