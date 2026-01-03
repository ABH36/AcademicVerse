import React, { useEffect, useState } from 'react';
import { getMySubscription, upgradePlan } from '../../services/subscriptionService';
import { Loader, CheckCircle, XCircle, CreditCard, Zap, Shield, Crown } from 'lucide-react';
import { toast } from 'react-toastify';

const SubscriptionPage = () => {
  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchSub();
  }, []);

  const fetchSub = async () => {
    try {
      const data = await getMySubscription();
      setSubData(data);
    } catch (error) {
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    if (!window.confirm(`Confirm upgrade to ${plan}? A mock invoice will be generated.`)) return;
    
    setUpgrading(true);
    try {
      await upgradePlan(plan);
      toast.success(`Welcome to ${plan} Plan! 🚀`);
      fetchSub(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upgrade Failed');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader className="animate-spin text-primary"/></div>;

  const { currentPlan, usage, details, expiry } = subData;

  // --- HELPER COMPONENTS ---

  const UsageMeter = ({ label, current, max }) => {
    const percentage = Math.min((current / max) * 100, 100);
    const isCritical = percentage >= 80;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400 font-bold uppercase">{label}</span>
            <span className={isCritical ? 'text-red-400 font-bold' : 'text-white'}>
                {current} / {max >= 9999 ? '∞' : max}
            </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
                className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${max >= 9999 ? 0 : percentage}%` }}
            ></div>
        </div>
      </div>
    );
  };

  const PlanCard = ({ title, price, features, type, isCurrent }) => {
     const isEnterprise = type === 'ENTERPRISE';
     return (
        <div className={`relative p-6 rounded-xl border transition-all hover:scale-105 duration-300 flex flex-col
            ${isCurrent ? 'bg-primary/10 border-primary shadow-2xl shadow-primary/20' : 'bg-gray-900 border-white/10 hover:border-white/30'}
        `}>
            {isCurrent && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                    CURRENT PLAN
                </div>
            )}
            
            <div className="mb-4">
                <h3 className={`text-lg font-bold ${isEnterprise ? 'text-purple-400' : 'text-white'}`}>{title}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-white">₹{price}</span>
                    <span className="text-xs text-gray-500">/ month</span>
                </div>
            </div>

            <div className="space-y-3 mb-8 flex-1">
                {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                         <CheckCircle size={14} className="text-green-500 flex-shrink-0"/> {feat}
                    </div>
                ))}
            </div>

            <button 
                onClick={() => !isCurrent && handleUpgrade(type)}
                disabled={isCurrent || upgrading}
                className={`w-full py-2 rounded-lg font-bold text-sm transition-all
                    ${isCurrent 
                        ? 'bg-gray-800 text-gray-500 cursor-default' 
                        : 'bg-white text-black hover:bg-gray-200'}
                `}
            >
                {isCurrent ? 'Active Plan' : upgrading ? 'Processing...' : 'Upgrade Now'}
            </button>
        </div>
     );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-800 pb-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="text-primary"/> Subscription Manager
                </h1>
                <p className="text-gray-400 text-sm">Manage your plan, billing and usage limits.</p>
            </div>
            {expiry && (
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Renews On</p>
                    <p className="text-sm font-mono text-white">{new Date(expiry).toLocaleDateString()}</p>
                </div>
            )}
        </div>

        {/* USAGE METER SECTION */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 p-6 rounded-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Zap size={16} className="text-yellow-400"/> Current Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <UsageMeter label="Active Job Posts" current={usage.jobsPosted} max={details.limits.jobs} />
                <UsageMeter label="Interviews Scheduled (Monthly)" current={usage.interviewsScheduled} max={details.limits.interviews} />
            </div>
        </div>

        {/* PRICING TABLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlanCard 
                title="Free Starter" 
                price="0" 
                type="FREE"
                isCurrent={currentPlan === 'FREE'}
                features={[
                    "1 Active Job Post",
                    "3 Interviews / Month",
                    "Basic Analytics",
                    "Standard Support"
                ]}
            />
            <PlanCard 
                title="Pro Recruiter" 
                price="2,999" 
                type="PRO"
                isCurrent={currentPlan === 'PRO'}
                features={[
                    "10 Active Job Posts",
                    "100 Interviews / Month",
                    "Advanced Analytics",
                    "Verified Company Badge",
                    "Priority Fraud Guard"
                ]}
            />
            <PlanCard 
                title="Enterprise" 
                price="9,999" 
                type="ENTERPRISE"
                isCurrent={currentPlan === 'ENTERPRISE'}
                features={[
                    "Unlimited Job Posts",
                    "Unlimited Interviews",
                    "Full Hiring Intelligence",
                    "Dedicated Account Manager",
                    "API Access"
                ]}
            />
        </div>

        {/* TRUST BADGE INFO */}
        <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg flex items-center gap-4">
             <Shield className="text-blue-400 flex-shrink-0" size={32} />
             <div>
                 <h4 className="font-bold text-blue-400 text-sm">Verified Recruiter Badge</h4>
                 <p className="text-xs text-gray-400">Upgrade to PRO or Enterprise to get the Blue Tick on your company profile and job cards, increasing applicant trust by 40%.</p>
             </div>
             <Crown className="ml-auto text-yellow-500/20" size={48}/>
        </div>

    </div>
  );
};

export default SubscriptionPage;