async function predict(req, res) {
    return res.status(503).json({
        message: "AI prediction service is not available yet. This feature will be enabled after the ML training phase.",
        status: "pending",
        symbol: req.body.symbol || null,
        period: req.body.period || null
    });
}

async function getPredictions(req, res) {
    return res.status(503).json({
        message: "AI prediction service is not available yet.",
        status: "pending",
        predictions: []
    });
}

module.exports = { predict, getPredictions };