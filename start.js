const ownerNumber = "123456789" + "@c.us" //Replace into your WhatsApp number, dont use symbol and space at the number.

const { Client, ChatTypes, LocalAuth} = require('whatsapp-web.js')
const fs = require('fs')
const colors = require('colors')
let userBanned = JSON.parse(fs.readFileSync('./data/userBanned.json'))
let userS = JSON.parse(fs.readFileSync('./data/user.json'))

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
})

client.on('qr', (qr) => {
    console.log('QR RECEIVED => ', qr)
})

client.on('authenticated', () => {
    console.log('PREPARING FOR CLIENT...')
})

client.on('ready', () => {
    console.log("CLIENT READY!".green)
})

//start

const pr = "/"
var isMaintenance = false

function checkBannedReason(id) {
    for (let i of userBanned) {
        if (i.id === id) {
            return i.reason
        }
    }
}

function checkBannedById(id) {
    for (let i of userBanned) {
        if (i.id === id) {
            return i.id === id
        }
    }
}

function addMoney (id, moneyAmount) {
    var found = false
    Object.keys(userS).forEach((i) => {
        if(userS[i].id == id){
            found = i
        }
    })
    if (found !== false) {
        userS[found].money += moneyAmount
        fs.writeFileSync('./data/user.json',JSON.stringify(userS))
        }
    }

function removeMoney (id, moneyAmount) {
    var found = false
    Object.keys(userS).forEach((i) => {
        if(userS[i].id == id){
            found = i
        }
    })
    if (found !== false) {
        userS[found].money -= moneyAmount
        fs.writeFileSync('./data/user.json',JSON.stringify(userS))
        }
    }

function checkMoney(id) {
    for (let i of userS) {
        if (i.id === id) {
            return i.money
        }
    }
}

