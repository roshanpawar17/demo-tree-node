import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { TreeService } from './tree.service';

import { DownloadFolder } from '../models/data-models';
import { FlatNode } from '../models/data-models';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {

  downloadedFolders: DownloadFolder[] = [];

  folderNameFC = new FormControl('', Validators.required);

  flatNodeMap = new Map<FlatNode, DownloadFolder>();
  nestedNodeMap = new Map<DownloadFolder, FlatNode>();

  // treeNodes: DownloadFolder[] = [];
  currentSelectedFolder;
  newFolder = null;

  isHeaderOpen = false;
  isNewFolder = false;

  @ViewChild('folder') folder: ElementRef;
  
  transformer = (node: DownloadFolder, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.name === node.name ? existingNode : new FlatNode();
    flatNode.name = node.name;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    flatNode.selected = false;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
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

  hasNoContent = (_: number, node: FlatNode) => node.name === '';

  constructor(
    private treeService: TreeService
  ) {

    this.treeService.setDownloadedFoldersDataObservable.subscribe((res: DownloadFolder[])=>{
      if(res){
        this.dataSource.data = res;
      }
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  getData(){
    this.treeService.getData().subscribe((res)=>{
      this.downloadedFolders = res;
      this.treeService.setDownloadedFoldersData.next(this.downloadedFolders);
    })
  }

  selectFolder(folder){
    this.clearSelection(this.downloadedFolders);
    if(this.treeControl.isExpanded(folder)){
      this.currentSelectedFolder = folder;
      folder.selected = true;
    }else{
      folder.selected = false;
      this.currentSelectedFolder = null;
    }  
  }

  clearSelection(folders: DownloadFolder[]){
    folders.forEach((folder)=>{
      let node = this.nestedNodeMap.get(folder);
      node.selected = false;
      if(folder.children){
        this.clearSelection(folder.children);
      }
    })
  }


  createNewFolder(event){
    this.isNewFolder = true;
    if(this.currentSelectedFolder){
      const selectedNode = this.flatNodeMap.get(this.currentSelectedFolder);
      this.addFolder(selectedNode);
    }else{
      this.addFolder(null);
    }
    event.stopPropagation();

  }

  addFolder(parentFolder){
    this.newFolder = { name : '' };
    if(parentFolder){
      if (parentFolder.children) {
        parentFolder.children.push(this.newFolder);
        this.treeService.setDownloadedFoldersData.next(this.downloadedFolders);
      } else {
        parentFolder.children = [];
        parentFolder.children.push(this.newFolder);
        this.treeService.setDownloadedFoldersData.next(this.downloadedFolders);
      }   
    }else{
      this.downloadedFolders.unshift(this.newFolder);
      this.treeService.setDownloadedFoldersData.next(this.downloadedFolders);
    }
  }

  cancelNewFolder(event){
    if(this.removeNewFolder(this.downloadedFolders, this.newFolder)){
      this.newFolder = null;
      this.isNewFolder = false;
      this.treeService.setDownloadedFoldersData.next(this.downloadedFolders);
      this.currentSelectedFolder = null;
      this.folderNameFC.reset();
    };
  }

  removeNewFolder(downloadedFolders, newFolder){
    for (let i = 0; i < downloadedFolders.length; i++) {
      if (downloadedFolders[i] === newFolder) {
        downloadedFolders.splice(i, 1);
        return true;
      } else if (downloadedFolders[i].children) {
        if (this.removeNewFolder(downloadedFolders[i].children, newFolder)) {
          return true;
        }
      }
    }
    return false;
  }


  saveNewFolder(){
    this.newFolder.name = this.folderNameFC.value;
    this.treeService.insertFolder(this.downloadedFolders).subscribe({
      next: (res)=>{
        this.newFolder = null;
        this.isNewFolder = false;
        this.treeService.setDownloadedFoldersData.next(res);
        this.currentSelectedFolder = null;
        this.folderNameFC.reset();
      },
      error: (err)=>{
        console.log(err);
      }
    });
  }

}