import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { DownloadFolder } from '../models/data-models';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  setDownloadedFoldersData = new Subject();
  setDownloadedFoldersDataObservable = this.setDownloadedFoldersData.asObservable();

  constructor() { }

  //response from database
  data: DownloadFolder[] = [
    {
      name: 'Administrator',
      children: [
        {name: '5.1.3'}, 
        {name: '5.10.0'}, 
        {name: '5.10.1'}
      ],
    },
    {
      name: 'AMX_Policy',
      children: [
        {
          name: '5.0.0',
          children: [
            {name: '5.0.1'}, 
            {name: '5.0.2'}
          ],
        },
        {
          name: '5.1.0',
          children: [
            {name: '5.1.1'}, 
            {name: '5.1.2'}
          ],
        },
      ],
    },
  ]

  getData(): Observable<any>{
    return of(this.data);
  }


  insertFolder(data): Observable<any>{
    console.log("insert data in databases ")
    this.data = data;
    return of(this.data);
  }

}
