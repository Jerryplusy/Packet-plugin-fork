export class GreyText extends plugin {
  constructor() {
    super({
      name: '灰字发送',
      dsc: 'Raw PB 灰字',
      event: 'message',
      priority: 500,
      rule: [{
        reg: '^#hz\\s*(.+?)',
        fnc: 'sendGrey'
      }, {
        reg: '^#(\\d+)sys\\s*\\+\\s*(.+)',
        fnc: 'sendGreyToGroup'
      }]
    })
  }

  async sendGrey(e) {
    if (!this.e.isMaster) return true
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

  async sendGreyToGroup(e) {
    if (!this.e.isMaster) return true
    
    // 解析群号和内容
    const match = e.msg.match(/^#(\d+)sys\s*\+\s*(.+)/)
    if (!match) return true
    
    const groupId = match[1]
    const content = match[2].trim()
    
    // 检查是否在私聊中
    if (!e.isPrivate) {
      e.reply('此命令只能在私聊中使用')
      return true
    }
    
    // 检查bot是否在目标群中
    if (!e.bot || !e.bot.gl || !e.bot.gl.has(groupId)) {
      e.reply(`未找到群 ${groupId}，请确认bot已加入该群`)
      return true
    }
    
    // 获取群信息
    let group = null
    if (e.bot.pickGroup) {
      try {
        group = e.bot.pickGroup(groupId)
      } catch (err) {
        logger.warn(`获取群对象失败: ${err.message}`)
      }
    }
    
    const groupInfo = e.bot.gl.get(groupId)
    
    // 创建群聊事件对象，复制原事件的所有属性
    const groupEvent = Object.create(Object.getPrototypeOf(e))
    Object.assign(groupEvent, e)
    
    // 修改为群聊相关属性
    groupEvent.group_id = groupId
    groupEvent.message_type = 'group'
    groupEvent.isGroup = true
    groupEvent.isPrivate = false
    groupEvent.group = group
    groupEvent.group_name = groupInfo?.group_name || groupId
    
    // 构建packet
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
    
    // 使用群聊事件发送
    try {
      await Packet.Long(groupEvent, packet)
      e.reply(`已向群 ${groupId} 发送灰字消息`)
    } catch (err) {
      logger.error(`发送灰字消息失败: ${err.message}`, err)
      e.reply(`发送失败: ${err.message}`)
    }
    return true
  }
}