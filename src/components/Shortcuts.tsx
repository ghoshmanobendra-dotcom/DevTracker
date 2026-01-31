import { useState, useRef } from 'react';
import { Shortcut } from '../types';
import { Plus, Link as LinkIcon, FileText, Image, FileSpreadsheet, Trash2, X, File } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortcutsProps {
    shortcuts: Shortcut[];
    onShortcutsUpdate: () => void;
}

export function Shortcuts({ shortcuts, onShortcutsUpdate }: ShortcutsProps) {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'url' | 'file'>('url');
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewFile, setPreviewFile] = useState<{ url: string; type: string; title: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let value = url;
            let fileType = undefined;

            if (type === 'file' && file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('shortcuts')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('shortcuts')
                    .getPublicUrl(fileName);

                value = publicUrl;
                fileType = file.type;
            }

            const { error } = await supabase.from('shortcuts').insert({
                user_id: user.id,
                title,
                type,
                value,
                file_type: fileType,
            });

            if (error) throw error;

            setTitle('');
            setUrl('');
            setFile(null);
            setType('url');
            setShowForm(false);
            onShortcutsUpdate();
        } catch (error) {
            console.error('Error adding shortcut:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('shortcuts').delete().eq('id', id);
            if (error) throw error;
            onShortcutsUpdate();
        } catch (error) {
            console.error('Error deleting shortcut:', error);
        }
    };

    const getIcon = (shortcut: Shortcut) => {
        if (shortcut.type === 'url') {
            return (
                <img
                    src={`https://www.google.com/s2/favicons?sz=64&domain_url=${shortcut.value}`}
                    alt={shortcut.title}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                    }}
                />
            );
        }

        const type = shortcut.file_type?.toLowerCase() || '';
        if (type.includes('image')) return <Image className="w-5 h-5 text-purple-400" />;
        if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
        if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
        return <File className="w-5 h-5 text-gray-400" />;
    };

    const handleShortcutClick = (e: React.MouseEvent, shortcut: Shortcut) => {
        if (shortcut.type === 'file') {
            e.preventDefault();
            setPreviewFile({
                url: shortcut.value,
                type: shortcut.file_type || 'unknown',
                title: shortcut.title
            });
        }
    };

    return (
        <>
            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl w-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-blue-400" />
                        Learning Shortcuts
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(!showForm)}
                        className={`p-2 rounded-xl transition-all ${showForm
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                            }`}
                    >
                        {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.form
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            onSubmit={handleSubmit}
                            className="overflow-hidden"
                        >
                            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/5 space-y-3">
                                <div className="flex gap-2 p-1 bg-gray-900/50 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setType('url')}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${type === 'url' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('file')}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${type === 'file' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        File
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Title (e.g., Project Docs)"
                                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                                    required
                                />

                                {type === 'url' ? (
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                                        required
                                    />
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full px-3 py-8 border-2 border-dashed border-white/10 rounded-lg text-center cursor-pointer hover:border-blue-500/30 transition-colors bg-black/20 group"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        {file ? (
                                            <div className="flex items-center justify-center gap-2 text-blue-400">
                                                <File className="w-4 h-4" />
                                                <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 group-hover:text-blue-400 transition-colors">
                                                <Plus className="w-5 h-5 mx-auto mb-1" />
                                                <span className="text-xs">Click to upload</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : 'Add Shortcut'}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {shortcuts.map(shortcut => (
                        <motion.div
                            layout
                            key={shortcut.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group relative bg-gray-800/30 hover:bg-gray-800/50 border border-white/5 hover:border-blue-500/30 rounded-xl p-3 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        >
                            <a
                                href={shortcut.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => handleShortcutClick(e, shortcut)}
                                className="flex flex-col items-center text-center gap-2"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                                    {getIcon(shortcut)}
                                    {shortcut.type === 'url' && (
                                        <LinkIcon className="fallback-icon hidden w-5 h-5 text-blue-400 absolute" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-300 truncate w-full group-hover:text-white transition-colors">
                                    {shortcut.title}
                                </span>
                            </a>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(shortcut.id);
                                }}
                                className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all bg-gray-900/80 rounded-full"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </motion.div>
                    ))}

                    {shortcuts.length === 0 && !showForm && (
                        <div className="col-span-full text-center py-6 text-gray-500 text-sm">
                            No shortcuts yet.
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {previewFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setPreviewFile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    {previewFile.title}
                                </h3>
                                <button
                                    onClick={() => setPreviewFile(null)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 bg-black/50 p-1 overflow-auto flex items-center justify-center min-h-[300px]">
                                {previewFile.type.toLowerCase().includes('image') ? (
                                    <img
                                        src={previewFile.url}
                                        alt={previewFile.title}
                                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                                    />
                                ) : previewFile.type.toLowerCase().includes('pdf') ? (
                                    <iframe
                                        src={previewFile.url}
                                        className="w-full h-[80vh] rounded-lg"
                                        title={previewFile.title}
                                    />
                                ) : (
                                    <iframe
                                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewFile.url)}&embedded=true`}
                                        className="w-full h-[80vh] rounded-lg"
                                        title={previewFile.title}
                                    />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
