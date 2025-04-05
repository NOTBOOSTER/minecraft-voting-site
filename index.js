// server.js
const express = require('express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const util = require('minecraft-server-util');
const app = express();
require('dotenv').config();

//data
const ip = process.env.IP;
const port = process.env.PORT;
const token = process.env.VOTIFIER_TOKEN;
const name = process.env.NAME;

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// IP address detection helper
const getClientIP = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0];
    }
    
    const realIP = req.headers['x-real-ip'];
    if (realIP) {
        return realIP;
    }
    
    const ip = req.connection.remoteAddress;
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
        return '127.0.0.1';
    }
    
    return ip.replace(/^::ffff:/, '');
};

// Load vote data from YAML file
const loadVoteData = (voteNumber) => {
    const filePath = path.join(__dirname, `data/votes${voteNumber}.yml`);
    try {
        if (fs.existsSync(filePath)) {
            return yaml.load(fs.readFileSync(filePath, 'utf8')) || {};
        }
        return {};
    } catch (e) {
        console.error(`Error loading vote data ${voteNumber}:`, e);
        return {};
    }
};

// Save vote data to YAML file
const saveVoteData = (voteData, voteNumber) => {
    const filePath = path.join(__dirname, `data/votes${voteNumber}.yml`);
    try {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, yaml.dump(voteData));
    } catch (e) {
        console.error(`Error saving vote data ${voteNumber}:`, e);
        throw e;
    }
};

// Check cooldown period
const checkCooldown = (voteData, username, ip) => {
    const now = Date.now();
    const userVote = voteData[username];
    const ipVotes = Object.values(voteData).find(vote => vote.ip === ip);

    if (userVote && now - userVote.timestamp < 24 * 60 * 60 * 1000) {
        const remaining = Math.ceil((userVote.timestamp + 24 * 60 * 60 * 1000 - now) / 1000 / 60);
        return { canVote: false, remaining };
    }

    if (ipVotes && now - ipVotes.timestamp < 24 * 60 * 60 * 1000) {
        const remaining = Math.ceil((ipVotes.timestamp + 24 * 60 * 60 * 1000 - now) / 1000 / 60);
        return { canVote: false, remaining };
    }

    return { canVote: true, remaining: 0 };
};

// Send vote to Minecraft server
const sendVoteToServer = async (username, voteNumber) => {
    try {
        await util.sendVote(ip, port, {
            token: token,
            username,
            serviceName: `${name}${voteNumber}`,
            timestamp: Date.now(),
            timeout: 5000
        });
        return true;
    } catch (e) {
        console.error('Error sending vote to server:', e);
        return false;
    }
};

// Routes
// Home page
app.get('/', (req, res) => {
    res.render('index');
});

// Vote page
app.get('/vote/:number', (req, res) => {
    const voteNumber = req.params.number;
    if (!['1', '2', '3', '4'].includes(voteNumber)) {
        return res.redirect('/');
    }
    res.render('vote', { voteNumber });
});

// Handle vote submission
app.post('/vote/:number', async (req, res) => {
    const voteNumber = req.params.number;
    if (!['1', '2', '3', '4'].includes(voteNumber)) {
        return res.redirect('/');
    }

    const { username } = req.body;
    const ip = getClientIP(req);

    // Validate username
    if (!username || username.length > 16 || !/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
        return res.render('error', {
            message: 'Invalid username format. Username must be 3-16 characters long and contain only letters, numbers, and underscores.',
            voteNumber
        });
    }

    try {
        const voteData = loadVoteData(voteNumber);
        const cooldownCheck = checkCooldown(voteData, username, ip);

        if (!cooldownCheck.canVote) {
            return res.render('error', {
                message: `You must wait ${cooldownCheck.remaining} minutes before voting again`,
                voteNumber
            });
        }

        const voteSuccess = await sendVoteToServer(username, voteNumber);
        if (!voteSuccess) {
            return res.render('error', {
                message: 'Failed to send vote to server. Please try again later.',
                voteNumber
            });
        }

        // Save vote data
        voteData[username] = {
            ip,
            timestamp: Date.now()
        };
        saveVoteData(voteData, voteNumber);

        // Redirect to success page
        res.render('success', { voteNumber });

    } catch (error) {
        console.error('Vote processing error:', error);
        res.render('error', {
            message: 'An error occurred while processing your vote. Please try again later.',
            voteNumber
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Something went wrong! Please try again later.',
        voteNumber: null
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
});