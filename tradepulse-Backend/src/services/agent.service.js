const marketService = require('./market.service');
const Parser = require('rss-parser');
const parser = new Parser({
    timeout: 5000
});

const RSS_FEEDS = [
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
    { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph' },
    { url: 'https://decrypt.co/feed', source: 'Decrypt' },
];

// Helper: Calculate Exponential Moving Average (EMA)
function calculateEMA(prices, period) {
    if (prices.length < period) return null;
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
    for (let i = period; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
}

// Helper: Calculate RSI (Relative Strength Index)
function calculateRSI(prices, period = 14) {
    if (prices.length <= period) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change >= 0) gains += change;
        else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change >= 0) {
            avgGain = (avgGain * (period - 1) + change) / period;
            avgLoss = (avgLoss * (period - 1)) / period;
        } else {
            avgGain = (avgGain * (period - 1)) / period;
            avgLoss = (avgLoss * (period - 1) - change) / period;
        }
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return parseFloat((100 - (100 / (1 + rs))).toFixed(2));
}

// Helper: Calculate MACD (12, 26, 9)
function calculateMACD(prices) {
    if (prices.length < 35) {
        return { macd: 0, signal: 0, histogram: 0 };
    }

    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;

    // Estimate signal line using recent 9 periods
    const macdSeries = [];
    for (let i = prices.length - 15; i < prices.length; i++) {
        const subPrices = prices.slice(0, i + 1);
        const subEma12 = calculateEMA(subPrices, 12);
        const subEma26 = calculateEMA(subPrices, 26);
        if (subEma12 !== null && subEma26 !== null) {
            macdSeries.push(subEma12 - subEma26);
        }
    }

    const signalLine = calculateEMA(macdSeries, 9) || macdLine * 0.9;
    const histogram = macdLine - signalLine;

    return {
        macd: parseFloat(macdLine.toFixed(2)),
        signal: parseFloat(signalLine.toFixed(2)),
        histogram: parseFloat(histogram.toFixed(2))
    };
}

// Technical indicator analysis
function analyzeTechnicals(candles, currentPrice) {
    const closePrices = candles.map(c => parseFloat(c.close));
    const highs = candles.map(c => parseFloat(c.high));
    const lows = candles.map(c => parseFloat(c.low));

    const rsi = calculateRSI(closePrices, 14);
    const macd = calculateMACD(closePrices);
    const ema20 = calculateEMA(closePrices, 20) || currentPrice;
    const ema50 = calculateEMA(closePrices, 50) || currentPrice;

    // Support and Resistance based on recent 30-candle highs/lows
    const recentHighs = highs.slice(-30);
    const recentLows = lows.slice(-30);

    const resistance = Math.max(...recentHighs);
    const support = Math.min(...recentLows);

    let technicalScore = 0; // -100 to +100

    // RSI signals
    if (rsi < 30) technicalScore += 30; // oversold -> bullish
    else if (rsi < 45) technicalScore += 15;
    else if (rsi > 70) technicalScore -= 30; // overbought -> bearish
    else if (rsi > 55) technicalScore -= 15;

    // MACD signals
    if (macd.histogram > 0) technicalScore += 25;
    else technicalScore -= 25;

    // Moving average trends
    if (currentPrice > ema20 && ema20 > ema50) technicalScore += 30;
    else if (currentPrice < ema20 && ema20 < ema50) technicalScore -= 30;
    else if (currentPrice > ema20) technicalScore += 15;
    else technicalScore -= 15;

    return {
        rsi,
        macd,
        ema20: parseFloat(ema20.toFixed(2)),
        ema50: parseFloat(ema50.toFixed(2)),
        support: parseFloat(support.toFixed(2)),
        resistance: parseFloat(resistance.toFixed(2)),
        technicalScore
    };
}

// Positive / Negative crypto dictionary for sentiment evaluation
const POSITIVE_WORDS = [
    'surge', 'surges', 'soar', 'soars', 'bull', 'bullish', 'gain', 'gains', 'high', 'ath', 'breakout',
    'rally', 'jump', 'jumps', 'pump', 'profit', 'adoption', 'support', 'record', 'green', 'boost',
    'partnership', 'upgrade', 'launch', 'approval', 'etf'
];

const NEGATIVE_WORDS = [
    'drop', 'drops', 'crash', 'crashes', 'bear', 'bearish', 'loss', 'losses', 'dump', 'slump',
    'plunge', 'plunges', 'hack', 'hacked', 'ban', 'banned', 'down', 'lawsuit', 'sec', 'probe',
    'fraud', 'warning', 'decline', 'declines', 'fall', 'falls', 'red', 'liquidation'
];

