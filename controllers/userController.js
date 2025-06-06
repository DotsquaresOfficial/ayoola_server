const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, {
            _id: 0,                    
            id: 1,
            name: 1,
            email: 1,
            createdAt: 1,
            points: 1,
            steps: 1,
            referrals: 1,
            status: 1,
        });

        return res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status value
  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Use 'active' or 'inactive'." });
  }

  try {
    const user = await User.findOneAndUpdate(
      { id },
      { status },
      { new: true, fields: { _id: 0, id: 1, name: 1, email: 1, status: 1 } }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: `User status updated to '${status}'`,
      user
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Server error while updating status." });
  }
};

exports.updateMultipleUserStatuses = async (req, res) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Please provide an array of user IDs." });
  }

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Use 'active' or 'inactive'." });
  }

  try {
    const result = await User.updateMany(
      { id: { $in: ids } },
      { $set: { status } }
    );

    res.status(200).json({
      message: `Updated status of ${result.modifiedCount} users to '${status}'.`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error updating user statuses:", error);
    res.status(500).json({ message: "Server error while updating statuses." });
  }
};
