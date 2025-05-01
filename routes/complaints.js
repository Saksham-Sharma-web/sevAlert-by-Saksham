const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

// Submit a new complaint
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, category, location, address, evidence } = req.body;
        
        const complaint = new Complaint({
            user: req.user.userId,
            title,
            description,
            category,
            location: {
                type: 'Point',
                coordinates: location
            },
            address,
            evidence
        });

        await complaint.save();
        res.status(201).json({ message: 'Complaint submitted successfully', complaint });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting complaint', error: error.message });
    }
});

// Get all complaints (with filters)
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, search = '', category = 'all', status = 'all' } = req.query;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        let query = {};

        // Apply filters
        if (category !== 'all') query.category = category;
        if (status !== 'all') query.status = status;

        // Apply search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const totalComplaints = await Complaint.countDocuments(query);
        const complaints = await Complaint.find(query)
            .populate('user', 'username email')
            .populate('assignedTo', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        res.json({
            complaints,
            totalPages: Math.ceil(totalComplaints / pageSize),
            currentPage: parseInt(page),
            totalComplaints
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaints', error: error.message });
    }
});

// Get a specific complaint
router.get('/:id', auth, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('user', 'username email')
            .populate('assignedTo', 'username email');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaint', error: error.message });
    }
});

// Update complaint status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status, assignedTo } = req.body;
        
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status, assignedTo },
            { new: true }
        );

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.json({ message: 'Complaint status updated successfully', complaint });
    } catch (error) {
        res.status(500).json({ message: 'Error updating complaint status', error: error.message });
    }
});

// Add comment to complaint
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { text } = req.body;
        
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        user: req.user.userId,
                        text
                    }
                }
            },
            { new: true }
        );

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.json({ message: 'Comment added successfully', complaint });
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
});

module.exports = router; 