client.on('message', async msg => {

    const cmd = msg.body
    const contact = await msg.getContact()
    const sender = contact.id._serialized
    const isOwner = sender == ownerNumber

    let chat = await msg.getChat()

    const checkRegisteredUser = userS.some((zack) => {
        return zack.id === sender
        })

    const checkBannedUser = userBanned.some((zack) => {
        return zack.id === sender
    })
    
    const commandCannotUse = "_You cannot use this command._"
    const botUnderMaintenance = "*BOT IS UNDER MAINTENANCE!*"
    const userIsBanned = `*YOU HAVE BEEN BANNED!*\nReason: ${checkBannedReason(sender)}`
    const userNotVerified = `*YOU ARE NOT VERIFIED!*\nTo use the bot command, you must verify by typing */verify*`

if (cmd.startsWith(pr) && cmd.length > 1 && !(cmd == pr+'info' || cmd == pr+'help' || cmd == pr+'ownerhelp' || cmd.startsWith(pr+'report') || cmd == pr+'verify' || cmd == pr+'money' || cmd == pr+'farming' || cmd.startsWith(pr+'casino') || cmd.startsWith(pr+'transfer') || cmd.startsWith(pr+'givemoney') || cmd == pr+'delete' || cmd.startsWith(pr+'maintenance') || cmd.startsWith(pr+'banned') || cmd.startsWith(pr+'unbanned'))) return msg.reply(`Command *${cmd}* not found, type */help* to see available commands.`)

    if (cmd == pr+'verify') {
        if (checkBannedUser === true) return msg.reply(userIsBanned)
        if (isMaintenance === true && !isOwner) return msg.reply(botUnderMaintenance)
        if (checkRegisteredUser === true) return msg.reply("*ERROR!*\nYou are verified.")
        userS.push(({id: sender, money: 0}))
        fs.writeFileSync('./data/user.json', JSON.stringify(userS))
        msg.reply("*SUCCESSFUL VERIFICATION!*\nNow you can use the bot command.")
    }

    if (cmd == pr+'info') {
        if (checkBannedUser === true) return msg.reply(userIsBanned)
        if (isMaintenance === true && !isOwner) return msg.reply(botUnderMaintenance)
        if (checkRegisteredUser === false) return msg.reply(userNotVerified)
        msg.reply(`*BOT INFORMATION*
This bot was created using whatsapp-web.js and made as a game that shows the concept of a casino game.

Author: Zack Rai
Instagram: @mzackrai

Source code:
https://github.com/ZackRai/casino-game-whatsapp-bot`)
    }

    if (cmd == pr+'help') {
        if (checkBannedUser === true) return msg.reply(userIsBanned)
        if (isMaintenance === true && !isOwner) return msg.reply(botUnderMaintenance)
        if (checkRegisteredUser === false) return msg.reply(userNotVerified)
        msg.reply(`*CASINO-BOT HELP*
- */money* (check money)
- */farming* (get money)
- */casino* (play casino)
- */transfer* (transfer money)
- */report* (report problem)
- */info* (bot information)`)
    }

    if (cmd == pr+'ownerhelp') {
        if (!isOwner) return msg.reply(commandCannotUse)
        msg.reply(`*OWNER HELP*
- */banned* (banned user)
- */unbanned* (unbanned user)
- */givemoney* (get unlimited money)
- */maintenance* (maintenance mode)
- */delete* (delete bot message)`)
    }

    if (cmd.startsWith(pr+'report')) {
        if (checkBannedUser === true) return msg.reply(userIsBanned)
        if (isMaintenance === true && !isOwner) return msg.reply(botUnderMaintenance)
        if (checkRegisteredUser === false) return msg.reply(userNotVerified)
        var command = pr+'report'
        if (cmd.length == command.length) return msg.reply("To use this command, type /report <your problem>\n\nExample: /report i got stuck.")
        var theReport = cmd.slice(8)
        if (theReport > 200) return msg.reply("*SOMETHING WENT WRONG!*\nMaximum 200 words.")
        client.sendMessage(ownerNumber, `*REPORT MESSAGE*\n- From: ${sender.replace("@c.us", "")}\n- Message: ${theReport}`)
        msg.reply(`_Your report has been sent to the owner._`)
    }

    if (cmd == pr+'money') {
        if (checkBannedUser === true) return msg.reply(userIsBanned)
        if (isMaintenance === true && !isOwner) return msg.reply(botUnderMaintenance)
        if (checkRegisteredUser === false) return msg.reply(userNotVerified)
        const moneyS = checkMoney(sender)
        msg.reply(`Your money balance: ${moneyS}`)
    }

    if (cmd == pr+'farming') {
        if (checkBannedUser === true) return msg.reply(userIsBanned)
        if (isMaintenance === true && !isOwner) return msg.reply(botUnderMaintenance)
        if (checkRegisteredUser === false) return msg.reply(userNotVerified)
        let dataCooldown = JSON.parse(fs.readFileSync('./data/Farming_Cooldown.json'))
        var checkCooldownUser = dataCooldown.some((zack) => { return zack.id === sender })
        if (checkCooldownUser == true) return msg.reply("*COOLDOWN!*\nPlease wait until the previous farming process is complete.")
        dataCooldown.push(({id: sender}))
        fs.writeFileSync('./data/Farming_Cooldown.json', JSON.stringify(dataCooldown))
        msg.reply("starting to farming...")
        setTimeout(() => {
            const farmingResource = Math.floor(Math.random() * 1000) + 1
            msg.reply(`*FARMING COMPLETED!*\nYou just got *${farmingResource}* money from farming.`)
            addMoney(sender, farmingResource)
            for (let [i, cooldown] of dataCooldown.entries()) {
                if (cooldown.id == sender) {
                dataCooldown.splice(i, 1)
                fs.writeFileSync('./data/Farming_Cooldown.json', JSON.stringify(dataCooldown))
            }
            break
        }
        }, 10000)
    }

    if (cmd.startsWith(pr+'casino')) {
        if (checkBannedUser === true) return msg.reply(userIsBanned)
        if (isMaintenance === true && !isOwner) return msg.reply(botUnderMaintenance)
        if (checkRegisteredUser === false) return msg.reply(userNotVerified)
        var command = pr+'casino'
        if (cmd.length == command.length) return msg.reply("To use this command, type /casino <bet amount>")
        var betAmount = cmd.slice(8)
        if (isNaN(betAmount) === true) return msg.reply(`*SOMETHING WENT WRONG!*\nThe number of bet amount must be a number.`)
        if (betAmount < 10) return msg.reply(`*SOMETHING WENT WRONG!*\nMinimum bet is *100* money.`)
        if (checkMoney(sender) < betAmount) return msg.reply(`*SOMETHING WENT WRONG!*\nYou don't have *${betAmount}* of money.`)
        var player = Math.floor(Math.random() * 36) + 1
        var enemy = Math.floor(Math.random() * 36) + 1
        const prize = betAmount * 1
        if (player == enemy) {
            msg.reply(`*DRAW!*\n- your number: *${player}*\n- enemy number: *${enemy}*`)
        } else if (player > enemy) {
            addMoney(sender, prize)
            msg.reply(`*YOU WIN!*\n- your number: *${player}*\n- enemy number: *${enemy}*\n- you get: *${betAmount}*`)
        } else if (enemy > player) {
            removeMoney(sender, prize)
            msg.reply(`*YOU LOSE!*\n- your number: *${player}*\n- enemy number: *${enemy}*\n- you lost: *${betAmount}*`)
        }
    }

    if (cmd.startsWith(pr+'transfer')) {
        if (checkBannedUser === true) return msg.reply(userIsBanned)
        if (isMaintenance === true && !isOwner) return msg.reply(botUnderMaintenance)
        if (checkRegisteredUser === false) return msg.reply(userNotVerified)
        var command = pr+'transfer'
        if (cmd.length == command.length) return msg.reply("To use this command, type /transfer <WhatsApp number> <money amount>") //You can change the whatsapp number by mention a group member.
        var wanumber = cmd.split(' ')[1].replace('@', '')
        var wanumbers = wanumber + "@c.us"
        var moneyAmount = cmd.split(' ')[2]
        const validnumber = userS.some((zack) => {
            return zack.id === wanumbers
        })
        if (validnumber == false) return msg.reply("*SOMETHING WENT WRONG!*\nThe number is not registered in bot database.")
        if (wanumbers === sender) return msg.reply("*SOMETHING WENT WRONG!*\nYou can't transfer yourself.")
        if (isNaN(moneyAmount) === true) return msg.reply(`*SOMETHING WENT WRONG!*\nThe number of money amount must be a number.`)
        if (moneyAmount < 10) return msg.reply(`*SOMETHING WENT WRONG!*\nMinimum transfer is *10* of money.`)
        if (checkMoney(sender) < moneyAmount) return msg.reply(`*SOMETHING WENT WRONG!*\nYou don't have *${moneyAmount}* of money.`)
        const prize = moneyAmount * 1
        addMoney(wanumbers, prize)
        removeMoney(sender, prize)
        msg.reply(`*SUCCESSFUL TRANSFER!*\n- From: ${sender.replace("@c.us", "")}\n- To: ${wanumber}\n- Amount: *$${moneyAmount}*`)
    }

//owner commands

    if (cmd.startsWith(pr+'givemoney')) {
        if (!isOwner) return msg.reply(commandCannotUse)
        var command = pr+'givemoney'
        if (cmd.length == command.length) return msg.reply("To use this command, type /givemoney <WhatsApp number> <money amount>")
        var wanumber = cmd.split(' ')[1].replace('@', '')
        var wanumbers = wanumber + "@c.us"
        var moneyAmount = cmd.split(' ')[2]
        const validnumber = userS.some((zack) => {
            return zack.id === wanumbers
        })
        if (validnumber == false) return msg.reply("*SOMETHING WENT WRONG!*\nThe number is not registered in bot database.")
        if (isNaN(moneyAmount) === true) return msg.reply(`*SOMETHING WENT WRONG!*\nThe number of money amount must be a number.`)
        const prize = moneyAmount * 1
        addMoney(wanumbers, prize)
        msg.reply(`successful added *${moneyAmount}* money to ${wanumber}`)
    }

    if (cmd == pr+'delete') {
        if (!isOwner) return msg.reply(commandCannotUse)
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage()
            if (quotedMsg.fromMe) {
                quotedMsg.delete(true)
            } else {
                msg.reply('*SOMETHING WENT WRONG!*\nOnly the message from bot that can be delete.')
            }
        } else {
            msg.reply("To use this command, type /delete <reply the bot message that you want to delete>")
        }
    }

    if (cmd.startsWith(pr+'maintenance')) {
        if (!isOwner) return msg.reply(commandCannotUse)
        if (isMaintenance === false) {
            isMaintenance = true
            msg.reply("MAINTENANCE MODE: ON")
        } else if (isMaintenance === true) {
            isMaintenance = false
            msg.reply("MAINTENANCE MODE: OFF")
        }
    }

    if (cmd.startsWith(pr+'banned')) {
        if (!isOwner) return msg.reply(commandCannotUse)
        var command = pr+'banned'
        if (cmd.length == command.length) return msg.reply("To use this command, type /banned <WhatsApp number> <reason>")
        var wanumber = cmd.split(' ')[1].replace('@', '')
        var wanumbers = wanumber + "@c.us"
        if (checkBannedById(wanumbers) === true) return msg.reply("*SOMETHING WENT WRONG!*\nThat number is already banned.")
        var validnumber = await client.isRegisteredUser(wanumbers)
        if (validnumber == false) return msg.reply("*SOMETHING WENT WRONG!*\nInvalid WhatsApp number.")
        var bannedReason = cmd.split(' ')[2]
        userBanned.push(({id: wanumbers, reason: bannedReason}))
        fs.writeFileSync('./data/userBanned.json', JSON.stringify(userBanned))
        msg.reply(`*BANNED SUCCESSFULLY!*\nNumber: ${wanumber}\nReason: ${bannedReason}`)
    }

    if (cmd.startsWith(pr+'unbanned')) {
        if (!isOwner) return msg.reply(commandCannotUse)
        var command = pr+'unbanned'
        if (cmd.length == command.length) return msg.reply("To use this command, type /unbanned <WhatsApp number>")
        var wanumber = cmd.slice(10).replace('@', '')
        var wanumbers = wanumber + "@c.us"
        if (checkBannedById(wanumbers) !== true) return msg.reply("*SOMETHING WENT WRONG!*\nThe number is not banned.")
        var validnumber = await client.isRegisteredUser(wanumbers)
        if (validnumber == false) return msg.reply("*SOMETHING WENT WRONG!*\nInvalid WhatsApp number.")
        for (let [i, unBanned] of userBanned.entries()) {
            if (unBanned.id == wanumbers) {
            userBanned.splice(i, 1)
            fs.writeFileSync('./data/userBanned.json', JSON.stringify(userBanned))
        }
        msg.reply(`*UNBANNED SUCCESSFULLY!*\nNumber: ${wanumber}`)
        break
    }}
})

client.initialize()