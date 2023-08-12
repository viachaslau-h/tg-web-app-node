const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6673643367:AAESfl4pcGdrV0VbgFmP_QkSONdSntr3UFQ';
const webAppUrl = 'https://vermillion-belekoy-a8668b.netlify.app';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if(text === '/start'){
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполните форму', {
        reply_markup: {
            keyboard: [
                [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
            ]
        }
    })


    await bot.sendMessage(chatId, 'Заходите в наш интернет магазин по кнопике ниже', {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
            ]
        }
    })
  }

  if(msg?.web_app_data?.data) {
    try{
        const data = JSON.parse(msg?.web_app_data?.data)

        await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
        await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
        await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

        setTimeout( async () => {
            await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
        }, 3000)
    } catch (e) {
        console.log(e);
    }
  }
});

app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body;

    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {message_text: 'Вы совершили покупку на сумму ' + totalPrice}
        })
        return res.status(200).json({});
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось совершить покупку',
            input_message_content: {message_text: 'Не удалось совершить покупку'}
        })
        return res.status(500).json({});
    }
})


const PORT = 8000;

app.listen(PORT, () => console.log('server starter on PORT ' + PORT)) 