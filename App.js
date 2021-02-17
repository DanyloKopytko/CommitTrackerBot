/* eslint-disable camelcase, no-console */
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const TelegramBot = require('node-telegram-bot-api')
const { v4: uuidv4 } = require('uuid')
require('dotenv-flow').config()
const sequelize = require('./config/db')
const { Connection } = require('./models')

const app = express()

app.use(bodyParser.json())
app.use(cors())

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true })

bot.onText(/\/(.+)/, async (msg, match) => {
  const chatId = msg.chat.id

  try {
    switch (match[1]) {
      case 'start': {
        console.log(`Command: ${match[1]}, chatId: ${chatId}`)

        const [connection, isNewRecord] = await Connection.findOrCreate({
          where: { chatId },
          defaults: { chatId, token: uuidv4() },
        })

        if (isNewRecord) {
          await bot.sendMessage(
            connection.chatId,
            `Channel successfully subscribed on commit tracking:
    1) Head to your GitLab project -> Settings -> WebHooks
    2) Paste <i>${process.env.SERVER_URL}/push-callback/${connection.id}</i> to the URL param
    3) <i>${connection.token}</i> to the Secret Token param
    4) Mark the Push events in the Triggers section and input the branch name you would like to be notified about
    5) Click Add webhook button
    6) Repeat for each branch you need`,
            { parse_mode: 'HTML' }
          )
        } else {
          await bot.sendMessage(connection.chatId, 'Channel has already been subscribed')
        }

        break
      }
      default:
        break
    }
  } catch (e) {
    console.error(e)
    await bot.sendMessage(chatId, 'Something went wrong...')
  }
})

app.post(
  '/push-callback/:id',
  async (req, res, next) => {
    try {
      const connection = await Connection.findByPk(req.params.id)

      if (req.headers['x-gitlab-token'] !== connection.token) return res.status(403).send('Token is not valid')

      req.body.connection = connection

      next()
    } catch (e) {
      return res.status(400).send(e.message)
    }
  },
  async (req, res) => {
    try {
      const {
        user_name,
        ref,
        commits,
        total_commits_count,
        connection: { chatId },
      } = req.body

      const branch = ref.split('/')[2]

      const commitWord = total_commits_count === 1 ? 'commit' : 'commits'

      await bot.sendMessage(
        chatId,
        `${total_commits_count} New ${commitWord} was made by <b>${user_name}</b> on the branch <b>${branch}</b>:
${commits.map((commit) => commit.title).join('\n')}`,
        { parse_mode: 'HTML' }
      )

      res.send('OK')
    } catch (e) {
      return res.status(400).send(e.message)
    }
  }
)

sequelize.authenticate().then(() => {
  const server = app.listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`  Server Listening on port ${server.address().port}`)
  })
})
