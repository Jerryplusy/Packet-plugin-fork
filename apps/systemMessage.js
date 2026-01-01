export class GreyText extends plugin {
  constructor() {
    super({
      name: '灰字发送',
      dsc: 'Raw PB 灰字',
      event: 'message',
      priority: 500,
      rule: [{
        reg: '^#hz\\s*(.+?)',
        fnc: 'sendGrey',
        permission: 'master'
      }]
    })
  }

  async sendGrey(e) {
    const content = e.msg.substring(3).trim()

    const packet = {
      "25": {
        "1": {
          "1": 11,
          "50": "3573715425",
          "20": {
            "2": 3573715425,
            "3": 3009074854,
            "4": 800800864
          },
          "5": 8,
          "0": {
            "1": 1
          },
          "28": {
            "1": 2,
            "2": content,
            "3": 800800864,
            "4": {
              "1": "",
              "2": 0
            }
          },
          "30": 2,
          "14": 1
        }
      }
    }
    // e.reply(JSON.stringify(packet))
    await Packet.Long(e, packet)
    return true
  }
}