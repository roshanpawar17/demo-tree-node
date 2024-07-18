import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { FileNode } from '../models/data-models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  availableDownloads = new Subject();
  availableDownloadsObservable = this.availableDownloads.asObservable();
 
 
  TREE_DATA: FileNode[] = [
    {
      name: 'Available Downloads 1',
      children: [
        {
          name: 'Administrator',
          children: [
            { name: '5.0.0', children: [{ name: 'file1.txt' }, { name: 'file2.txt' }] },
            { name: '5.1.0', children: [{ name: '5.1.1', children: [{ name: 'file4.txt' }]}, { name: 'file3.txt' }] },
            { name: '5.2.0' },
          ],
        },
        {
          name: 'AMX_Policy',
          children: [
            {
              name: '6.0.0',
              children: [
                { name: '6.0.1' },
                { name: '6.0.2' }
              ],
            },
            {
              name: '6.1.0',
              children: [
                { name: '6.1.1' },
                { name: '6.1.2' }
              ],
            },
            {
              name: 'image2.png'
            }
          ],
        },
      ]
    }
  ];
 
 
  constructor(
    private http: HttpClient
  ) { }
 
  private baseUrl = 'http://localhost:8080';

  getData(id?): Observable<any> {
    // return of(this.TREE_DATA);
    if(id){
      return this.http.get(`${this.baseUrl}/attachment/get_file_or_folder_contents1?itemAttachmentId=${id}`);
    }else{
      return this.http.get(`${this.baseUrl}/attachment/get_file_or_folder_contents`);
    }
  }
 
 
 
 
  insertFolder(data): Observable<any> {
    console.log("insert data in databases ")
    this.TREE_DATA = data;
    return of(this.TREE_DATA);
  }
 
 
  deleteFolder(data): Observable<any> {
    console.log("delete data in databases ")
    this.TREE_DATA = data;
    return of(this.TREE_DATA);
  }
 

}


// note - In database

// parent table                                                                           //chidren table

// primaryKey(parentId)    data                     foreignKey(itemAttachmentiD)           primaryKey    data  
// 0                        Available downloads       31                                    31            Adminstrator
