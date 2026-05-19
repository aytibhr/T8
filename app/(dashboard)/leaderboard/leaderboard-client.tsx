'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Trophy, Edit, X, ShieldAlert, Sparkles } from 'lucide-react';
import { createLeaderboardEntry, updateLeaderboardEntry, deleteLeaderboardEntry } from './actions';
import { useNotifications } from '@/lib/hooks/useNotifications';

function Modal({ open, onClose, title, borderColor = '#00f3ff', children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a1a] rounded-xl w-full max-w-md shadow-2xl overflow-hidden" style={{ border: `2px solid ${borderColor}` }}>
        <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-[#070712]">
          <h2 className="font-orbitron text-white text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: borderColor }} />
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function LeaderboardClient({ initialEntries }: { initialEntries: any[] }) {
  const { addNotification } = useNotifications();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; entry: any }>({ open: false, entry: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; entry: any }>({ open: false, entry: null });

  // Form State
  const [formRank, setFormRank] = useState(1);
  const [formPlayerName, setFormPlayerName] = useState('');
  const [formGamerTag, setFormGamerTag] = useState('');
  const [formGameName, setFormGameName] = useState('');
  const [formScore, setFormScore] = useState(0);
  const [formPointsType, setFormPointsType] = useState('XP');
  const [formFormattedScore, setFormFormattedScore] = useState('');
  const [formPlatform, setFormPlatform] = useState('PS5');
  const [formRankTier, setFormRankTier] = useState('Gold');

  const handleAdd = async () => {
    if (!formPlayerName || !formGamerTag || !formGameName || !formFormattedScore) {
      addNotification({ type: 'error', title: 'Validation Error', message: 'Please fill in all required fields.' });
      return;
    }

    try {
      await createLeaderboardEntry({
        rank: formRank,
        playerName: formPlayerName,
        gamerTag: formGamerTag,
        gameName: formGameName,
        score: formScore,
        pointsType: formPointsType,
        formattedScore: formFormattedScore,
        platform: formPlatform,
        rankTier: formRankTier,
      });

      setAddModal(false);
      resetForm();
      addNotification({ type: 'success', title: 'Player Ranked', message: `${formGamerTag} has joined the leaderboard.` });
    } catch (err) {
      console.error(err);
      addNotification({ type: 'error', title: 'Error', message: 'Failed to create entry.' });
    }
  };

  const handleEdit = async () => {
    if (!formPlayerName || !formGamerTag || !formGameName || !formFormattedScore) {
      addNotification({ type: 'error', title: 'Validation Error', message: 'Please fill in all required fields.' });
      return;
    }

    try {
      await updateLeaderboardEntry(editModal.entry.id, {
        rank: formRank,
        playerName: formPlayerName,
        gamerTag: formGamerTag,
        gameName: formGameName,
        score: formScore,
        pointsType: formPointsType,
        formattedScore: formFormattedScore,
        platform: formPlatform,
        rankTier: formRankTier,
      });

      setEditModal({ open: false, entry: null });
      resetForm();
      addNotification({ type: 'info', title: 'Leaderboard Updated', message: `Changes saved for ${formGamerTag}.` });
    } catch (err) {
      console.error(err);
      addNotification({ type: 'error', title: 'Error', message: 'Failed to update entry.' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLeaderboardEntry(deleteModal.entry.id);
      addNotification({ type: 'warning', title: 'Player Removed', message: `${deleteModal.entry.gamerTag} removed from leaderboard.` });
      setDeleteModal({ open: false, entry: null });
    } catch (err) {
      console.error(err);
      addNotification({ type: 'error', title: 'Error', message: 'Failed to delete entry.' });
    }
  };

  const resetForm = () => {
    setFormRank(initialEntries.length + 1);
    setFormPlayerName('');
    setFormGamerTag('');
    setFormGameName('');
    setFormScore(0);
    setFormPointsType('XP');
    setFormFormattedScore('');
    setFormPlatform('PS5');
    setFormRankTier('Gold');
  };

  const loadForm = (entry: any) => {
    setFormRank(entry.rank);
    setFormPlayerName(entry.playerName);
    setFormGamerTag(entry.gamerTag);
    setFormGameName(entry.gameName);
    setFormScore(entry.score);
    setFormPointsType(entry.pointsType);
    setFormFormattedScore(entry.formattedScore);
    setFormPlatform(entry.platform);
    setFormRankTier(entry.rankTier);
  };

  return (
    <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider">LEADERBOARD</h1>
          <p className="text-gray-400 mt-2 font-mono text-sm">Create, edit, and rank top players of the Gaming Cafe.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setAddModal(true);
          }}
          className="bg-[#00f3ff] hover:bg-transparent border-2 border-[#00f3ff] text-black hover:text-[#00f3ff] transition-all rounded-none font-pixel text-xs px-4 py-6"
        >
          <Plus className="mr-2 h-4 w-4" /> ADD PLAYER
        </Button>
      </div>

      <div className="bg-[#0f1026] border border-gray-800 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-[#070712] font-orbitron text-xs text-[#00f3ff] tracking-wider">
                <th className="p-4 text-center">RANK</th>
                <th className="p-4">GAMER</th>
                <th className="p-4">PLATFORM / GAME</th>
                <th className="p-4">SCORE</th>
                <th className="p-4 text-center">TIER</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 font-mono text-sm text-gray-300">
              {initialEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 font-mono">
                    No ranks logged yet. Level up top players now!
                  </td>
                </tr>
              ) : (
                initialEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        {entry.rank === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-[#ffea00]/20 border border-[#ffea00] text-[#ffea00] flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(255,234,0,0.3)]">
                            👑 1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="w-7 h-7 rounded-full bg-gray-400/20 border border-gray-400 text-gray-200 flex items-center justify-center font-bold text-xs">
                            🥈 2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="w-7 h-7 rounded-full bg-[#cd7f32]/20 border border-[#cd7f32] text-[#cd7f32] flex items-center justify-center font-bold text-xs">
                            🥉 3
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono">#{entry.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="text-white font-orbitron font-bold text-sm tracking-wide">
                          {entry.gamerTag}
                        </span>
                        <span className="block text-gray-500 text-xs mt-0.5">{entry.playerName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="text-[#00ff55] font-bold text-xs uppercase px-2 py-0.5 rounded bg-[#00ff55]/10 border border-[#00ff55]/20">
                          {entry.platform}
                        </span>
                        <span className="block text-gray-400 text-xs mt-1.5">{entry.gameName}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white font-mono">
                      {entry.formattedScore}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wide ${
                        entry.rankTier === 'Apex' || entry.rankTier === 'Diamond'
                          ? 'bg-[#ff00ea]/20 text-[#ff00ea] border border-[#ff00ea]/30'
                          : entry.rankTier === 'Platinum'
                          ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/30'
                          : entry.rankTier === 'Gold'
                          ? 'bg-[#ffea00]/20 text-[#ffea00] border border-[#ffea00]/30'
                          : 'bg-gray-800/80 text-gray-300 border border-gray-700/50'
                      }`}>
                        {entry.rankTier}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300 hover:text-[#ffea00] hover:border-[#ffea00] font-mono text-xs"
                          onClick={() => {
                            loadForm(entry);
                            setEditModal({ open: true, entry });
                          }}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-red-500 hover:bg-red-500/10 hover:border-red-500"
                          onClick={() => {
                            setDeleteModal({ open: true, entry });
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="ADD LEADERBOARD ENTRY" borderColor="#00f3ff">
        <div className="space-y-4 font-mono text-xs text-gray-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#00f3ff] mb-1">RANK (Number) *</label>
              <Input
                type="number"
                value={formRank}
                onChange={(e) => setFormRank(parseInt(e.target.value) || 1)}
                className="bg-[#0f1026] border-gray-700 text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-[#00f3ff] mb-1">PLATFORM *</label>
              <select
                value={formPlatform}
                onChange={(e) => setFormPlatform(e.target.value)}
                className="w-full bg-[#0f1026] border border-gray-700 rounded-md p-2 text-white h-10"
              >
                <option value="PS5">🎮 PS5 Station</option>
                <option value="Racing Sim">🏎️ Racing Sim</option>
                <option value="Billiards">🎱 Billiards</option>
                <option value="PC">🖥️ PC Gaming</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#00f3ff] mb-1">GAMER TAG (Handle) *</label>
            <Input
              value={formGamerTag}
              onChange={(e) => setFormGamerTag(e.target.value)}
              className="bg-[#0f1026] border-gray-700 text-white"
              placeholder="e.g. NinjaX"
            />
          </div>

          <div>
            <label className="block text-[#00f3ff] mb-1">PLAYER NAME (Real Name) *</label>
            <Input
              value={formPlayerName}
              onChange={(e) => setFormPlayerName(e.target.value)}
              className="bg-[#0f1026] border-gray-700 text-white"
              placeholder="e.g. Vishnu Prasad"
            />
          </div>

          <div>
            <label className="block text-[#00f3ff] mb-1">GAME NAME *</label>
            <Input
              value={formGameName}
              onChange={(e) => setFormGameName(e.target.value)}
              className="bg-[#0f1026] border-gray-700 text-white"
              placeholder="e.g. F1 23, FIFA 26, Valorant"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#00f3ff] mb-1">SCORE (Integer) *</label>
              <Input
                type="number"
                value={formScore}
                onChange={(e) => setFormScore(parseInt(e.target.value) || 0)}
                className="bg-[#0f1026] border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-[#00f3ff] mb-1">SCORE TYPE *</label>
              <select
                value={formPointsType}
                onChange={(e) => setFormPointsType(e.target.value)}
                className="w-full bg-[#0f1026] border border-gray-700 rounded-md p-2 text-white h-10"
              >
                <option value="XP">XP Points</option>
                <option value="Wins">Wins</option>
                <option value="Lap Time">Lap Time</option>
                <option value="Points">Points</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#00f3ff] mb-1">DISPLAY SCORE (Formatted) *</label>
            <Input
              value={formFormattedScore}
              onChange={(e) => setFormFormattedScore(e.target.value)}
              className="bg-[#0f1026] border-gray-700 text-white"
              placeholder="e.g. 1:12.450 / 25,300 XP / 42 Wins"
            />
          </div>

          <div>
            <label className="block text-[#00f3ff] mb-1">RANK TIER *</label>
            <select
              value={formRankTier}
              onChange={(e) => setFormRankTier(e.target.value)}
              className="w-full bg-[#0f1026] border border-gray-700 rounded-md p-2 text-white h-10"
            >
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Diamond">Diamond</option>
              <option value="Apex">Apex Challenger</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setAddModal(false)}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-400"
            >
              CANCEL
            </Button>
            <Button onClick={handleAdd} className="flex-1 bg-[#00f3ff] text-black font-pixel text-xs border-none">
              CREATE RANK
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal.open} onClose={() => setEditModal({ open: false, entry: null })} title="EDIT LEADERBOARD ENTRY" borderColor="#ffea00">
        <div className="space-y-4 font-mono text-xs text-gray-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#ffea00] mb-1">RANK (Number) *</label>
              <Input
                type="number"
                value={formRank}
                onChange={(e) => setFormRank(parseInt(e.target.value) || 1)}
                className="bg-[#0f1026] border-gray-700 text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-[#ffea00] mb-1">PLATFORM *</label>
              <select
                value={formPlatform}
                onChange={(e) => setFormPlatform(e.target.value)}
                className="w-full bg-[#0f1026] border border-gray-700 rounded-md p-2 text-white h-10"
              >
                <option value="PS5">🎮 PS5 Station</option>
                <option value="Racing Sim">🏎️ Racing Sim</option>
                <option value="Billiards">🎱 Billiards</option>
                <option value="PC">🖥️ PC Gaming</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#ffea00] mb-1">GAMER TAG (Handle) *</label>
            <Input
              value={formGamerTag}
              onChange={(e) => setFormGamerTag(e.target.value)}
              className="bg-[#0f1026] border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-[#ffea00] mb-1">PLAYER NAME (Real Name) *</label>
            <Input
              value={formPlayerName}
              onChange={(e) => setFormPlayerName(e.target.value)}
              className="bg-[#0f1026] border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-[#ffea00] mb-1">GAME NAME *</label>
            <Input
              value={formGameName}
              onChange={(e) => setFormGameName(e.target.value)}
              className="bg-[#0f1026] border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#ffea00] mb-1">SCORE (Integer) *</label>
              <Input
                type="number"
                value={formScore}
                onChange={(e) => setFormScore(parseInt(e.target.value) || 0)}
                className="bg-[#0f1026] border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-[#ffea00] mb-1">SCORE TYPE *</label>
              <select
                value={formPointsType}
                onChange={(e) => setFormPointsType(e.target.value)}
                className="w-full bg-[#0f1026] border border-gray-700 rounded-md p-2 text-white h-10"
              >
                <option value="XP">XP Points</option>
                <option value="Wins">Wins</option>
                <option value="Lap Time">Lap Time</option>
                <option value="Points">Points</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#ffea00] mb-1">DISPLAY SCORE (Formatted) *</label>
            <Input
              value={formFormattedScore}
              onChange={(e) => setFormFormattedScore(e.target.value)}
              className="bg-[#0f1026] border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-[#ffea00] mb-1">RANK TIER *</label>
            <select
              value={formRankTier}
              onChange={(e) => setFormRankTier(e.target.value)}
              className="w-full bg-[#0f1026] border border-gray-700 rounded-md p-2 text-white h-10"
            >
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Diamond">Diamond</option>
              <option value="Apex">Apex Challenger</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setEditModal({ open: false, entry: null })}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-400"
            >
              CANCEL
            </Button>
            <Button onClick={handleEdit} className="flex-1 bg-[#ffea00] text-black font-pixel text-xs border-none">
              SAVE CHANGES
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, entry: null })} title="DELETE ENTRY" borderColor="#ff0055">
        <div className="space-y-4 font-mono text-center">
          <ShieldAlert className="w-12 h-12 text-[#ff0055] mx-auto animate-bounce" />
          <p className="text-gray-300 text-sm">
            Permanently remove gamer <span className="text-white font-bold">{deleteModal.entry?.gamerTag}</span> (Rank #{deleteModal.entry?.rank}) from the public leaderboard?
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setDeleteModal({ open: false, entry: null })}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-400"
            >
              CANCEL
            </Button>
            <Button onClick={handleDelete} className="flex-1 bg-[#ff0055] text-white font-pixel text-xs border-none">
              DELETE RANK
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
