import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { TreeService } from './tree.service';

import { FoodNode } from '../models/data-models';
import { FlatNode } from '../models/data-models';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {

  flatNodeMap = new Map<FlatNode, FoodNode>();
  nestedNodeMap = new Map<FoodNode, FlatNode>();

  treeNodes: FoodNode[] = [];
  currentSelectedNode;
  
  transformer = (node: FoodNode, level: number) => {
    // console.log("node ", node);
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.name === node.name ? existingNode : new FlatNode();
    flatNode.name = node.name;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    flatNode.expanded = false;
    flatNode.color = 'red';
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    // console.log("this.flatNodeMap ", this.flatNodeMap);
    // console.log("this.nestedNodeMap ", this.nestedNodeMap);
    // console.log("flatNode ", flatNode);
    return flatNode;
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level, 
    node => node.expandable
  );

  // Tree flattener to convert a normal type of node to node with children & level information.  
  // constructor(transformFunction: (node: T, level: number) => F, getLevel: (node: F) => number, isExpandable: (node: F) => boolean, getChildren: (node: T) => Observable<T[]> | T[] | undefined | null);
  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: FlatNode) => node.expandable;

  constructor(
    private treeService: TreeService
  ) {
    this.treeService.dataChange.subscribe((data)=>{
      this.dataSource.data = data;
      console.log("datasource ", this.dataSource.data);
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  getData(){
    this.treeService.getData().subscribe((res)=>{
      this.dataSource.data = res;
      console.log("datasource ", this.dataSource.data);
    })
  }

  selectNode(node){
    this.currentSelectedNode = node;
    if(this.treeControl.isExpanded(node)){
      node.expanded = true;
    }else{
      node.expanded = false;
    }
    console.log("currentNode ", this.currentSelectedNode);
    console.log("datasource ", this.treeControl.dataNodes);
  }

  onBlur(node){
    console.log("node ", node);
    if(node.expanded){
      this.currentSelectedNode = node;
    }else{
      this.currentSelectedNode = null;
    }
    console.log("currentNode ", this.currentSelectedNode);
  }

  addNode(){
    console.log("datasource ", this.dataSource.data);
    if(this.currentSelectedNode){
      const selectedNode = this.flatNodeMap.get(this.currentSelectedNode);
      this.treeService.insertNode(selectedNode, 'New Node');
    }else{
      this.treeService.insertNode(null, 'New Node');
    }

  }
}