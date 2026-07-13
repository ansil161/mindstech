import React, { useState, useEffect } from 'react';
import { documentApi } from '../../api/documentApi';

const DocumentManager = () => {
    const [documents, setDocuments] = useState([]);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewDoc, setPreviewDoc] = useState(null);

    const categories = ['HR', 'Products', 'Policies', 'Documentation', 'FAQ'];

    const fetchDocuments = async () => {
        try {
            const data = await documentApi.getDocuments();
            setDocuments(data);
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
        e.preventDefault();
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
        try {
            await documentApi.updateDocument(previewDoc.id, { extracted_text: previewDoc.extracted_text });
            alert("Saved successfully");
            fetchDocuments();
        } catch (err) {
            alert("Failed to save changes");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Document Management (RAG)</h2>
            
            {/* Upload Form */}
            <form onSubmit={handleUpload} className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4">Upload New Document</h3>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input 
                        type="text" 
                        placeholder="Document Title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        className="border p-2 rounded"
                        required
                    />
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="border p-2 rounded"
                        required
                    >
                        <option value="">Select Category...</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input 
                        type="file" 
                        accept=".pdf,.docx,.txt,.md"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="border p-2 rounded"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {loading ? 'Uploading...' : 'Upload Document'}
                </button>
            </form>

            {/* Document List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map(doc => (
                            <tr key={doc.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{doc.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{doc.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${doc.status === 'Indexed' ? 'bg-green-100 text-green-800' : 
                                          doc.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                                          doc.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                                          'bg-blue-100 text-blue-800'}`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {(doc.status === 'Uploaded' || doc.status === 'Failed') && (
                                        <button onClick={() => handleParse(doc.id)} className="text-blue-600 hover:text-blue-900">Parse</button>
                                    )}
                                    {doc.status === 'Pending Review' && (
                                        <>
                                            <button onClick={() => setPreviewDoc(doc)} className="text-indigo-600 hover:text-indigo-900">Preview/Edit</button>
                                            <button onClick={() => handleIndex(doc.id)} className="text-green-600 hover:text-green-900">Index</button>
                                        </>
                                    )}
                                    <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-3/4 max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold mb-4">Preview: {previewDoc.title}</h3>
                        <textarea 
                            className="flex-grow w-full border p-4 mb-4 rounded font-mono text-sm min-h-[400px]"
                            value={previewDoc.extracted_text || ''}
                            onChange={(e) => setPreviewDoc({...previewDoc, extracted_text: e.target.value})}
                        />
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setPreviewDoc(null)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                            <button onClick={handleSavePreview} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                            <button onClick={() => handleIndex(previewDoc.id)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Index Document</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentManager;
