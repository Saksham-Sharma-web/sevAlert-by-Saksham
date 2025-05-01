const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

// Get nearby complaints
router.get('/nearby-complaints', auth, async (req, res) => {
    try {
        const { latitude, longitude, radius = 5 } = req.query; // radius in kilometers
        
        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const nearbyComplaints = await Complaint.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            }
        })
        .populate('user', 'username email')
        .sort({ createdAt: -1 });

        res.json(nearbyComplaints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching nearby complaints', error: error.message });
    }
});

// Get nearby users (for authorities)
router.get('/nearby-users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'authority') {
            return res.status(403).json({ message: 'Only authorities can access this endpoint' });
        }

        const { latitude, longitude, radius = 5 } = req.query;
        
        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const nearbyUsers = await User.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: radius * 1000
                }
            },
            isActive: true
        })
        .select('username email profile location lastLogin');

        res.json(nearbyUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching nearby users', error: error.message });
    }
});

// Get heatmap data for complaints
router.get('/heatmap', auth, async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (category) {
            query.category = category;
        }

        const heatmapData = await Complaint.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        coordinates: '$location.coordinates',
                        category: '$category'
                    },
                    count: { $sum: 1 },
                    severity: { $avg: { $cond: [
                        { $eq: ['$priority', 'critical'] }, 3,
                        { $cond: [
                            { $eq: ['$priority', 'high'] }, 2,
                            { $cond: [
                                { $eq: ['$priority', 'medium'] }, 1,
                                0
                            ]}
                        ]}
                    ]}}
                }
            }
        ]);

        res.json(heatmapData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching heatmap data', error: error.message });
    }
});

module.exports = router; 