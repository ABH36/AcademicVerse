const AcademicRecord = require('../models/AcademicRecord');
const logger = require('../utils/logger');

// @desc    Get Academic Record
exports.getAcademicRecord = async (req, res) => {
  try {
    let record = await AcademicRecord.findOne({ user: req.user.id });
    if (!record) {
      record = await AcademicRecord.create({ user: req.user.id, semesters: [], timeline: [] });
    }
    res.json(record);
  } catch (error) {
    logger.error(`Get Academic Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add or Update a Semester (Hardened)
// @route   POST /api/academic/semester
exports.addSemester = async (req, res) => {
  try {
    // LOCK-IN 3: Freeze Check
    if (req.user.isFrozen) {
      return res.status(403).json({ message: 'Account frozen. Contact admin.' });
    }

    // LOCK-IN 1: Removed 'cgpa' from input. Server calculates it.
    const { semesterNumber, sgpa, subjects, status } = req.body;

    let record = await AcademicRecord.findOne({ user: req.user.id });
    if (!record) {
      record = new AcademicRecord({ user: req.user.id });
    }

    const semIndex = record.semesters.findIndex(s => s.semesterNumber === parseInt(semesterNumber));
    const newSemester = { 
        semesterNumber: parseInt(semesterNumber), 
        sgpa: parseFloat(sgpa), 
        cgpa: 0, // Placeholder, calculated below
        subjects, 
        status 
    };

    if (semIndex > -1) {
      record.semesters[semIndex] = newSemester;
    } else {
      record.semesters.push(newSemester);
    }

    // Sort Semesters (1, 2, 3...)
    record.semesters.sort((a, b) => a.semesterNumber - b.semesterNumber);

    // LOCK-IN 1: Recalculate CGPA Server-Side
    // Logic: Average of all SGPAs (Standard simplified calculation)
    const totalSgpa = record.semesters.reduce((sum, s) => sum + s.sgpa, 0);
    const calculatedCgpa = (totalSgpa / record.semesters.length).toFixed(2);
    
    // Update Global CGPA
    record.currentCgpa = parseFloat(calculatedCgpa);
    
    // Update individual semester Cumulative reference if needed (optional, but good for history)
    // For now, we update the global record.currentCgpa which is what matters most.

    await record.save();
    logger.info(`Semester ${semesterNumber} updated. New CGPA: ${calculatedCgpa}`);
    res.json(record);

  } catch (error) {
    logger.error(`Add Semester Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add Timeline Event (Hardened + Uploads)
// @route   POST /api/academic/timeline
exports.addTimelineEvent = async (req, res) => {
  try {
    // LOCK-IN 3: Freeze Check
    if (req.user.isFrozen) {
      return res.status(403).json({ message: 'Account frozen. Contact admin.' });
    }

    const { title, description, category, date, icon } = req.body;

    let record = await AcademicRecord.findOne({ user: req.user.id });
    if (!record) record = new AcademicRecord({ user: req.user.id });

    // LOCK-IN 2: Spam Protection
    if (record.timeline.length >= 200) {
        return res.status(403).json({ message: 'Timeline limit reached (Max 200).' });
    }

    const newEvent = {
      title,
      description,
      category,
      date: date || new Date(),
      icon
    };

    // FEATURE: Handle Cloudinary Proof Upload
    if(req.file) {
        newEvent.proofUrl = req.file.path; // Cloudinary URL
    }

    record.timeline.push(newEvent);
    record.timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    await record.save();
    res.json(record);

  } catch (error) {
    logger.error(`Add Timeline Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};