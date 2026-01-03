import React, { useState, useEffect } from 'react';
import { getMyProjects, createProject, deleteProject } from '../../services/projectService';
import { toast } from 'react-toastify';
import { Plus, Github, ExternalLink, Trash2, Eye, EyeOff, Image as ImageIcon, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    techStack: '', // Input as string "React, Node"
    github: '',
    liveDemo: '',
    videoDemo: '',
    isPublic: true
  });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getMyProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    // Limit to 5 files
    if (e.target.files.length > 5) {
      toast.warning('Max 5 screenshots allowed');
      return;
    }
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('tagline', formData.tagline);
      data.append('description', formData.description);
      data.append('techStack', formData.techStack); // Backend splits this string
      data.append('github', formData.github);
      data.append('liveDemo', formData.liveDemo);
      data.append('videoDemo', formData.videoDemo);
      data.append('isPublic', formData.isPublic);

      // Append multiple files with same key 'screenshots'
      files.forEach(file => {
        data.append('screenshots', file);
      });

      await createProject(data);
      toast.success('Project Created Successfully!');
      setShowModal(false);
      setFormData({
        title: '', tagline: '', description: '', techStack: '', 
        github: '', liveDemo: '', videoDemo: '', isPublic: true
      });
      setFiles([]);
      loadProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await deleteProject(id);
      toast.success('Project Deleted');
      loadProjects();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="p-10 text-white">Loading Universe...</div>;

  return (
    <div className="text-white p-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
           <h1 className="text-2xl font-bold">Project Universe</h1>
           <p className="text-gray-400 text-sm">Manage your portfolio and showcase your work.</p>
        </div>
        <button 
           onClick={() => setShowModal(true)}
           className="bg-primary hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
        >
           <Plus size={16} /> New Project
        </button>
      </header>

      {/* Project Grid */}
      {projects.length === 0 ? (
          <div className="text-center py-20 bg-card border border-dashed border-gray-700 rounded-xl">
              <Layers className="mx-auto h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-400">Your universe is empty.</h3>
              <p className="text-gray-500">Start by adding your first project.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={project._id} 
                    className="bg-card border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-all group flex flex-col h-full"
                  >
                      {/* Image Preview Area */}
                      <div className="h-40 bg-gray-800 relative overflow-hidden">
                          {project.images && project.images.length > 0 ? (
                              <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                  <ImageIcon size={32} />
                              </div>
                          )}
                          
                          {/* Visibility Badge */}
                          <div className="absolute top-3 right-3">
                              {project.isPublic ? (
                                  <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded-full backdrop-blur-md border border-green-500/30 flex items-center gap-1">
                                      <Eye size={10} /> Public
                                  </span>
                              ) : (
                                  <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded-full backdrop-blur-md border border-red-500/30 flex items-center gap-1">
                                      <EyeOff size={10} /> Private
                                  </span>
                              )}
                          </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold mb-1 truncate">{project.title}</h3>
                          <p className="text-xs text-primary mb-3 truncate">{project.tagline}</p>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{project.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                              {project.techStack.slice(0, 3).map((tech, i) => (
                                  <span key={i} className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-300 border border-white/5">
                                      {tech}
                                  </span>
                              ))}
                              {project.techStack.length > 3 && <span className="text-[10px] text-gray-500">+{project.techStack.length - 3}</span>}
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-white/5">
                              <div className="flex gap-3">
                                  {project.links.github && <a href={project.links.github} target="_blank" className="text-gray-400 hover:text-white"><Github size={16} /></a>}
                                  {project.links.liveDemo && <a href={project.links.liveDemo} target="_blank" className="text-gray-400 hover:text-white"><ExternalLink size={16} /></a>}
                              </div>
                              <button onClick={() => handleDelete(project._id)} className="text-gray-500 hover:text-red-400 transition-colors">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </div>
                  </motion.div>
              ))}
          </div>
      )}

      {/* Modal */}
      {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl"
              >
                  <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
                      <h2 className="text-xl font-bold">Add Project</h2>
                      <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                              <label className="text-xs text-gray-400 block mb-1">Project Title</label>
                              <input type="text" className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg text-white focus:ring-1 focus:ring-primary outline-none" 
                                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                          </div>
                          <div className="md:col-span-2">
                              <label className="text-xs text-gray-400 block mb-1">Tagline (Elevator Pitch)</label>
                              <input type="text" className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg text-white focus:ring-1 focus:ring-primary outline-none" 
                                  value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} required />
                          </div>
                          <div className="md:col-span-2">
                              <label className="text-xs text-gray-400 block mb-1">Description</label>
                              <textarea rows={4} className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg text-white focus:ring-1 focus:ring-primary outline-none" 
                                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                          </div>
                          
                          <div className="md:col-span-2">
                              <label className="text-xs text-gray-400 block mb-1">Tech Stack (Comma Separated)</label>
                              <input type="text" placeholder="e.g. React, Node.js, MongoDB, Python" 
                                  className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg text-white focus:ring-1 focus:ring-primary outline-none" 
                                  value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} />
                          </div>

                          <div>
                              <label className="text-xs text-gray-400 block mb-1">GitHub Repo</label>
                              <input type="url" className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg text-white focus:ring-1 focus:ring-primary outline-none" 
                                  value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-xs text-gray-400 block mb-1">Live Demo Link</label>
                              <input type="url" className="w-full bg-gray-800 border border-gray-700 p-2.5 rounded-lg text-white focus:ring-1 focus:ring-primary outline-none" 
                                  value={formData.liveDemo} onChange={e => setFormData({...formData, liveDemo: e.target.value})} />
                          </div>

                          <div className="md:col-span-2 border border-dashed border-gray-700 rounded-lg p-6 text-center">
                               <label className="cursor-pointer block">
                                   <ImageIcon className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                                   <span className="text-sm text-gray-300 font-medium">Upload Screenshots (Max 5)</span>
                                   <p className="text-xs text-gray-500 mt-1">JPG, PNG allowed</p>
                                   <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                               </label>
                               {files.length > 0 && (
                                   <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                       {files.map((f, i) => (
                                           <span key={i} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">{f.name}</span>
                                       ))}
                                   </div>
                               )}
                          </div>
                          
                          <div className="md:col-span-2 flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg">
                              <input type="checkbox" id="public" checked={formData.isPublic} onChange={e => setFormData({...formData, isPublic: e.target.checked})} 
                                  className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-primary focus:ring-primary" />
                              <label htmlFor="public" className="text-sm text-gray-300">Make this project public immediately</label>
                          </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-800">
                          <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white mr-2">Cancel</button>
                          <button type="submit" disabled={uploading} className="bg-primary hover:bg-blue-600 px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2">
                              {uploading ? 'Uploading...' : 'Launch Project'}
                          </button>
                      </div>
                  </form>
              </motion.div>
          </div>
      )}
    </div>
  );
};

export default ProjectManager;