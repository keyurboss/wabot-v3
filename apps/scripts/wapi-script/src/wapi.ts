/* eslint-disable @typescript-eslint/no-explicit-any */
// import { injectapi, ResponseOfChat, Store } from './wapi.extra';
import '@wppconnect/wa-js';
window.NameToCheckLocalstorageForLogin = 'last-wid-md';
console.log("Version 2.0.8")
declare const WPP:any;
export interface ExposedApiInterface {
  onIpcRender: (chanel: string, cb: (...params: any) => void) => void;
  sendIpcRender: (chanel: string, ...data: any) => void;
  InvokeIpcRender: (chanel: string, ...data: any) => Promise<any>;
  AddIpcListner: (chanel: string, callback: (...args: any) => void) => void;
}
window.printData = false;
const CreateChatCallFromLib = true;
declare const ExposedApi: ExposedApiInterface;
window.yess = {
  chat:WPP.chat,
  contact:WPP.contact,
  blocklist:WPP.blocklist,
  group:WPP.group,
  whatsapp:WPP.whatsapp,
  webpack:WPP.webpack,
  conn:WPP.conn,
};
function messageRecivedstatus(number: string | number) {
  SendToHost('messageRecived', number.toString().replace('@c.us', ''));
}
let StoredMessageId: string[] = JSON.parse(
  localStorage.getItem('StoredMessageId') ?? '[]'
);
function setStoredMessageId(s: string[]) {
  localStorage.setItem('StoredMessageId', JSON.stringify(s));
  StoredMessageId = s;
}
// const MessagesMap = new Map<string, MsgModel>();
window.checkExist = CheckNumberExist;
async function CheckNumberExist(
  number: string,
  options?: {
    createChat?: boolean;
    sendWidObj?: boolean;
  }
) {
  number = cleanNumber(number);
  const isBlocked = WPP.blocklist.isBlocked(number);
  if (isBlocked) {
    throw new Error('Number is Blocked');
  }
  const chatFind = WPP.chat.get(number);
  const SendWid = options?.sendWidObj || false;
  if (typeof chatFind === 'undefined') {
    return WPP.contact
      .queryExists(number)
      .then((a) => (a === null ? false : SendWid ? a : true))
      .then(async (a) => {
        if (options?.createChat) {
          const wid = SendWid ? a : WPP.whatsapp.WidFactory.createUserWid(number);
          await WPP.whatsapp.ChatStore.gadd(wid);
        }
        return a;
      });
  } else {
    return SendWid
      ? {
          wid: chatFind.id,
        }
      : true;
  }
}
// declare const sockegtConn: Socket;
const sockegtConn = {
  emit: (chanel: string, ...d: any) => {
    ExposedApi.sendIpcRender(chanel, ...d);
  },
};
declare const window: any;
const outgoingChannel = 'whatsapp_data';

window.WAPI_LOADED = true;
const ReqIds = [];

if (typeof window.RemoveWapiListners === 'function') {
  window.RemoveWapiListners();
}
const SocketConnGetWapiListner = async (channel: string, ...a: any[]) => {
  if (window.printData) {
    console.log(channel, ...a);
  }
  if (channel === 'wapi_status') {
    sockegtConn.emit(outgoingChannel, 'wapi_status', true);
  } else if (channel === 'getAllGroups') {
    const ChatList = await WPP.chat.list();
    const x = ChatList.filter((a) => a.id.server === 'g.us').map((a) => {
      return {
        id: a.id._serialized,
        name: a.contact.name,
        contactsCount: a.groupMetadata.participants.length,
        selected: false,
      };
    });
    sockegtConn.emit(outgoingChannel, channel, x);
  } else if (channel === 'getGroupParticipantIDs') {
    const gids: string[] = a[0];
    if (gids && Array.isArray(gids) && gids.length > 0) {
      const gdata = {};
      await Promise.all(
        gids.map(async (gid: string) => {
          const groupdata = await WPP.group.getParticipants(gid);
          if (Array.isArray(groupdata)) {
            gdata[gid] = groupdata.map((p) => +p.id.user);
          } else {
            gdata[gid] = [];
          }
        })
      );
      sockegtConn.emit(outgoingChannel, channel, gdata);
    } else {
      sockegtConn.emit(outgoingChannel, channel, {});
    }
  } else if (channel === 'getMyContacts') {
    const ContactList = await WPP.contact.list();
    const x = ContactList.filter(
      (a: any) =>
        (a.isMyContact || a.isAddressBookContact) && a.id.server === 'c.us'
    ).map((a, i) => {
      return {
        id: i,
        contact: +a.id.user,
        name: a.name,
        blacklisted: false,
        selected: false,
      };
    });
    sockegtConn.emit(outgoingChannel, channel, x);
  } else if (channel === 'existingNumbers') {
    const number_status = await CheckNumberExist(a[0]);
    sockegtConn.emit(outgoingChannel, channel, number_status);
  } else if (channel === 'sendContent') {
    let number = a[0];
    const content: ContentData = a[1];
    const sendpreparedOrforward: boolean = a[2];
    let storeid: boolean = a[3];
    const reqid: string = a[4];
    if (
      typeof content !== 'undefined' &&
      Array.isArray(content) &&
      typeof sendpreparedOrforward !== 'undefined'
    ) {
      if (typeof storeid === 'undefined') {
        storeid = false;
      }
      try {
        const exist = await CheckNumberExist(number, {
          createChat: true,
        });
        if (exist === false) {
          throw new Error('Number Not Exist');
        }

        if (sendpreparedOrforward) {
          if (StoredMessageId.length > 0 || content.length > 0) {
            number = cleanNumber(number);
            if (content.length > 0) {
              await SendArrayOfContent(number, content);
            }

            if (StoredMessageId.length > 0) {
              // const chatObj = await WPP.chat.find(number);
              for (const s of StoredMessageId) {
                try {
                  await WPP.chat.forwardMessage(number, s).catch((e) => {
                    console.log(e);
                  });
                  messageRecivedstatus(number);
                } catch (error) {
                  SendStatusofNumber(
                    number,
                    false,
                    'Foward Message method failed',
                    reqid
                  );
                  return;
                }
              }
              SendStatusofNumber(number, true, '', reqid);
            } else {
              SendStatusofNumber(number, true, '', reqid);
            }
            return;
          }
          SendStatusofNumber(
            number,
            false,
            'Message or Files not found',
            reqid
          );
        } else {
          if(window.printData){
            debugger
          }
          SendArrayOfContent(number, content).then((ids) => {
            if (storeid) {
              setStoredMessageId(ids);
            }
            SendStatusofNumber(number, true, '', reqid);
          });
        }
      } catch (error) {
        console.error(error);
        SendStatusofNumber(number, false, error.error || error.message, reqid);
      }
    }
  } else if (channel === 'clearPreparedFiles') {
    setStoredMessageId([]);
    sockegtConn.emit(outgoingChannel, channel, true);
  } else if (channel === 'reqidrecived') {
    const r: string = a[0];
    const index = ReqIds.indexOf(r);
    if (index > -1) {
      ReqIds.splice(index, 1);
    }
  }
};
// sockegtConn.on('getWapi', SocketConnGetWapiListner);
if (ExposedApi) {
  ExposedApi.onIpcRender('getWapi', (c, ...s) => {
    SocketConnGetWapiListner(c, ...s);
  });
}
// const OnAckListner = (s: ResponseOfChat) => {
//   const m = s.ack;
//   const fromweb = s.__x_isSentByMeFromWeb;
//   if (m == 1 && fromweb) {
//     SendToHost('messageRecived', s.to.user);
//   } else if (
//     fromweb &&
//     m == 3 &&
//     s.to.user &&
//     s.from.user &&
//     s.to.user === s.from.user
//   ) {
//     SendToHost('messageRecived', s.to.user);
//   }
// };
async function SendToHost(chanel: string, data: any) {
  sockegtConn.emit(outgoingChannel, chanel, data);
}
const findLink =
  /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/;

