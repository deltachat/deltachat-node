export interface Message {
  getText(): string;
  getFromId(): number;
  chatId: number;
  duration: number;
  file: string;
  fromId: number;
  id: number;
  receivedTimestamp: number;
  sortTimestamp: number;
  text: string;
  timestamp:  number;
  hasLocation: boolean;
  viewType: number;
  state: string;
  hasDeviatingTimestamp: boolean;
  showPadlock: boolean;
  summary: string;
  isSetupmessage: boolean;
  isInfo: boolean;
  isForwarded: boolean;
  dimensions: {
    height: number;
    width: number;
  }
}

export interface Contact{
  getProfileImage(): string;
  address: string;
  color: string;
  displayName: string;
  firstName: string;
  id: number;
  name: string;
  profileImage: string;
  nameAndAddr: string;
  isBlocked: boolean;
  isVerified: boolean;
  toJson(): Contact;
}

export interface Chat  {
  toJson?(): Chat;
  archived: boolean;
  color: string;
  id: number;
  name: string;
  profileImage: string;
  getProfileImage?(): string;
  subtitle: string;
  type: number;
  isSelfTalk: boolean;
  isUnpromoted: boolean;
  isVerified: boolean;
  isDeviceTalk?: boolean;
}

export interface ChatList {
  getChatId (index: number): number;
  getCount (): number;
  getMessageId (index: number): number;
  getSummary (index: number, chat?: Chat): Lot;
}


export interface LocaleData {
  locale: string;
  messages: {
    [key: string]: {message: string}
  }
} 

export interface Location {
  accuracy: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  contactId: number;
  msgId: number;
  chatId: number;
  isIndependent: boolean;
  marker: string;
}

export interface Locations {
  locationToJson (index: number): Location;
  toJson (): Array<Location>;
  getCount (): number;
  getAccuracy (index: number): number;
  getLatitude (index: number): number;
  getLongitude (index: number): number;
  getTimestamp (index: number): number;
  getMsgId (index: number): number;
  getContactId (index: number): number;
  getChatId (index: number): number;
  isIndependent (index: number): boolean;
  getMarker (index: number): string;
}

export interface Summary {
  state: number;
  text1: string;
  text1Meaning: string;
  text2: string;
  timestamp: number;
}

export interface Lot {
  toJson (): Summary;
  getId (): number;
  getState (): number;
  getText1 (): string;
  getText1Meaning (): string;
  getText2 (): string;
  getTimestamp (): number;
}

export class DeltaChat {
  markSeenMessages(messagIds: any): void;
  getChatList(listFlags: number, queryStr: any, queryContactId: any): ChatList;
  getFreshMessageCount(chatId: any): number;
  getDraft(chatId: any): Message;
  getFreshMessages(): Array<Message>
  getMessage(id: number): Message;
  setLocation(latitude: number, longitude: number, accuracy: number): void;
  getLocations(chatId: number, contactId: number, timestampFrom: number, timestampTo: number): Array<Location>;
  getContactEncryptionInfo(contactId: number): string;
  getSecurejoinQrCode(chatId: number): string;
  removeContactFromChat(chatId: number, contactId: number): boolean;
  setChatName(chatId: number, name: string): boolean;
  getChat(chatId: number): Chat;
  setChatProfileImage(chatId: number, arg1: string): boolean;
  addContactToChat(chatId: number, id: number): boolean;
  createVerifiedGroupChat(name: string): Chat;
  createUnverifiedGroupChat(name: string): Chat;
  deleteChat(chatId: number): void;
  archiveChat(chatId: number, archive: boolean): void;
  getChatContacts(chatId: number): Array<number>;
  markNoticedChat(chatId: number): void;
  getChatMedia(_selectedChatId: number, msgType1: number, msgType2: number): Array<string>;
  getInfo(): string;
  setConfig(arg0: string, newImage: string): void;
  getBlockedContacts(): Array<Contact>;
  getContact(id: number): Contact;
  getContacts(listFlags: number, queryStr: string): Array<Contact>;
  initiateKeyTransfer(cb: any): boolean;
  continueKeyTransfer(messageId: number, setupCode: string, cb: any): boolean;
  getProviderFromEmail (email: string): {
    before_login_hint: string,
    overview_page: string,
    status: number,
  };
  static getSystemInfo(): string;
}