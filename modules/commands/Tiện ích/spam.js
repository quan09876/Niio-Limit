module.exports.config = {
  name: "spam",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "Vtuan",
  description: "spam đến chết một nội dung",
  commandCategory: "Tiện ích",
  usages: "",
  cooldowns: 1,
  envConfig: {
    spamDelay: 2,
    maxSpamDuration: 120 // Thêm thời gian tối đa spam (giây)
  }
};

const spamThreads = new Set();  
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.run = async function ({ api, event, args }) { 
  const { threadID, messageID, senderID } = event;
  const content = (args.length != 0) ? args.join(" ") : "prefix";
  
  if (args[0] === "stop") {
    if (spamThreads.has(threadID)) {
      spamThreads.delete(threadID);
      return api.sendMessage('Đã dừng spam!', threadID, messageID);
    } 
    return api.sendMessage('Không có quá trình spam nào đang diễn ra!', threadID, messageID);
  } 
  
  if (!spamThreads.has(threadID)) {
    spamThreads.add(threadID);
    api.sendMessage(`Bắt đầu spam! Tự động dừng sau ${this.config.envConfig.maxSpamDuration} giây.`, threadID, messageID);
    
    // Thêm timeout tự động dừng sau 240 giây
    const stopTimeout = setTimeout(() => {
      if (spamThreads.has(threadID)) {
        spamThreads.delete(threadID);
        api.sendMessage('Đã tự động dừng spam sau 240 giây!', threadID);
      }
    }, this.config.envConfig.maxSpamDuration * 1000);
    
    try {
      const startTime = Date.now();
      while (spamThreads.has(threadID)) {
        await delay(this.config.envConfig.spamDelay * 1000);
        if (spamThreads.has(threadID)) {
          // Kiểm tra thời gian đã spam
          const elapsedTime = (Date.now() - startTime) / 1000;
          if (elapsedTime >= this.config.envConfig.maxSpamDuration) {
            break;
          }
          api.sendMessage(content, threadID);
        }
      }
    } finally {
      clearTimeout(stopTimeout);
      spamThreads.delete(threadID);
    }
  } else {
    api.sendMessage('Đang spam rồi cut!', threadID, messageID);
  }
};
