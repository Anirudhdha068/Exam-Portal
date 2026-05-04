const ModuleRequest = require('../models/ModuleRequest');
const User = require('../models/User');

// Submit new module request (students)
const createModuleRequest = async (req, res) => {
  try {
    const { moduleName, description } = req.body;
    const userId = req.user.id; // Set by authMiddleware

    if (!moduleName || !description) {
      return res.status(400).json({ message: 'Module name and description are required' });
    }

    const request = new ModuleRequest({
      moduleName,
      description,
      requestedBy: userId
    });

    await request.save();

    await User.findByIdAndUpdate(userId, { $push: { courses: request._id } }); // Optional: track requests?

    res.status(201).json({ 
      message: 'Module request submitted successfully',
      request 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all module requests (admin)
const getAllModuleRequests = async (req, res) => {
  try {
    const requests = await ModuleRequest.find()
      .populate('requestedBy', 'fullName username email role')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update request status (admin)
const updateModuleRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const request = await ModuleRequest.findById(id).populate('requestedBy', 'email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    await request.save();

    // Optional: email notification
    // await sendEmail(request.requestedBy.email, `Module Request ${status}`, `Your request for ${request.moduleName} has been ${status.toLowerCase()}`);

    res.json({ 
      message: `Request ${status.toLowerCase()} successfully`,
      request 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createModuleRequest,
  getAllModuleRequests,
  updateModuleRequestStatus
};

