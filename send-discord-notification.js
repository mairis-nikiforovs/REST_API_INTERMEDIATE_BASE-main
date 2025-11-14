import { Webhook, MessageBuilder } from 'discord-webhook-node'
import fs from 'fs'

const hook = new Webhook('https://discord.com/api/webhooks/1437831634299916400/5rTZGUIcHghFJEinsSEQXqw39AmGopp2Jg_nmPUKZQ1G3Rex32XmacKASO2DcSHmdN9k')
fs.readFile(process.argv[2], 'utf8', (err, data) => {
    if(err){
        console.log("An error occured while reading the file", err)
    } else {
        const reportData = JSON.parse(data)
        customMessageBuilder(reportData.stats)
    }
})

function customMessageBuilder(stats){
let color = stats.failures === 0 ? '#00ff00' : '#ff0000'
        const embed = new MessageBuilder()
            .setTitle("TEST RESULTS")
            .addField('Tests Executed', stats.tests)
            .addField('Tests Passed', stats.passes)
            .addField('Tests Failed', stats.failures)
            .addField('Pass %', `${stats.passPercent.toFixed(2)}%`)
            .setColor(color)
        hook.send(embed)
}

