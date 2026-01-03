const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true }, // e.g., CS101
  credits: { type: Number, required: true },
  grade: { type: String, required: true }, // A, B+, O
}, { _id: false });

const semesterSchema = new mongoose.Schema({
  semesterNumber: { type: Number, required: true }, // 1 to 8
  sgpa: { type: Number, required: true },
  cgpa: { type: Number, required: true }, // Cumulative at that point
  status: { 
    type: String, 
    enum: ['completed', 'ongoing', 'declared'], 
    default: 'completed' 
  },
  subjects: [subjectSchema], // Detailed breakdown
  markSheetUrl: { type: String }, // Cloudinary URL for proof
}, { _id: false });

const timelineEventSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Won Hackathon"
  description: { type: String },
  category: { 
    type: String, 
    enum: ['achievement', 'internship', 'project', 'certification', 'workshop'],
    required: true 
  },
  date: { type: Date, required: true },
  icon: { type: String, default: 'star' }, // For frontend animation
  proofUrl: { type: String }, // Certificate/Photo
});

const academicRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  semesters: [semesterSchema], // Structured Academic History
  timeline: [timelineEventSchema], // The "Story" of the student
  currentCgpa: { type: Number, default: 0 }, // Quick access field
  totalBacklogs: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);