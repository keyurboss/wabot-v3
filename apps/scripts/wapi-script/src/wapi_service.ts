/* eslint-disable @typescript-eslint/no-explicit-any */
import  '@wppconnect/wa-js';
import { Socket } from 'socket.io-client';
const CreateChatCallFromLib = false;
declare const sockegtConn: Socket;
declare const window: any;
declare const WPP: any;
function removeAllListners() {
  if (typeof sockegtConn !== 'undefined') {
    sockegtConn.removeListener(window.sendImage);
    sockegtConn.removeListener(window.sendMessage);
    try {
      sockegtConn.removeListener();
    } catch (error) {
      console.log(error);
    }
  }
  if (
    typeof ExposedAPIs !== 'undefined' &&
    typeof ExposedAPIs.RemoveAllListners === 'function'
  ) {
    ExposedAPIs.RemoveAllListners('send_image');
    ExposedAPIs.RemoveAllListners('send_message');
  }
}

removeAllListners();
declare const ExposedAPIs: {
  sendIpcRender: (chanel: string, data?: any) => void;
  RemoveAllListners: (chanel: string) => void;
  InvokeIpcRender: <T>(chanel: string, data?: any) => Promise<T>;
  AddIpcListner: (chanel: string, callback: (...args: any) => void) => void;
  AddIpcListnerOnce: (chanel: string, callback: (...args: any) => void) => void;
  rid: number;
};
function SendDataToHost(data: any, chanel = 'to_remote') {
  if (typeof sockegtConn !== 'undefined') {
    sockegtConn.emit(chanel, data);
  }
  if (
    typeof ExposedAPIs !== 'undefined' &&
    typeof ExposedAPIs.sendIpcRender === 'function'
  ) {
    ExposedAPIs.sendIpcRender(chanel, data);
  }
}

console.log('WAPI Version 2.0.5');

window.sendImage = async (a: FromRemote) => {
  const Respo = {};
  console.log('asdjausdhaioshdih');
  try {
    await Promise.all(
      a.data.to.map(async (n) => {
        try {
          await window?.CheckNumberExist(n, {
            createChat: true,
          });
          await WPP.chat.sendFileMessage(`${n}@c.us`, a.data.base64, {
            type: 'auto-detect',
            filename: a.data.media_name,
            caption: a.data.img_desc || undefined,
            createChat: CreateChatCallFromLib,
          });
          Respo[n] = true;
        } catch (error) {
          Respo[n] = false;
        }
      })
    );
  } catch (error) {
    console.log(error);
    SendDataToHost(
      Object.assign(a, {
        data: {
          status: 114,
          error: error.message || error.error || 'Send Media Error',
        },
      })
    );
    return;
  }
  SendDataToHost(
    Object.assign(a, {
      data: Respo,
    })
  );
};
window.sendMessage = async (a: FromRemote) => {
  const Respo = {};
  try {
    await Promise.all(
      a.data.to.map(async (n) => {
        try {
          await window?.CheckNumberExist(n, {
            createChat: true,
          });
          await WPP.chat.sendTextMessage(`${n}@c.us`, a.data.msg, {
            createChat: true,
          });
          Respo[n] = true;
        } catch (error) {
          Respo[n] = false;
        }
      })
    );
  } catch (error) {
    SendDataToHost(
      Object.assign(a, {
        data: {
          status: 113,
          error: error.message || error.error || 'Send Message Error',
        },
      })
    );
    return;
  }
  SendDataToHost(
    Object.assign(a, {
      data: Respo,
    })
  );
};

window.CheckNumberExist = async (
  number: string,
  options?: {
    createChat?: boolean;
    sendWidObj?: boolean;
  }
) => {
  number = `${number}@c.us`;
  let chatFind;
  try {
    chatFind = WPP.chat.get(number)
  } catch (error) {
      //
  }
  const SendWid = options?.sendWidObj || false;
  if (typeof chatFind === 'undefined') {
    return WPP.contact
      .queryExists(number)
      .then((a) => (a === null ? false : SendWid ? a : true))
      .then(async (a) => {
        if (options?.createChat) {
          const wid = SendWid ? a : WPP.whatsapp.WidFactory.createUserWid(number);
          console.log(a,wid);
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
};
interface FromRemote {
  channel: 'send_message' | 'send_local_media' | 'send_web_media';
  data: {
    base64?: string;
    mime?: string;
    ext_name?: string;
    msg?: string;
    media_name?: string;
    img_desc?: string;
    local_media_path?: string;
    to: string[];
  };
  from: string;
  req_id: string;
}

if (
  typeof ExposedAPIs !== 'undefined' &&
  typeof ExposedAPIs.AddIpcListner === 'function'
) {
  console.log('Exposed Api Added');
  ExposedAPIs.AddIpcListner('send_image', (_, d) => {
    window.sendImage(d);
  });
  ExposedAPIs.AddIpcListner('send_message', (_, d) => {
    window.sendMessage(d);
  });
}
if (typeof sockegtConn !== 'undefined') {
  console.log('Socket Listner Added');
  sockegtConn.on('send_image', window.sendImage);
  sockegtConn.on('send_message', window.sendMessage);
}
