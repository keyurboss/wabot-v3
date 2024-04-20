import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SocketService } from './socket.service';

export interface groupListType {
  id: string;
  name: string;
  selected: boolean;
}
export interface contactListType {
  id: number;
  contact: number;
  name: string;
  blacklisted: boolean;
  selected: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class GrabGroupsContactsService {
  constructor(private sockServ: SocketService) {}
  async getAllGroups() {
    const wholeData: groupListType[] = (
      await firstValueFrom(this.sockServ.getFromWapi('getAllGroups'))
    ).data;
    return wholeData;
  }
  async getParticipantsFromSelectedGroups(ids: string[]) {
    const wholeData: any = (
      await firstValueFrom(
        this.sockServ.getFromWapi('getGroupParticipantIDs', ids)
      )
    ).data;
    return wholeData;
  }

  async getMyContacts() {
    const wholeData: contactListType[] = (
      await firstValueFrom(this.sockServ.getFromWapi('getMyContacts'))
    ).data;
    return wholeData;
  }
}
