const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'user is required']
    },
    symbol: {
        type: String,
        required: [true, 'symbol is required'],
        uppercase: true
    },
    period: {
        type: String,
        default: '7 days'
    },
    trend: {
        type: String,
        enum: ['BULLISH', 'BEARISH', 'NEUTRAL'],
        required: true
    },
    confidence: {
        type: Number,
        required: true
    },
    targetPrice: {
        type: Number,
        required: true
    },
    supportLevel: {
        type: Number,
        required: true
    },
    resistanceLevel: {
        type: Number,
        required: true
    },
    technicalAnalysis: {
        rsi: Number,
        macd: {
            macd: Number,
            signal: Number,
            histogram: Number
        },
        ema20: Number,
        ema50: Number,
        summary: String
    },
    newsSentiment: {
        sentiment: String,
        score: Number,
        newsCount: Number,
        headlines: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('prediction', predictionSchema);
