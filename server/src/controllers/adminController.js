import User   from '../models/User.js';
import Resume from '../models/Resume.js';

// GET /api/admin/users (admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/resumes (admin only)
export const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .select('-__v');
    res.json({ success: true, count: resumes.length, data: resumes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/stats (admin only)
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalResumes, completedResumes] = await Promise.all([
      User.countDocuments(),
      Resume.countDocuments(),
      Resume.countDocuments({ status: 'completed' }),
    ]);
    const avgResult = await Resume.aggregate([
      { $match: { status: 'completed', matchScore: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$matchScore' } } },
    ]);
    const avgMatchScore = avgResult.length > 0 ? Math.round(avgResult[0].avg) : 0;
    res.json({ success: true, data: { totalUsers, totalResumes, completedResumes, avgMatchScore } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/users/:id (admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    await Resume.deleteMany({ userId: user._id });
    await user.deleteOne();
    res.json({ success: true, message: 'User and their analyses deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
