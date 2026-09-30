import React, { useState } from 'react';
import { Category, TransactionType, Transaction } from '../types';
import { X, Plus, Edit2, Trash2, Check, ArrowDownLeft, ArrowUpRight, Tags } from 'lucide-react';

interface CategoriesModalProps {
  isOpen: boolean;
  categories: Category[];
  transactions: Transaction[];
  onClose: () => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  categories,
  transactions,
  onClose,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<TransactionType>('IN');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isOpen) return null;

  const currentCategories = categories.filter((c) => c.type === activeTab);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    onAddCategory({
      name: newCategoryName.trim(),
      type: activeTab,
      color: activeTab === 'IN' ? '#10b981' : '#ef4444',
      isDefault: false,
    });

    setNewCategoryName('');
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateCategory(id, editName.trim());
    setEditingId(null);
    setEditName('');
  };

  // Count how many transactions use this category
  const getUsageCount = (catName: string, type: TransactionType) => {
    return transactions.filter((t) => t.category === catName && t.type === type).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs transition-opacity overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Tags className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Kelola Kategori
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Atur pos kas masuk dan pos pengeluaran
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Segmented Tab: Kas Masuk vs Kas Keluar */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 my-3 text-xs">
          <button
            onClick={() => setActiveTab('IN')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition ${
              activeTab === 'IN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>Kategori Kas Masuk</span>
          </button>
          <button
            onClick={() => setActiveTab('OUT')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition ${
              activeTab === 'OUT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Kategori Kas Keluar</span>
          </button>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder={`Tambah pos ${activeTab === 'IN' ? 'kas masuk' : 'pengeluaran'} baru...`}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newCategoryName.trim()}
            className="flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition active:scale-95 dark:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah</span>
          </button>
        </form>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {currentCategories.map((cat) => {
            const usage = getUsageCount(cat.name, cat.type);
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50"
              >
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 dark:bg-slate-700 dark:text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || (activeTab === 'IN' ? '#10b981' : '#ef4444') }}
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({usage} transaksi)
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition"
                        title="Edit Nama"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (usage > 0) {
                            if (
                              !window.confirm(
                                `Kategori ini sedang digunakan oleh ${usage} transaksi. Yakin ingin menghapusnya?`
                              )
                            ) {
                              return;
                            }
                          }
                          onDeleteCategory(cat.id);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
