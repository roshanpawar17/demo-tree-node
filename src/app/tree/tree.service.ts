import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FoodNode } from '../models/data-models';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  dataChange = new BehaviorSubject<FoodNode[]>([]);

  constructor() { }

  data: FoodNode[] = [
    {
      name: 'Fruit',
      children: [
        {name: 'Apple'}, 
        {name: 'Banana'}, 
        {name: 'Fruit loops'}
      ],
    },
    {
      name: 'Vegetables',
      children: [
        {
          name: 'Green',
          children: [
            {name: 'Broccoli'}, 
            {name: 'Brussels sprouts'}
          ],
        },
        {
          name: 'Orange',
          children: [
            {name: 'Pumpkins'}, 
            {name: 'Carrots'}
          ],
        },
      ],
    },
  ]

  getData(): Observable<any>{
    return of(this.data);
  }

  insertNode(parent: FoodNode, name: string){
    console.log("parent ", parent)
    if(parent){
      if (parent.children) {
        parent.children.push({name: name});
        this.dataChange.next(this.data);
      } else {
        parent.children = [];
        parent.children.push({name: name});
        this.dataChange.next(this.data);
      }   
    }else{
      this.data.push({name: name});
      this.dataChange.next(this.data);
    }
  }
}