const linkPreviews: {
  [url: string]: any;
} = {};
async function SendArrayOfContent(
  number: string,
  con: ContentToSend[],
) {
  const idarray = [];
  for (const d of con) {
    try {
      const id = await SendContentToNumber(number, d);
      messageRecivedstatus(number);
      idarray.push(id.id);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  return idarray;
}

async function SendContentToNumber(number: string, con: ContentToSend) {
  number = cleanNumber(number);
  if (con.contentType === 'msg') {
    if (con.previewlink === true) {
      const url = con.msg.match(findLink)[0];
      if (
        typeof linkPreviews[url] === 'undefined' &&
        typeof window.Store !== 'undefined'
      ) {
        try {
          linkPreviews[url] = await ExposedApi.InvokeIpcRender(
            'axios_get',
            'https://link.openwa.cloud/api',
            {
              params: {
                url: url,
              },
            }
          );
        } catch (error) {
          linkPreviews[url] = {};
        }
      }
      return WPP.chat.sendTextMessage(number, con.msg, {
        linkPreview: linkPreviews[url],
        createChat: CreateChatCallFromLib,
      });
    }
    return WPP.chat.sendTextMessage(number, con.msg, {
      createChat: CreateChatCallFromLib,
    });
  } else if (con.contentType === 'file') {
    return WPP.chat.sendFileMessage(number, con.base64, {
      type: 'auto-detect',
      filename: con.name,
      caption: con.description,
      createChat: CreateChatCallFromLib,
    });
  }
}
async function SendStatusofNumber(
  number: string,
  status: boolean,
  reason: string,
  reqid: string
) {
  ReqIds.push(reqid);
  ExposedApi.sendIpcRender(outgoingChannel, 'SendNumberStatus', {
    number: number.toString().replace(/\D/gm, ''),
    status,
    reason,
    reqid,
  });
  const c = setInterval(() => {
    if (ReqIds.includes(reqid) === false) {
      clearInterval(c);
      return;
    }
    ExposedApi.sendIpcRender(outgoingChannel, 'SendNumberStatus', {
      number: number.toString().replace(/\D/gm, ''),
      status,
      reason,
      reqid,
    });
  }, 3000);
}
function cleanNumber(number: string) {
  if (typeof number == 'number') {
    number = number + '@c.us';
  } else if (typeof number === 'string' && !number.includes('@')) {
    number = number + '@c.us';
  }
  return number;
}

export interface ContentData {
  extraList: ExtaList[];
  tabsData: MsgTabs[];
}
interface ContentToSend {
  contentType: 'file' | 'msg';
  name: string;
  ext: string;
  type: string;
  path: string;
  hash: string;
  // index: number;
  base64: string;
  msg: string;
  previewlink?: boolean;
  variable: boolean;
  description?: string;
}
export interface ExtaList {
  name: string;
  ext: string;
  type: string;
  path: string;
  // index: number;
  base64: string;
  description?: string;
}
export interface MsgTabs {
  msg: string;
  previewlink?: boolean;
  variable: boolean;
}
