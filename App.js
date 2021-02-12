/* eslint-disable camelcase */
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const TelegramBot = require('node-telegram-bot-api')
require('dotenv-flow').config()

const app = express()

app.use(bodyParser.json())
app.use(cors())

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true })

let chatId

bot.onText(/\/(.+)/, (msg, match) => {
  switch (match[1]) {
    case 'start': {
      chatId = msg.chat.id

      bot.sendMessage(chatId, 'Channel successfully subscribed on commit tracking')
      break
    }
    default:
      break
  }
})

app.use(
  '/push-callback',
  (req, res, next) => {
    if (req.headers['x-gitlab-token'] !== process.env.ACCESS_TOKEN) return res.status(403).send('Token is not valid')
    next()
  },
  async (req, res) => {
    const { user_name, ref, commits, total_commits_count } = req.body

    const branch = ref.split('/')[2]

    const commitWord = total_commits_count === 1 ? 'commit' : 'commits'

    await bot.sendMessage(
      chatId,
      `${total_commits_count} New ${commitWord} was made by <b>${user_name}</b> on the branch <b>${branch}</b>:
${commits.map((commit) => commit.title).join('\n')}`,
      { parse_mode: 'HTML' }
    )

    res.send('OK')
  }
)

const server = app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`  Server Listening on port ${server.address().port}`)
})
