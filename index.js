const venom = require("venom-bot");
const moment = require("moment-timezone");
const { errorLogger, successLogger } = require("./logger");
const { getScheduleByDate } = require("./parse");

moment.tz.setDefault("Asia/Jakarta");

venom
  .create()
  .then((client) => start(client))
  .catch((error) => {
    console.log(error);
  });

const start = (client) => {
  client.onMessage(async (message) => {
    if (
      (["jadwalhariini"].includes(
        message.body.toLowerCase().replace(/\s/g, "")
      ) ||
        message.body.toLowerCase() == "jadwal") &&
      message.isGroupMsg
    ) {
      try {
        let dt = moment({ hour: 0 });
        let schedule = await getScheduleByDate(dt);
        const result = await client.sendText(
          message.from,
          getScheduleMessage(schedule, dt)
        );
        successLogger.info(result);
      } catch (error) {
        errorLogger.error(error);
      }
    } else if (
      ["jadwalbesok"].includes(message.body.toLowerCase().replace(/\s/g, "")) &&
      message.isGroupMsg
    ) {
      try {
        let dt = moment({ hour: 0 }).add(1, "days");
        let schedule = await getScheduleByDate(dt);
        const result = await client.sendText(
          message.from,
          getScheduleMessage(schedule, dt)
        );
        successLogger.info(result);
      } catch (error) {
        errorLogger.error(error);
      }
    } else if (
      ["jadwal"].includes(message.body.toLowerCase().split(" ")[0]) &&
      message.body
        .split(" ")[1]
        .match(
          /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
        ) &&
      message.isGroupMsg
    ) {
      try {
        let dt = moment(message.body.split(" ")[1], "DD-MM-YYYY");
        let schedule = await getScheduleByDate(dt);
        const result = await client.sendText(
          message.from,
          getScheduleMessage(schedule, dt)
        );
        successLogger.info(result);
      } catch (error) {
        errorLogger.error(error);
      }
    }
  });
};

const getScheduleMessage = (schedule, date) => {
  let message = `*JADWAL PROKER ${date.format("DD-MM-YYYY")}*\n\n`;
  message += "*Slot pagi (00:00 - 08:00):*\n";
  Object.keys(schedule.pagi).forEach((key, idx) => {
    message += `${idx + 1}. PIC: ${key}
   Nama Proker: ${schedule.pagi[key].proker_name}
   Nama Kegiatan: ${schedule.pagi[key].kegiatan_name}
   Bantu: ${schedule.pagi[key].bantu.join(", ")}\n\n`;
  });

  message += "*Slot siang (08:00 - 16:00):*\n";
  Object.keys(schedule.siang).forEach((key, idx) => {
    message += `${idx + 1}. PIC: ${key}
   Nama Proker: ${schedule.siang[key].proker_name}
   Nama Kegiatan: ${schedule.siang[key].kegiatan_name}
   Bantu: ${schedule.siang[key].bantu.join(", ")}\n\n`;
  });

  message += "*Slot malam (16:00 - 24:00):*\n";
  Object.keys(schedule.malam).forEach((key, idx) => {
    message += `${idx + 1}. PIC: ${key}
   Nama Proker: ${schedule.malam[key].proker_name}
   Nama Kegiatan: ${schedule.malam[key].kegiatan_name}
   Bantu: ${schedule.malam[key].bantu.join(", ")}\n\n`;
  });
  return message;
};
