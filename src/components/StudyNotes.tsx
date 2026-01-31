import { useState, useRef } from 'react';
import { StudyNote } from '../types';
import { Plus, BookOpen, Tag, Trash2, ChevronDown, ChevronUp, Paperclip, Image as ImageIcon, FileText, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface StudyNotesProps {
    notes: StudyNote[];
    onNotesUpdate: () => void;
}

export function StudyNotes({ notes, onNotesUpdate }: StudyNotesProps) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        tags: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedNote, setExpandedNote] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let mediaUrl = null;
            let mediaType = null;
            let mediaName = null;

            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('study-materials')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('study-materials')
                    .getPublicUrl(fileName);

                mediaUrl = publicUrl;
                mediaType = file.type;
                mediaName = file.name;
            }

            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

            const { error } = await supabase.from('study_notes').insert({
                user_id: user.id,
                title: formData.title,
                content: formData.content,
                category: formData.category,
                tags: tagsArray,
                media_url: mediaUrl,
                media_type: mediaType,
                media_name: mediaName,
            });

            if (error) throw error;

            setFormData({
                title: '',
                content: '',
                category: 'General',
                tags: '',
            });
            setFile(null);
            setShowForm(false);
            onNotesUpdate();
        } catch (error) {
            console.error('Error adding note:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (noteId: string) => {
        try {
            // Also delete file from storage if exists (implementation simplified to just DB delete for now as getting path requires parsing URL)
            const { error } = await supabase.from('study_notes').delete().eq('id', noteId);
            if (error) throw error;
            onNotesUpdate();
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedNote(expandedNote === id ? null : id);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const isImage = (type?: string) => type?.startsWith('image/');

    return (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-purple-400" />
                        Study Notes
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Capture your learning journey
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-4 py-2 ${showForm ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-purple-500/10 text-purple-400 border-purple-500/30'} border rounded-xl font-medium transition-all`}
                >
                    {showForm ? 'Close' : (
                        <>
                            <Plus className="w-4 h-4" />
                            Add Note
                        </>
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0, mb: 0 }}
                        animate={{ opacity: 1, height: 'auto', mb: 24 }}
                        exit={{ opacity: 0, height: 0, mb: 0 }}
                        onSubmit={handleSubmit}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-gray-800/30 rounded-2xl border border-white/5 space-y-3">
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Title"
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                required
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="Category (e.g. React)"
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                />
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="Tags (comma separated)"
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                />
                            </div>

                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Write your notes here..."
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                                required
                            />

                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    ref={fileInputRef}
                                    accept="image/*,application/pdf"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm transition-colors text-white"
                                >
                                    <Paperclip className="w-4 h-4" />
                                    {file ? 'Change File' : 'Attach File'}
                                </button>
                                {file && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30">
                                        <span className="text-xs text-purple-300 truncate max-w-[200px]">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFile(null)}
                                            className="text-purple-400 hover:text-purple-200"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 shadow-lg shadow-purple-900/20"
                            >
                                {loading ? 'Adding...' : 'Add Note'}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-4 relative z-10">
                {notes.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No notes yet.</p>
                    </div>
                ) : (
                    notes.map(note => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={note.id}
                            className="group p-5 bg-gray-800/30 border border-white/5 hover:border-white/10 hover:bg-gray-800/50 rounded-2xl transition-all"
                        >
                            <div
                                className="flex justify-between items-start cursor-pointer"
                                onClick={() => toggleExpand(note.id)}
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded">{note.category}</span>
                                        <span className="text-gray-600 text-xs">•</span>
                                        <span className="text-gray-500 text-xs">{new Date(note.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                                        {note.title}
                                        {note.media_url && (
                                            <span className="text-gray-500">
                                                {isImage(note.media_type) ? (
                                                    <ImageIcon className="w-4 h-4" />
                                                ) : (
                                                    <Paperclip className="w-4 h-4" />
                                                )}
                                            </span>
                                        )}
                                    </h3>

                                    {/* Preview logic */}
                                    {expandedNote !== note.id && (
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-2 leading-relaxed">
                                            {note.content}
                                        </p>
                                    )}

                                    {/* Tags always visible to fit 'database' feel */}
                                    {note.tags && note.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {note.tags.map(tag => (
                                                <div key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-gray-700/50 border border-gray-600/30 rounded text-gray-300 text-[10px]">
                                                    <Tag className="w-3 h-3" />
                                                    {tag}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(note.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    {expandedNote === note.id ?
                                        <ChevronUp className="w-5 h-5 text-gray-500" /> :
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    }
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedNote === note.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 pt-4 border-t border-white/5 text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {note.content}
                                        </div>

                                        {note.media_url && (
                                            <div className="mt-4">
                                                {isImage(note.media_type) ? (
                                                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                                                        <img src={note.media_url} alt={note.media_name || 'Note attachment'} className="max-w-full h-auto max-h-[400px] object-contain mx-auto" />
                                                    </div>
                                                ) : (
                                                    <a
                                                        href={note.media_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 bg-gray-900/50 border border-white/10 rounded-xl hover:bg-gray-800/50 transition-colors group/file"
                                                    >
                                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-white truncate">{note.media_name || 'Attachment'}</p>
                                                            <p className="text-xs text-gray-500">Click to view file</p>
                                                        </div>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        {/* Tags removed from here as they are now top-level */}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
