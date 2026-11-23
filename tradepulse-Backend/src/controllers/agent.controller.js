const agentService = require('../services/agent.service');
const PredictionModel = require('../models/prediction.model');

async function predict(req, res) {
    try {
        const { symbol, period } = req.body;
        const user = req.user;

        if (!symbol) {
            return res.status(400).json({ message: "Symbol is required" });
        }

        const prediction = await agentService.predictMarket(symbol, period);

        // Save prediction for history tracking if user is authenticated
        if (user && user._id) {
            try {
                await PredictionModel.create({
                    user: user._id,
                    symbol: prediction.symbol,
                    period: prediction.period,
                    trend: prediction.trend,
                    confidence: prediction.confidence,
                    targetPrice: prediction.targetPrice,
                    supportLevel: prediction.supportLevel,
                    resistanceLevel: prediction.resistanceLevel,
                    technicalAnalysis: prediction.technicalAnalysis,
                    newsSentiment: prediction.newsSentiment
                });
            } catch (dbErr) {
                console.error("Could not save prediction history:", dbErr.message);
            }
        }

        return res.status(200).json(prediction);
    } catch (err) {
        console.error("Agent prediction error:", err.message);
        return res.status(500).json({
            message: "Failed to generate market prediction",
            error: err.message
        });
    }
}

async function getPredictions(req, res) {
    try {
        const { symbol } = req.params;
        const user = req.user;

        const query = { user: user._id };
        if (symbol && symbol !== 'all') {
            query.symbol = symbol.toUpperCase();
        }

        const predictions = await PredictionModel.find(query)
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            message: "Predictions retrieved successfully",
            predictions
        });
    } catch (err) {
        console.error("Error fetching predictions:", err.message);
        return res.status(500).json({
            message: "Failed to fetch predictions",
            error: err.message
        });
    }
}

module.exports = { predict, getPredictions };