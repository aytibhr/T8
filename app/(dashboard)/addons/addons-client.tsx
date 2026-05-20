'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { SuccessModal } from '@/components/ui/success-modal';
import { Plus, Search, Trash2, Edit2, CupSoda, IndianRupee, X, AlertTriangle } from 'lucide-react';
import { createAddon, updateAddon, deleteAddon } from './actions';
import { useNotifications } from '@/lib/hooks/useNotifications';

/* ─── confirm modal ─── */
function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'CONFIRM', confirmColor = '#ff00ea' }: any) {
  return (
    <Modal open={open} onClose={onClose} title={title} borderColor={confirmColor}>
      <p className="text-gray-300 font-mono text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <Button onClick={onClose} variant="outline" className="flex-1 border-gray-700 text-gray-400">CANCEL</Button>
        <Button onClick={onConfirm} className="flex-1 text-white font-pixel text-xs" style={{ backgroundColor: confirmColor, border: 'none' }}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

export function AddonsClient({ initialAddons }: { initialAddons: any[] }) {
  const [addons, setAddons] = useState(initialAddons);
  const [searchQuery, setSearchQuery] = useState('');
  const { addNotification } = useNotifications();

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [selectedAddon, setSelectedAddon] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const filteredAddons = addons.filter(addon => 
    addon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice.trim()) {
      addNotification({ type: 'error', title: 'Invalid Input', message: 'Please fill in all fields.' });
      return;
    }
    const priceNum = parseInt(newPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      addNotification({ type: 'error', title: 'Invalid Price', message: 'Price must be a valid positive number.' });
      return;
    }

    setLoading(true);
    try {
      await createAddon({ name: newName, price: priceNum });
      addNotification({ type: 'success', title: 'Addon Created', message: `${newName} has been added to catalog.` });
      // Reload page data or update state
      setAddons(prev => [...prev, { id: Date.now(), name: newName, price: priceNum }].sort((a,b) => a.name.localeCompare(b.name)));
      setNewName('');
      setNewPrice('');
      setAddModalOpen(false);
      // Wait for server path revalidation, let's just trigger window reload to sync properly if needed or let Next.js handle it
      window.location.reload();
    } catch (e: any) {
      addNotification({ type: 'error', title: 'Error', message: e.message });
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddon) return;
    if (!newName.trim() || !newPrice.trim()) {
      addNotification({ type: 'error', title: 'Invalid Input', message: 'Please fill in all fields.' });
      return;
    }
    const priceNum = parseInt(newPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      addNotification({ type: 'error', title: 'Invalid Price', message: 'Price must be a valid positive number.' });
      return;
    }

    setLoading(true);
    try {
      await updateAddon(selectedAddon.id, { name: newName, price: priceNum });
      addNotification({ type: 'success', title: 'Addon Updated', message: `${newName} has been updated.` });
      setNewName('');
      setNewPrice('');
      setSelectedAddon(null);
      setEditModalOpen(false);
      window.location.reload();
    } catch (e: any) {
      addNotification({ type: 'error', title: 'Error', message: e.message });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedAddon) return;
    setLoading(true);
    try {
      await deleteAddon(selectedAddon.id);
      addNotification({ type: 'success', title: 'Addon Deleted', message: `${selectedAddon.name} removed from catalog.` });
      setSelectedAddon(null);
      setDeleteModalOpen(false);
      window.location.reload();
    } catch (e: any) {
      addNotification({ type: 'error', title: 'Error', message: e.message });
    }
    setLoading(false);
  };

  const openEditModal = (addon: any) => {
    setSelectedAddon(addon);
    setNewName(addon.name);
    setNewPrice(String(addon.price));
    setEditModalOpen(true);
  };

  const openDeleteModal = (addon: any) => {
    setSelectedAddon(addon);
    setDeleteModalOpen(true);
  };

  return (
    <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider">ADDONS MANAGER</h1>
          <p className="text-gray-400 mt-1 font-mono text-xs">Create and manage custom snacks, drinks, and merchandise.</p>
        </div>
        <Button 
          onClick={() => { setNewName(''); setNewPrice(''); setAddModalOpen(true); }} 
          className="bg-[#00ff55] hover:bg-[#00cc44] text-black font-pixel text-xs py-4 px-6 border-none"
        >
          <Plus className="w-4 h-4 mr-2" /> ADD NEW PRODUCT
        </Button>
      </div>

      {/* Catalog search and count */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-[#0a0a1a] border border-gray-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Search products..." 
            className="pl-10 bg-[#0f1026] border-gray-700 text-white font-mono text-sm"
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>
        <p className="text-gray-500 font-mono text-xs">{filteredAddons.length} products listed</p>
      </div>

      {/* Addon Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredAddons.length === 0 ? (
          <div className="col-span-full bg-[#0a0a1a] border border-gray-800 rounded-xl p-12 text-center">
            <CupSoda className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-40 animate-pulse" />
            <p className="text-gray-400 font-mono text-sm">No products found. Start by adding one!</p>
          </div>
        ) : filteredAddons.map(addon => (
          <div key={addon.id} className="bg-[#0a0a1a] border-2 border-gray-800 rounded-xl p-5 hover:border-[#00f3ff]/40 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-[#0f1026] p-2.5 rounded-lg border border-gray-800 group-hover:border-[#00f3ff]/20">
                  <CupSoda className="w-5 h-5 text-[#00f3ff] group-hover:animate-bounce" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-600 font-mono">PRODUCT ID</span>
                  <p className="text-gray-400 font-mono text-xs font-bold">#AD-{addon.id}</p>
                </div>
              </div>
              <h3 className="font-orbitron text-white text-base font-bold mb-1 truncate">{addon.name}</h3>
              <div className="flex items-center gap-1 mb-6">
                <IndianRupee className="w-3.5 h-3.5 text-[#00ff55]" />
                <span className="font-pixel text-lg text-[#00ff55]">{addon.price}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800/50 flex gap-2">
              <Button 
                onClick={() => openEditModal(addon)}
                variant="outline" 
                className="flex-1 border-gray-700 text-gray-300 font-mono text-xs py-3.5"
              >
                <Edit2 className="w-3 h-3 mr-1 text-[#00f3ff]" /> EDIT
              </Button>
              <Button 
                onClick={() => openDeleteModal(addon)}
                className="flex-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 hover:border-none font-mono text-xs py-3.5"
              >
                <Trash2 className="w-3 h-3 mr-1" /> DELETE
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Add Product Modal ─── */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="ADD PRODUCT" borderColor="#00ff55">
        <form onSubmit={handleCreate} className="space-y-4 font-mono">
          <div>
            <label className="block text-[#00ff55] text-xs mb-1 uppercase">Product Name</label>
            <Input 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              className="bg-[#0f1026] border-gray-700 text-white" 
              placeholder="e.g. Mountain Dew, Lays Chips" 
              required 
            />
          </div>
          <div>
            <label className="block text-[#00f3ff] text-xs mb-1 uppercase">Price (₹)</label>
            <Input 
              type="number" 
              value={newPrice} 
              onChange={e => setNewPrice(e.target.value)} 
              className="bg-[#0f1026] border-gray-700 text-white" 
              placeholder="Price in INR" 
              required 
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={() => setAddModalOpen(false)} variant="outline" className="flex-1 border-gray-700 text-gray-400">CANCEL</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#00ff55] hover:bg-[#00cc44] text-black font-pixel text-xs border-none">
              {loading ? 'CREATING...' : 'ADD TO CATALOG'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Product Modal ─── */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="EDIT PRODUCT" borderColor="#00f3ff">
        <form onSubmit={handleUpdate} className="space-y-4 font-mono">
          <div>
            <label className="block text-[#00f3ff] text-xs mb-1 uppercase">Product Name</label>
            <Input 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              className="bg-[#0f1026] border-gray-700 text-white" 
              placeholder="Product Name" 
              required 
            />
          </div>
          <div>
            <label className="block text-[#ff00ea] text-xs mb-1 uppercase">Price (₹)</label>
            <Input 
              type="number" 
              value={newPrice} 
              onChange={e => setNewPrice(e.target.value)} 
              className="bg-[#0f1026] border-gray-700 text-white" 
              placeholder="Price in INR" 
              required 
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={() => setEditModalOpen(false)} variant="outline" className="flex-1 border-gray-700 text-gray-400">CANCEL</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#00f3ff] hover:bg-[#00ccdd] text-black font-pixel text-xs border-none">
              {loading ? 'SAVING...' : 'SAVE CHANGES'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirm Modal ─── */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="DELETE PRODUCT"
        message={`Are you sure you want to delete ${selectedAddon?.name}? This action is irreversible.`}
        confirmLabel="YES, DELETE"
        confirmColor="#ef4444"
      />
    </main>
  );
}
