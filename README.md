<p align="center"><img src="https://github.com/s2iz/Telebot-License/blob/main/image/telebot.png?raw=true" width="750"></p>
<p align="center"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white&link=https%3A%2F%2Fnodejs.org%2Fen%2Fdownload"><img src="https://img.shields.io/badge/JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black&logoSize=auto" alt="shields"><img src="https://img.shields.io/badge/Telebot-2ca5e0?style=for-the-badge&logo=telegram&logoColor=white&logoSize=auto" alt="shields"><img src="https://img.shields.io/badge/version-1.0-white?style=for-the-badge&labelColor=purple&logo=adobefonts&logoColor=white" alt="shields"></p>

<h2>📸 Project Screenshots</h2>

<img src="https://github.com/s2iz/Telebot-License/blob/main/image/screenshot.gif?raw=true" width="480">


  
  
<h2>🧐 Features</h2>

Here're some of the project's best features:

*   Secure Access Control: Prevents unauthorized use by requiring users to input a valid license key for bot access.
*   End-User Interface: A streamlined interface for users to effortlessly activate their licenses and begin using the bot.
- Admin Dashboard: A comprehensive administrative panel that allows managers to:
  - Generate new license keys (individually or in batches).
  - Monitor the status of all keys (e.g. Active Expired Revoked Used).
  - Manage user licenses and permissions centrally.

# <h2>🕹 Bot Commands</h2>

| Command | Description | Access |
| --- | --- | --- |
| `/start` | Start the bot and show menu | Everyone |
| `/redeem` | Activate **license key** to get access | Everyone |
| `/admin` | Show admin control panel & generate keys | Admin |

## ⚙️ Configuration

The bot is configured through the `index.js` file:

```javascript

const BOT_TOKEN = 'Bot token';
const ADMIN_ID = bot admin id;
const BOT_NAME = 'Bot name'; 

```

<h2>🛠️ Installation Steps:</h2>

1. Install node.js from [here](https://nodejs.org/en/download)

2. get package.json file

```
npm init -y
```

3. install packages</p>

```
npm install node-telegram-bot-api uuid
```
4. run the bot</p>

```
node index.js
```

## 📜 License

> [!NOTE]
> This project is licensed under the MIT License - see the LICENSE file for details.

> [!WARNING]
> This project is 100% free and no one has the right to sell it.

## 👨‍💻 Credits

* Developed with 💜 by [Abdelrahman](https://guns.lol/33/) 
