import { Subject, BehaviorSubject } from 'rxjs';
import { WritableSignal } from '@angular/core';
// import { WhatsappSendMessageClass } from './whatsappSend';
export interface UserInterface {
  created_at: number;
  expire_at: number;
  is_active: boolean;
  is_trial: boolean;
  name: string;
  number: number;
  ref_no: string;
  type: 'free' | 'plus' | 'premium';
}

export interface OpenDialogFilter {
  filter: FilterArray[];
}

export interface UserSettingsData {
  indivisual_interval: number;
  batch_interval: {
    is_active: boolean;
    batch_count: number;
    batch_interval: number;
  };
}

export interface WhatsappGroupsData {
  id: string;
  name: string;
}
export interface WhatsappGroupContacts {
  [key: string]: string[];
}
export interface DisplayStatusData {
  NumberListner: Subject<MsgSendNumberStatus>;
  NumberList: string[];
  // SendObje: WhatsappSendMessageClass;
  MsgRecivedListner: Subject<number>;
  MessageStopSend: BehaviorSubject<boolean>;
}
export interface FilterArray {
  name: string;
  extentions: string[];
}
export interface DownloadDataEvent {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
}
export interface DownloadDataProgress {
  dataObse: Subject<DownloadDataEvent>;
  finish: Subject<boolean>;
}
export interface Root {
  showIT: boolean;
  ele: boolean;
  local: {
    loggedinWhatsapp: boolean;
  };
}
export interface LoginSelectionResultInterface {
  type: 'new' | 'old' | 'existing';
  user?: any;
}
export interface SubscribeData {
  name: string;
  number: number;
  ref: string;
  cpuid: string;
}
export interface MsgTabs {
  contentType: 'msg';
  msg: string;
  previewlink?: boolean;
  variable: boolean;
}
export interface MsgSendNumberStatus {
  number: string;
  status: boolean;
}
export interface ContentData {
  extraList: WritableSignal<ExtaList[]>;
  tabsData: WritableSignal<MsgTabs[]>;
}
export interface ExtaList {
  contentType: 'file';
  name: string;
  ext: string;
  type: string;
  path: string;
  index: number;
  hash?: string;
  base64: string;
  description?: string;
}
export interface WhatsappMyContacts {
  id: string | number;
  name: string;
  shortName: string;
  formattedName: string;
  isSelected?: boolean;
}
export interface DisplayDataObseData {
  number: string;
  status: boolean;
  reason?: string;
}

export interface ImportedDataInTable {
  index?: number;
  number: number;
  var1?: any;
  var2?: any;
  var3?: any;
  var4?: any;
  var5?: any;
  var6?: any;
}

export interface OrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: null;
  status: string;
  attempts: number;
  notes: OrderGenratedReqNotes;
  created_at: number;
}

export interface OrderGenratedReqNotes {
  created_at: number;
  expire_at: number;
  is_active: boolean;
  is_trial: boolean;
  last_updated_at: number;
  name: string;
  number: number;
  ref_no: string;
  type: string;
  uni_order_id: string;
  uid: string;
}

export interface SuccessPaymentResponseInterface {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface FailurePaymentResponseInterface {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

export interface InquiriesInterface extends IncomingInquiriesInterface {
  inq_id: string;
}
export interface IncomingInquiriesInterface {
  subject: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  inquiry_type: 'downgrade_package' | 'complaint' | 'other';
  description: string;
  uid: string;
  reply_from_admin?: string;
}
