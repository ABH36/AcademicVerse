import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, updateProfile } from '../../services/profileService';
import { toast } from 'react-toastify';
import { Camera, Save, Loader } from 'lucide-react';

const ProfileEditor = () => {
  const { user } = useAuth(); // Global User State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    bio: '',
    collegeName: '',
    branch: '',
    batchYear: '',
    rollNumber: '',
    linkedin: '',
    github: '',
    website: '',
    instagram: ''
  });
  
  // Image State
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // 1. Fetch Existing Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await getMyProfile();
        // Populate form with existing data (safe unpacking)
        setFormData({
          bio: profile.bio || '',
          collegeName: profile.academicDetails?.collegeName || '',
          branch: profile.academicDetails?.branch || '',
          batchYear: profile.academicDetails?.batchYear || '',
          rollNumber: profile.academicDetails?.rollNumber || '',
          linkedin: profile.socialLinks?.linkedin || '',
          github: profile.socialLinks?.github || '',
          website: profile.socialLinks?.website || '',
          instagram: profile.socialLinks?.instagram || ''
        });
        setAvatarPreview(profile.avatar); // Set existing avatar
      } catch (error) {
        // If 404 (first time), just stay empty
        console.log("No existing profile, starting fresh.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Handle Text Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Local preview
    }
  };

  // 4. Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Construct FormData for Backend (Multipart)
      const submitData = new FormData();
      submitData.append('bio', formData.bio);
      submitData.append('collegeName', formData.collegeName);
      submitData.append('branch', formData.branch);
      submitData.append('batchYear', formData.batchYear);
      submitData.append('rollNumber', formData.rollNumber);
      
      submitData.append('linkedin', formData.linkedin);
      submitData.append('github', formData.github);
      submitData.append('website', formData.website);
      submitData.append('instagram', formData.instagram);

      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      await updateProfile(submitData);
      toast.success('Profile Updated Successfully!');
    } catch (error) {
      toast.error('Update Failed: ' + (error.response?.data?.message || 'Server Error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading Editor...</div>;

  return (
    <div className="text-white p-6 max-w-4xl mx-auto">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-gray-400 text-sm">Update your public identity card.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Avatar */}
        <div className="flex items-center gap-6 bg-card border border-white/5 p-6 rounded-xl">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-700 bg-gray-800">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity">
              <Camera className="text-white h-6 w-6" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <div>
            <h3 className="font-bold">Profile Photo</h3>
            <p className="text-xs text-gray-400">Click the image to change. Max 2MB (JPG/PNG).</p>
          </div>
        </div>

        {/* Section 2: Basic Academic Info */}
        <div className="bg-card border border-white/5 p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-lg border-b border-white/5 pb-2">Academic Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase">College Name</label>
              <input 
                name="collegeName" 
                value={formData.collegeName} 
                onChange={handleChange} 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:ring-1 focus:ring-primary outline-none" 
                placeholder="IIT Bombay" 
                required 
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">Branch / Major</label>
              <input 
                name="branch" 
                value={formData.branch} 
                onChange={handleChange} 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:ring-1 focus:ring-primary outline-none" 
                placeholder="Computer Science" 
                required 
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">Batch Year</label>
              <input 
                name="batchYear" 
                value={formData.batchYear} 
                onChange={handleChange} 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:ring-1 focus:ring-primary outline-none" 
                placeholder="2024-2028" 
                required 
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">Roll Number (Private)</label>
              <input 
                name="rollNumber" 
                value={formData.rollNumber} 
                onChange={handleChange} 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:ring-1 focus:ring-primary outline-none" 
                placeholder="CS10123" 
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bio & Socials */}
        <div className="bg-card border border-white/5 p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-lg border-b border-white/5 pb-2">Social Identity</h3>
          
          <div>
            <label className="text-xs text-gray-400 uppercase">Bio (Max 300 chars)</label>
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              maxLength={300}
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:ring-1 focus:ring-primary outline-none resize-none" 
              placeholder="I am an AI enthusiast..." 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="text-xs text-gray-400 uppercase">LinkedIn URL</label>
              <input 
                name="linkedin" value={formData.linkedin} onChange={handleChange} 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" 
                placeholder="https://linkedin.com/in/..." 
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">GitHub URL</label>
              <input 
                name="github" value={formData.github} onChange={handleChange} 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" 
                placeholder="https://github.com/..." 
              />
            </div>
             <div>
              <label className="text-xs text-gray-400 uppercase">Portfolio Website</label>
              <input 
                name="website" value={formData.website} onChange={handleChange} 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" 
                placeholder="https://mysite.com" 
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">Instagram (Optional)</label>
              <input 
                name="instagram" value={formData.instagram} onChange={handleChange} 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" 
                placeholder="https://instagram.com/..." 
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? <Loader className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
            {saving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProfileEditor;