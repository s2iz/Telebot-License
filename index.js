const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// =================================================================
// Configuration
// =================================================================

const BOT_TOKEN = '-';
const ADMIN_ID = -;
const BOT_NAME = '-'; 

// Database file paths
const KEYS_DB_PATH = './keys.json';
const USERS_DB_PATH = './users.json';

// Initialize the bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// =================================================================
// Database Handling
// =================================================================

// Load data from JSON files, or create them if they don't exist
const loadDatabase = (path, defaultValue = {}) => {
    try {
        if (fs.existsSync(path)) {
            const data = fs.readFileSync(path, 'utf8');
            return JSON.parse(data);
        } else {
            fs.writeFileSync(path, JSON.stringify(defaultValue, null, 2));
            return defaultValue;
        }
    } catch (error) {
        console.error(`Error loading database from ${path}:`, error);
        return defaultValue;
    }
};

let licenseKeys = loadDatabase(KEYS_DB_PATH, {});
let licensedUsers = loadDatabase(USERS_DB_PATH, {});

// Save data to JSON files
const saveData = () => {
    try {
        fs.writeFileSync(KEYS_DB_PATH, JSON.stringify(licenseKeys, null, 2));
        fs.writeFileSync(USERS_DB_PATH, JSON.stringify(licensedUsers, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

// =================================================================
// Helper Functions
// =================================================================

/**
 * Checks if a user is the administrator.
 * @param {number} userId - The user's Telegram ID.
 * @returns {boolean} - True if the user is an admin.
 */
const isAdmin = (userId) => {
    return userId === ADMIN_ID;
};

/**
 * Checks if a user has a valid, non-expired license.
 * @param {number} userId - The user's Telegram ID.
 * @returns {boolean} - True if the user has a valid license.
 */
const isLicensed = (userId) => {
    const user = licensedUsers[userId];
    if (!user) return false;

    const expiresAt = new Date(user.expiresAt);
    return expiresAt > new Date(); // Check if expiration date is in the future
};

/**
 * Generates a new license key.
 * @param {number} durationDays - The duration of the license in days.
 * @returns {string} - The newly generated key.
 */
const generateKey = (durationDays) => {
    const key = `${BOT_NAME}-${uuidv4().toUpperCase().slice(0, 8)}-${uuidv4().toUpperCase().slice(0, 8)}`;
    licenseKeys[key] = {
        duration: durationDays,
        status: 'unused',
        usedBy: null,
        activatedAt: null,
        expiresAt: null,
    };
    saveData();
    return key;
};

// =================================================================
// User Commands
// =================================================================

// /start command
bot.onText(/\/start/, (msg) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'User';

    if (isLicensed(userId)) {
        const user = licensedUsers[userId];
        const expirationDate = new Date(user.expiresAt).toLocaleString();
        bot.sendMessage(chatId, `✅ Welcome back, ${userName}!\n\nYour license is active.\nExpires on: ${expirationDate}`);
    } else {
        bot.sendMessage(chatId, `👋 Welcome to ${BOT_NAME} Bot, ${userName}!\n\nTo access the bot's features, you need an active license key.\n\nPlease use the command \`/redeem <your_key>\` to activate your license.`);
    }
});

// /redeem <key> command
bot.onText(/\/redeem (.+)/, (msg, match) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const key = match[1].trim();

    if (isLicensed(userId)) {
        bot.sendMessage(chatId, '⚠️ You already have an active license.');
        return;
    }

    const keyData = licenseKeys[key];

    if (!keyData) {
        bot.sendMessage(chatId, '❌ Invalid license key.');
        return;
    }

    if (keyData.status === 'used') {
        bot.sendMessage(chatId, '❌ This license key has already been used.');
        return;
    }

    // Activate the key
    const now = new Date();
    const expiresAt = new Date(now.getTime() + keyData.duration * 24 * 60 * 60 * 1000);

    keyData.status = 'used';
    keyData.usedBy = userId;
    keyData.activatedAt = now.toISOString();
    keyData.expiresAt = expiresAt.toISOString();

    licensedUsers[userId] = {
        key: key,
        expiresAt: expiresAt.toISOString(),
    };

    saveData();

    bot.sendMessage(chatId, `✅ Success! Your license has been activated.\n\nIt will expire on: ${expiresAt.toLocaleString()}`);
});

// /status command
bot.onText(/\/status/, (msg) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    if (isLicensed(userId)) {
        const user = licensedUsers[userId];
        const expirationDate = new Date(user.expiresAt).toLocaleString();
        bot.sendMessage(chatId, `📊 **Your License Status**\n\nKey: \`${user.key}\`\nExpires on: ${expirationDate}`, { parse_mode: 'Markdown' });
    } else {
        bot.sendMessage(chatId, 'ℹ️ You do not have an active license. Use `/redeem <key>` to activate one.');
    }
});

// =================================================================
// Admin Panel
// =================================================================

const adminPanelKeyboard = {
    inline_keyboard: [
        [{ text: '🔑 Generate Key', callback_data: 'admin_generate_key' }],
        [{ text: '📋 List All Keys', callback_data: 'admin_list_keys' }],
        [{ text: '👥 List Licensed Users', callback_data: 'admin_list_users' }],
    ]
};

const generateKeyDurationKeyboard = {
    inline_keyboard: [
        [{ text: '7 Days', callback_data: 'gen_key_7' }, { text: '30 Days', callback_data: 'gen_key_30' }],
        [{ text: '90 Days', callback_data: 'gen_key_90' }, { text: '365 Days', callback_data: 'gen_key_365' }],
        [{ text: '⬅️ Back to Admin Panel', callback_data: 'admin_panel' }]
    ]
};

// /admin command
bot.onText(/\/admin/, (msg) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    if (!isAdmin(userId)) {
        bot.sendMessage(chatId, '⛔ You are not authorized to use this command.');
        return;
    }

    bot.sendMessage(chatId, '⚙️ Welcome to the Admin Panel ⚙️', {
        reply_markup: adminPanelKeyboard
    });
});

// Callback Query Handler for Admin Panel actions
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (!isAdmin(userId)) {
        bot.answerCallbackQuery(callbackQuery.id, { text: '⛔ Unauthorized!', show_alert: true });
        return;
    }

    // Main Admin Panel
    if (data === 'admin_panel') {
        bot.editMessageText('⚙️ Welcome to the Admin Panel ⚙️', {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reply_markup: adminPanelKeyboard
        });
        bot.answerCallbackQuery(callbackQuery.id);
    }

    // Generate Key - Show duration options
    if (data === 'admin_generate_key') {
        bot.editMessageText('Select the duration for the new license key:', {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reply_markup: generateKeyDurationKeyboard
        });
        bot.answerCallbackQuery(callbackQuery.id);
    }

    if (data.startsWith('gen_key_')) {
        const durationDays = parseInt(data.split('_')[2]);
        const newKey = generateKey(durationDays);
        const responseText = `✅ New key generated for **${durationDays} days**:\n\n\`${newKey}\`\n\n(Tap to copy)`;
        
        bot.editMessageText(responseText, {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: '⬅️ Back to Admin Panel', callback_data: 'admin_panel' }]]
            }
        });
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Key Generated!' });
    }

    // List All Keys
    if (data === 'admin_list_keys') {
        let responseText = '📋 **All Generated License Keys**\n\n';
        const allKeys = Object.keys(licenseKeys);
        if (allKeys.length === 0) {
            responseText = 'No keys have been generated yet.';
        } else {
            allKeys.forEach(key => {
                const keyData = licenseKeys[key];
                responseText += `🔑 \`${key}\`\n`;
                responseText += `   Status: ${keyData.status}\n`;
                responseText += `   Duration: ${keyData.duration} days\n`;
                if (keyData.status === 'used') {
                    responseText += `   Used by: ${keyData.usedBy}\n`;
                    responseText += `   Expires: ${new Date(keyData.expiresAt).toLocaleDateString()}\n`;
                }
                responseText += '\n';
            });
        }

        if (responseText.length > 4096) {
           responseText = responseText.substring(0, 4000) + "\n\n... (list truncated)";
        }

        bot.editMessageText(responseText, {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: '⬅️ Back to Admin Panel', callback_data: 'admin_panel' }]]
            }
        });
        bot.answerCallbackQuery(callbackQuery.id);
    }

    // List Licensed Users
    if (data === 'admin_list_users') {
        let responseText = '👥 **All Licensed Users**\n\n';
        const allUsers = Object.keys(licensedUsers);
        let activeUserCount = 0;

        if (allUsers.length === 0) {
            responseText = 'No users have activated a license yet.';
        } else {
            allUsers.forEach(uid => {
                if (isLicensed(uid)) { // Only show active users
                    activeUserCount++;
                    const userData = licensedUsers[uid];
                    responseText += `👤 User ID: \`${uid}\`\n`;
                    responseText += `   Key: \`${userData.key}\`\n`;
                    responseText += `   Expires: ${new Date(userData.expiresAt).toLocaleString()}\n\n`;
                }
            });
            if (activeUserCount === 0) {
                responseText = 'No users with currently active licenses.';
            }
        }
        
        if (responseText.length > 4096) {
           responseText = responseText.substring(0, 4000) + "\n\n... (list truncated)";
        }

        bot.editMessageText(responseText, {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: '⬅️ Back to Admin Panel', callback_data: 'admin_panel' }]]
            }
        });
        bot.answerCallbackQuery(callbackQuery.id);
    }
});

// =================================================================
// Bot Start
// =================================================================
console.log(`${BOT_NAME} Bot is running...`);

// Error handling to keep the bot alive
bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.code} - ${error.message}`);

});
