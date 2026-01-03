import React, { useEffect, useState } from 'react';
import { 
    getAdminStats, 
    getUsers, 
    manageUser, 
    getReports, 
    resolveReport,
    getPendingCertificates,
    verifyCertificate
} from '../../services/adminService';
import { 
    Loader, Users, DollarSign, AlertTriangle, ShieldCheck, 
    Ban, Check, Trash2, FileText, ExternalLink, X, CheckCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminPanel = () => {
    // Data State
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [certificates, setCertificates] = useState([]);
    
    // UI State
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, reports, certificates
    const [loading, setLoading] = useState(true);

    // Fetch Data on Tab Change
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const data = await getAdminStats();
                setStats(data);
            } else if (activeTab === 'users') {
                const data = await getUsers();
                setUsers(data.users || []); 
            } else if (activeTab === 'reports') {
                const data = await getReports();
                setReports(data);
            } else if (activeTab === 'certificates') {
                const data = await getPendingCertificates();
                setCertificates(data);
            }
        } catch (error) {
            console.error("Admin Load Error", error);
        } finally {
            setLoading(false);
        }
    };

    // --- ACTION HANDLERS ---

    const handleUserAction = async (id, action) => {
        if(!window.confirm(`Confirm action: ${action}?`)) return;
        try {
            await manageUser(id, action);
            toast.success(`User updated: ${action}`);
            fetchData(); 
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const handleReportAction = async (id, action) => {
        if(!window.confirm(`Resolve report with action: ${action}?`)) return;
        try {
            await resolveReport(id, action);
            toast.success('Report Resolved');
            fetchData();
        } catch (error) {
            toast.error("Failed to resolve report");
        }
    };

    const handleCertAction = async (id, status) => {
        if(!window.confirm(`${status} this certificate?`)) return;
        try {
            await verifyCertificate(id, status);
            toast.success(`Certificate ${status}`);
            fetchData();
        } catch (error) {
            toast.error("Certificate action failed");
        }
    };

    // --- UI HELPERS ---

    const TabButton = ({ id, label, icon: Icon }) => (
        <button 
            onClick={() => setActiveTab(id)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
        >
            <Icon size={16}/> {label}
        </button>
    );

    if (loading && !stats && users.length === 0) return <div className="p-10 flex justify-center"><Loader className="animate-spin text-primary"/></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
            
            {/* HEADER & TABS */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900 p-4 rounded-xl border border-white/10 gap-4">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="text-red-500"/> Trust Authority Center
                </h1>
                <div className="flex flex-wrap gap-2">
                    <TabButton id="overview" label="Overview" icon={ShieldCheck} />
                    <TabButton id="users" label="Users" icon={Users} />
                    <TabButton id="reports" label="Reports" icon={AlertTriangle} />
                    <TabButton id="certificates" label="Certificates" icon={FileText} />
                </div>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card p-6 rounded-xl border border-white/5">
                        <p className="text-gray-400 text-xs uppercase font-bold">Total Revenue</p>
                        <h3 className="text-3xl font-black text-green-400 flex items-center gap-1">
                            <DollarSign size={24}/> {stats.platform?.totalRevenue || 0}
                        </h3>
                    </div>
                    <div className="bg-card p-6 rounded-xl border border-white/5">
                        <p className="text-gray-400 text-xs uppercase font-bold">Total Users</p>
                        <h3 className="text-3xl font-black text-white flex items-center gap-1">
                            <Users size={24}/> {stats.users?.total || 0}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.users?.students} Students • {stats.users?.recruiters} Recruiters
                        </p>
                    </div>
                    <div className="bg-card p-6 rounded-xl border border-white/5">
                        <p className="text-gray-400 text-xs uppercase font-bold">Pending Reports</p>
                        <h3 className="text-3xl font-black text-red-400 flex items-center gap-1">
                            <AlertTriangle size={24}/> {stats.workItems?.pendingReports || 0}
                        </h3>
                    </div>
                    <div className="bg-card p-6 rounded-xl border border-white/5">
                        <p className="text-gray-400 text-xs uppercase font-bold">Pending Certs</p>
                        <h3 className="text-3xl font-black text-yellow-400 flex items-center gap-1">
                            <FileText size={24}/> {stats.workItems?.pendingCertificates || 0}
                        </h3>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: USERS */}
            {activeTab === 'users' && (
                <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-800 text-white uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">User Details</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {users.map(u => (
                                <tr key={u._id} className="hover:bg-gray-800/50">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{u.name}</div>
                                        <div className="text-xs">{u.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                                            u.role === 'recruiter' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {u.isFrozen 
                                            ? <span className="text-red-400 flex items-center gap-1"><Ban size={14}/> Banned</span> 
                                            : <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14}/> Active</span>
                                        }
                                    </td>
                                    <td className="p-4 flex gap-2 justify-end">
                                        {u.role === 'recruiter' && (
                                            <button onClick={() => handleUserAction(u._id, 'verify_company')} className="bg-purple-500/10 text-purple-400 p-2 rounded hover:bg-purple-500/20" title="Give Pro / Verify Company"><DollarSign size={16}/></button>
                                        )}
                                        <button onClick={() => handleUserAction(u._id, 'verify_identity')} className="bg-blue-500/10 text-blue-400 p-2 rounded hover:bg-blue-500/20" title="Verify Identity"><ShieldCheck size={16}/></button>
                                        {u.isFrozen ? (
                                            <button onClick={() => handleUserAction(u._id, 'unban')} className="bg-green-500/10 text-green-400 p-2 rounded hover:bg-green-500/20" title="Unban"><Check size={16}/></button>
                                        ) : (
                                            <button onClick={() => handleUserAction(u._id, 'ban')} className="bg-red-500/10 text-red-400 p-2 rounded hover:bg-red-500/20" title="Ban"><Ban size={16}/></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB CONTENT: REPORTS */}
            {activeTab === 'reports' && (
                <div className="space-y-4">
                    {reports.length === 0 && <div className="text-center p-10 text-gray-500 bg-card border border-white/5 rounded-xl">No pending reports.</div>}
                    {reports.map(r => (
                        <div key={r._id} className="bg-card border border-red-500/20 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h4 className="font-bold text-red-400 flex items-center gap-2"><AlertTriangle size={16}/> Flagged Job: {r.job?.title || 'Deleted'}</h4>
                                <p className="text-sm text-gray-300 mt-1">Reason: <span className="font-bold uppercase">{r.reason}</span></p>
                                <p className="text-xs text-gray-500">Recruiter: {r.job?.company?.name || 'Unknown'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleReportAction(r._id, 'dismiss')} className="px-3 py-2 bg-gray-700 rounded text-xs hover:bg-gray-600 font-bold">Dismiss</button>
                                <button onClick={() => handleReportAction(r._id, 'remove_job')} className="px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 font-bold"><Trash2 size={12}/> Remove Job</button>
                                <button onClick={() => handleReportAction(r._id, 'ban_recruiter')} className="px-3 py-2 bg-red-900 text-red-200 rounded text-xs hover:bg-red-800 font-bold"><Ban size={12}/> Ban User</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB CONTENT: CERTIFICATES (MERGED WITH YOUR OLD UI) */}
            {activeTab === 'certificates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.length === 0 && <div className="col-span-full text-center p-10 text-gray-500 bg-card border border-white/5 rounded-xl">No pending certificates.</div>}
                    {certificates.map(cert => (
                        <div key={cert._id} className="bg-card border border-white/5 rounded-xl p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-white">{cert.title}</h3>
                                    <p className="text-primary text-sm">{cert.issuingOrganization}</p>
                                    <p className="text-gray-400 text-xs mt-1">User: {cert.user?.name}</p>
                                </div>
                                <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-1 rounded">Pending</span>
                            </div>

                            {/* --- YOUR ORIGINAL IMAGE PREVIEW LOGIC RESTORED --- */}
                            <div className="h-48 bg-gray-800 rounded-lg overflow-hidden relative group">
                                {cert.imageUrl ? (
                                    <>
                                        <img src={cert.imageUrl} alt="Proof" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <a 
                                            href={cert.imageUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink className="text-white" size={32} />
                                        </a>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 text-xs">No Preview Available</div>
                                )}
                            </div>
                            {/* ----------------------------------------------- */}

                            <div className="grid grid-cols-2 gap-4 mt-auto">
                                <button 
                                    onClick={() => handleCertAction(cert._id, 'rejected')}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <X size={16} /> Reject
                                </button>
                                <button 
                                    onClick={() => handleCertAction(cert._id, 'approved')}
                                    className="bg-green-500/10 hover:bg-green-500/20 text-green-500 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <Check size={16} /> Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;