async function analyzeCoinNews(baseCoin) {
    try {
        const results = await Promise.allSettled(
            RSS_FEEDS.map(feed => parser.parseURL(feed.url))
        );

        const coinKeywords = [baseCoin.toLowerCase(), getCoinFullName(baseCoin).toLowerCase()];
        const relevantHeadlines = [];
        let sentimentScore = 0; // -100 to +100

        results.forEach((res) => {
            if (res.status === 'fulfilled' && res.value && res.value.items) {
                res.value.items.forEach(item => {
                    const text = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase();
                    const isMentioned = coinKeywords.some(keyword => text.includes(keyword));

                    if (isMentioned) {
                        relevantHeadlines.push(item.title);
                        let itemScore = 0;
                        POSITIVE_WORDS.forEach(word => {
                            if (text.includes(word)) itemScore += 1;
                        });
                        NEGATIVE_WORDS.forEach(word => {
                            if (text.includes(word)) itemScore -= 1;
                        });

                        sentimentScore += itemScore;
                    }
                });
            }
        });

        const newsCount = relevantHeadlines.length;
        let finalScore = 0;
        let sentimentText = 'NEUTRAL';

        if (newsCount > 0) {
            finalScore = Math.max(-100, Math.min(100, sentimentScore * 20));
            if (finalScore > 15) sentimentText = 'BULLISH';
            else if (finalScore < -15) sentimentText = 'BEARISH';
        }

        return {
            sentiment: sentimentText,
            score: finalScore,
            newsCount,
            headlines: relevantHeadlines.slice(0, 5)
        };
    } catch (err) {
        console.error('Error fetching coin news sentiment:', err.message);
        return {
            sentiment: 'NEUTRAL',
            score: 0,
            newsCount: 0,
            headlines: []
        };
    }
}

function getCoinFullName(symbol) {
    const map = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'BNB': 'Binance',
        'SOL': 'Solana',
        'XRP': 'Ripple',
        'DOGE': 'Dogecoin',
        'ADA': 'Cardano',
        'AVAX': 'Avalanche',
        'DOT': 'Polkadot',
        'MATIC': 'Polygon',
        'LINK': 'Chainlink'
    };
    return map[symbol] || symbol;
}

// Main Prediction Agent Service
async function predictMarket(symbol, period = '7 days') {
    const cleanSymbol = (symbol || 'BTCUSDT').toUpperCase();
    const baseCoin = cleanSymbol.replace('USDT', '');

    // 1. Fetch Binance market data and historical candles
    const [coinDetail, candles] = await Promise.all([
        marketService.getcoindetail(cleanSymbol),
        marketService.getcoinhistory(cleanSymbol, '1d', 100)
    ]);

    const currentPrice = parseFloat(coinDetail.lastPrice);
    const priceChange24h = parseFloat(coinDetail.priceChangePercent);

    // 2. Technical analysis (RSI, MACD, Moving Averages, Support/Resistance)
    const technicals = analyzeTechnicals(candles, currentPrice);

    // 3. News sentiment analysis
    const newsSentiment = await analyzeCoinNews(baseCoin);

    // 4. Multi-factor composite prediction model
    // 60% Technicals, 30% News Sentiment, 10% 24h Momentum
    const momentumScore = Math.max(-100, Math.min(100, priceChange24h * 10));
    const compositeScore = (technicals.technicalScore * 0.6) + (newsSentiment.score * 0.3) + (momentumScore * 0.1);

    let trend = 'NEUTRAL';
    if (compositeScore >= 18) trend = 'BULLISH';
    else if (compositeScore <= -18) trend = 'BEARISH';

    // Confidence calculation (scaled between 62% and 92%)
    const rawConfidence = 60 + Math.min(32, Math.abs(compositeScore) * 0.35);
    const confidence = Math.round(rawConfidence);

    // Multiplier based on period
    const periodDaysMap = {
        '1 day': 1,
        '3 days': 3,
        '7 days': 7,
        '14 days': 14,
        '30 days': 30
    };
    const days = periodDaysMap[period] || 7;
    const volatilityFactor = (days / 7) * 0.035;

    let targetPrice = currentPrice;
    if (trend === 'BULLISH') {
        targetPrice = currentPrice * (1 + volatilityFactor);
    } else if (trend === 'BEARISH') {
        targetPrice = currentPrice * (1 - volatilityFactor);
    } else {
        targetPrice = currentPrice * (1 + (volatilityFactor * 0.2));
    }

    // Ensure realistic support and resistance relative to current price
    let supportLevel = technicals.support < currentPrice ? technicals.support : currentPrice * 0.95;
    let resistanceLevel = technicals.resistance > currentPrice ? technicals.resistance : currentPrice * 1.05;

    const roundDecimals = currentPrice > 10 ? 2 : 4;

    return {
        trend,
        confidence,
        targetPrice: parseFloat(targetPrice.toFixed(roundDecimals)),
        supportLevel: parseFloat(supportLevel.toFixed(roundDecimals)),
        resistanceLevel: parseFloat(resistanceLevel.toFixed(roundDecimals)),
        currentPrice: parseFloat(currentPrice.toFixed(roundDecimals)),
        symbol: cleanSymbol,
        period,
        technicalAnalysis: {
            rsi: technicals.rsi,
            macd: technicals.macd,
            ema20: technicals.ema20,
            ema50: technicals.ema50,
            summary: `RSI is ${technicals.rsi} with ${technicals.macd.histogram >= 0 ? 'bullish' : 'bearish'} MACD histogram.`
        },
        newsSentiment: {
            sentiment: newsSentiment.sentiment,
            score: newsSentiment.score,
            newsCount: newsSentiment.newsCount,
            headlines: newsSentiment.headlines
        }
    };
}

module.exports = {
    predictMarket,
    analyzeTechnicals,
    analyzeCoinNews
};
