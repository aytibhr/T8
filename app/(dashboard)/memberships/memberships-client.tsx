'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, UserPlus, Crown, Zap, X, History, Edit3, Trash2, Repeat, IndianRupee, Clock, Coins, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createOrUpdateMember, updatePlan, getMemberTransactions } from './actions';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Modal } from '@/components/ui/modal';
import { SuccessModal } from '@/components/ui/success-modal';
import { WA_TEMPLATES } from '@/lib/utils/whatsapp';



export function MembershipsClient({ initialPlans, initialMembers }: { initialPlans: any[], initialMembers: any[] }) {
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ open: boolean; title: string; message: string; waPhone?: string; waMessage?: string }>({ open: false, title: '', message: '' });

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPlanId, setFormPlanId] = useState<number>(initialPlans[0]?.id || 1);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);

  // Plan Edit states
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planPrice, setPlanPrice] = useState(0);
  const [planCoins, setPlanCoins] = useState(0);
  const [planHours, setPlanHours] = useState(0);

  // Txn History state
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberTxns, setMemberTxns] = useState<any[]>([]);

  // Suggestions logic
  const phoneSuggestions = useMemo(() => {
    if (formPhone.length < 2) return [];
    return initialMembers.filter(m => m.phone.includes(formPhone)).slice(0, 5);
  }, [formPhone, initialMembers]);

  // Exact match logic for "Existing Member" badge
  const matchedMember = useMemo(() => {
    return initialMembers.find(m => m.phone === formPhone);
  }, [formPhone, initialMembers]);

  const filteredMembers = initialMembers.filter(m =>
    m.phone.includes(searchQuery) || m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOnboard = async () => {
    if (!formName || !formPhone || !formPlanId) { setErrorMsg('Please fill all fields.'); return; }
    setLoading(true);
    try {
      const plan = initialPlans.find(p => p.id === formPlanId);
      await createOrUpdateMember({ name: formName, phone: formPhone, planId: formPlanId });
      
      const waMessage = WA_TEMPLATES.MEMBERSHIP_WELCOME({
        name: formName,
        planName: plan?.name || 'Membership',
        price: plan?.price || 0,
        coins: plan?.creditsValue || 0,
        hours: plan?.hoursIncluded || 0
      });

      const isRenewal = !!matchedMember;
      setShowAddModal(false); 
      setFormName(''); 
      setFormPhone(''); 
      setErrorMsg('');
      setSuccessData({
        open: true,
        title: isRenewal ? 'PLAN RENEWED' : 'WELCOME TO TERMINAL 8',
        message: `${formName} ${isRenewal ? 'top-up' : 'onboarding'} successful.`,
        waPhone: formPhone,
        waMessage: waMessage
      });
      addNotification({ 
        type: 'success', 
        title: isRenewal ? 'Plan Renewed' : 'Member Onboarded', 
        message: `${formName} ${isRenewal ? 'successfully topped up.' : 'is now a VIP member.'}` 
      });
    } catch (e: any) { setErrorMsg(e.message); }
    setLoading(false);
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    setLoading(true);
    try {
      await updatePlan({
        id: editingPlan.id,
        price: planPrice,
        creditsValue: planCoins,
        hoursIncluded: planHours
      });
      setShowPlanModal(false);
      addNotification({ type: 'success', title: 'Plan Updated', message: `${editingPlan.name} modified successfully.` });
    } catch (e: any) { addNotification({ type: 'error', title: 'Error', message: e.message }); }
    setLoading(false);
  };

  const openTxnHistory = async (member: any) => {
    setSelectedMember(member);
    setShowTxnModal(true);
    setMemberTxns([]);
    const txns = await getMemberTransactions(member.phone);
    setMemberTxns(txns);
  };

  return (
    <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider">MEMBERSHIPS</h1>
          <p className="text-gray-400 mt-2 font-mono text-sm">Manage VIP plans, onboard members, and track T8 Coins.</p>
        </div>
        <Button 
          onClick={() => {
            setFormPhone('');
            setFormName('');
            setFormPlanId(initialPlans[0]?.id);
            setShowAddModal(true);
          }}
          className="bg-[#ff00ea] hover:bg-transparent border-2 border-[#ff00ea] text-white hover:text-[#ff00ea] shadow-[0_0_10px_rgba(255,0,234,0.3)] transition-all rounded-none font-pixel text-xs px-4 py-6"
        >
          <UserPlus className="mr-2 h-4 w-4" /> ONBOARD / TOP-UP
        </Button>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {initialPlans.map((plan, i) => {
          const colors = ['#c0c0c0', '#ffea00', '#00f3ff'];
          const color = colors[i % colors.length];
          return (
            <div key={plan.id} className="bg-[#0f1026] border rounded-xl p-6 relative group overflow-hidden" style={{ borderColor: `${color}40` }}>
              <div className="absolute -right-6 -top-6 opacity-10">
                <Crown size={120} color={color} />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <h3 className="text-2xl font-orbitron font-bold mb-2 uppercase" style={{ color: color }}>{plan.name}</h3>
                <button 
                  onClick={() => {
                    setEditingPlan(plan);
                    setPlanPrice(plan.price);
                    setPlanCoins(plan.creditsValue);
                    setPlanHours(plan.hoursIncluded);
                    setShowPlanModal(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded transition-all"
                >
                  <Edit3 className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              </div>

              <div className="text-4xl font-pixel text-white mb-4">₹{plan.price}</div>
              <div className="space-y-3 font-mono text-sm text-gray-300 relative z-10">
                <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-[#00ff55]" /> {plan.hoursIncluded} Hours Included</p>
                <p className="flex items-center"><Coins className="w-4 h-4 mr-2 text-[#ffea00]" /> {plan.creditsValue} T8 Coins</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Members Table */}
      <div className="bg-[#0a0a1a] border border-gray-800 rounded-xl overflow-hidden">
      <SuccessModal 
        open={successData.open} 
        onClose={() => setSuccessData({ ...successData, open: false })}
        title={successData.title}
        message={successData.message}
        waPhone={successData.waPhone}
        waMessage={successData.waMessage}
      />
        <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-orbitron text-white">ACTIVE VIP MEMBERS</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search Name or Phone..." 
              className="pl-10 bg-[#0f1026] border-gray-700 text-white font-mono"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead className="bg-[#0f1026] text-gray-400">
              <tr>
                <th className="p-4 border-b border-gray-800">MEMBER ID</th>
                <th className="p-4 border-b border-gray-800">NAME</th>
                <th className="p-4 border-b border-gray-800">PHONE</th>
                <th className="p-4 border-b border-gray-800">PLAN</th>
                <th className="p-4 border-b border-gray-800">T8 COINS</th>
                <th className="p-4 border-b border-gray-800">VALID UNTIL</th>
                <th className="p-4 border-b border-gray-800 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? filteredMembers.map((m, idx) => (
                <tr key={idx} className="border-b border-gray-800/50 hover:bg-[#0f1026]/50 transition-colors">
                  <td className="p-4 text-[#00f3ff]">M-{m.id}</td>
                  <td className="p-4 text-white font-bold">{m.name}</td>
                  <td className="p-4 text-gray-300">{m.phone}</td>
                  <td className="p-4 text-gray-300">
                    <span className={`px-2 py-1 rounded text-xs border uppercase ${
                      m.planName?.includes('SILVER') ? 'bg-gray-800 text-gray-300 border-gray-500' :
                      m.planName?.includes('GOLD') ? 'bg-[#ffea00]/20 text-[#ffea00] border-[#ffea00]/50' :
                      'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff]/50'
                    }`}>{m.planName || 'NO PLAN'}</span>
                  </td>
                  <td className="p-4 text-xl text-[#ffea00] font-pixel">{m.coinsBalance}</td>
                  <td className="p-4 text-gray-400">{m.validUntil ? new Date(m.validUntil).toISOString().split('T')[0] : 'N/A'}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openTxnHistory(m)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                      title="Transaction History"
                    >
                      <History className="w-4 h-4 text-gray-400 group-hover:text-[#00f3ff]" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard / Top-up Modal */}
      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); setErrorMsg(''); }} title="ONBOARD / TOP-UP MEMBER">
        <div className="space-y-4 font-mono">
          <div className="relative">
            <label className="block text-[#ff00ea] text-xs mb-1 uppercase">Phone Number</label>
            <Input 
              value={formPhone} 
              onChange={e => { setFormPhone(e.target.value); setShowPhoneSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowPhoneSuggestions(false), 200)}
              className="bg-[#0f1026] border-gray-700 text-white" 
              placeholder="Enter number..." 
            />
            {/* Suggestions Dropdown */}
            {showPhoneSuggestions && phoneSuggestions.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-[#0a0a1a] border border-[#ff00ea]/50 rounded-lg shadow-xl overflow-hidden">
                {phoneSuggestions.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setFormPhone(m.phone);
                      setFormName(m.name);
                      setShowPhoneSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#ff00ea]/10 text-white text-xs flex justify-between items-center transition-colors border-b border-gray-800 last:border-none"
                  >
                    <span>{m.phone}</span>
                    <span className="text-gray-500 italic">{m.name}</span>
                  </button>
                ))}
              </div>
            )}
            {matchedMember && (
              <div className="mt-1 text-[10px] text-[#00ff55] font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" /> REGISTERED VIP MEMBER
              </div>
            )}
          </div>
          <div>
            <label className="block text-[#ff00ea] text-xs mb-1 uppercase">Full Name</label>
            <Input 
              value={formName} 
              onChange={e => setFormName(e.target.value)} 
              className="bg-[#0f1026] border-gray-700 text-white" 
              placeholder="John Doe" 
            />
          </div>
          <div>
            <label className="block text-[#ff00ea] text-xs mb-1 uppercase">Select Plan</label>
            <select value={formPlanId} onChange={e => setFormPlanId(Number(e.target.value))} className="w-full bg-[#0f1026] border border-gray-700 text-white rounded p-2 text-sm">
              {initialPlans.map((plan: any) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} (₹{plan.price} / {plan.creditsValue} Coins)
                </option>
              ))}
            </select>
          </div>
          {errorMsg && <p className="text-[#ff00ea] text-xs font-bold">⚠ {errorMsg}</p>}
          
          <div className="p-3 bg-[#1a1b3a] border border-[#ff00ea]/30 rounded flex justify-between items-end">
             <div>
               <p className="text-gray-400 text-[10px] mb-1">DUE AMOUNT</p>
               <p className="text-2xl font-pixel text-[#00ff55]">₹{initialPlans.find(p => p.id === formPlanId)?.price || 0}</p>
             </div>
             {matchedMember && (
               <div className="text-right">
                 <p className="text-gray-400 text-[10px] mb-1">CURRENT BALANCE</p>
                 <p className="text-xl font-pixel text-[#ffea00]">{matchedMember.coinsBalance} COINS</p>
               </div>
             )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => { setShowAddModal(false); setErrorMsg(''); }} variant="outline" className="flex-1 border-gray-700 text-gray-400">CANCEL</Button>
            <Button onClick={handleOnboard} disabled={loading} className="flex-1 bg-[#ff00ea] hover:bg-[#cc00bb] text-white font-pixel text-xs border-none shadow-[0_0_15px_rgba(255,0,234,0.3)]">
              {loading ? 'PROCESSING...' : (matchedMember ? 'RENEW & TOP UP' : 'CREATE MEMBER')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Plan Edit Modal */}
      <Modal open={showPlanModal} onClose={() => setShowPlanModal(false)} title={`Edit Plan: ${editingPlan?.name}`} borderColor="#ffea00">
        <div className="space-y-4 font-mono">
          <div>
            <label className="block text-[#ffea00] text-xs mb-1">PRICE (₹)</label>
            <Input type="number" value={planPrice} onChange={e => setPlanPrice(Number(e.target.value))} className="bg-[#0f1026] border-gray-700 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#ffea00] text-xs mb-1">COINS</label>
              <Input type="number" value={planCoins} onChange={e => setPlanCoins(Number(e.target.value))} className="bg-[#0f1026] border-gray-700 text-white" />
            </div>
            <div>
              <label className="block text-[#ffea00] text-xs mb-1">HOURS</label>
              <Input type="number" value={planHours} onChange={e => setPlanHours(Number(e.target.value))} className="bg-[#0f1026] border-gray-700 text-white" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={() => setShowPlanModal(false)} variant="outline" className="flex-1 border-gray-700 text-gray-400">CANCEL</Button>
            <Button onClick={handleUpdatePlan} disabled={loading} className="flex-1 bg-[#ffea00] hover:bg-[#ccbb00] text-black font-pixel text-xs border-none">
              {loading ? 'SAVING...' : 'SAVE CHANGES'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Transaction History Modal */}
      <Modal open={showTxnModal} onClose={() => setShowTxnModal(false)} title={`History: ${selectedMember?.name}`} borderColor="#00f3ff">
        <div className="space-y-4 font-mono">
          {memberTxns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
               <History className="w-12 h-12 mb-2 opacity-20" />
               <p className="text-xs italic">No transactions found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {memberTxns.map((txn, idx) => (
                <div key={idx} className="bg-[#0f1026] border border-gray-800 p-3 rounded flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase ${
                        txn.transactionType === 'Top-up' || txn.transactionType === 'Membership Purchase' ? 'bg-[#00ff55]/20 text-[#00ff55]' : 'bg-[#ff00ea]/20 text-[#ff00ea]'
                      }`}>
                        {txn.transactionType}
                      </span>
                      <span className="text-gray-500 text-[10px]">{new Date(txn.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white text-[10px] opacity-70">{new Date(txn.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    {txn.amountCash > 0 && <p className="text-[#00ff55] font-bold">₹{txn.amountCash}</p>}
                    {txn.amountCreditsUsed > 0 && <p className="text-[#ff00ea] font-pixel text-[10px]">-{txn.amountCreditsUsed} Coins</p>}
                    {(txn.transactionType === 'Top-up' || txn.transactionType === 'Membership Purchase') && (
                       <p className="text-[#ffea00] text-[9px] font-bold">+ CREDITS</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button onClick={() => setShowTxnModal(false)} variant="outline" className="w-full border-gray-800 text-gray-400 mt-4 font-pixel text-[10px] py-4">CLOSE</Button>
        </div>
      </Modal>
    </main>
  );
}
