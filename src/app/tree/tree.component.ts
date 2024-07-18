import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { TreeService } from './tree.service';

import { FlatNode, FileNode, FileNode2 } from '../models/data-models';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {

 availableDownloads: FileNode[];
 extensions = ['png', 'jpeg', 'jpg', 'xlsx', 'txt']

  treeNode: FileNode2[];
 currentSelectedNode;
 newFolder;


 isSearching = false;
 isHeaderOpen = false;
 isNewFolder = false;
 fileSelected = false;


 searchInput = new FormControl("");
 folderNameFC = new FormControl('', Validators.required);


 flatNodeMap = new Map<FlatNode, FileNode>();
 nestedNodeMap = new Map<FileNode, FlatNode>();


 hasNoContent = (_: number, node: FlatNode) => node.name === '';


//  hasFile = (_: number, node: FlatNode) => {
//    const extension = node.name.split('.').pop();
//    return this.extensions.includes(extension);
//  };


 transformer = (node: FileNode, level: number) => {
  console.log("node ", node);
   const existingNode = this.nestedNodeMap.get(node);
   const flatNode = existingNode && existingNode.name === node.name ? existingNode : new FlatNode();
   flatNode.name = node.name;
   flatNode.level = level;
   flatNode.expandable = !!node.children?.length;
   flatNode.selected = false;
   flatNode.data = node;
   this.flatNodeMap.set(flatNode, node);
   this.nestedNodeMap.set(node, flatNode);
   return flatNode;
 };




 treeFlattener = new MatTreeFlattener(
   this.transformer,
   node => node.level,
   node => node.expandable,
   node => node.children,
 );


 treeControl = new FlatTreeControl<FlatNode>(
   node => node.level,
   node => node.expandable
 );


 dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);


 constructor(
   private treeService: TreeService
 ) {
   this.treeService.availableDownloadsObservable.subscribe((res: FileNode[]) => {
     if (res) {
      this.dataSource.data = res;
      console.log("dataSource ", this.dataSource.data)
     }
   });
 }


 ngOnInit(): void {
   this.getData();
 }


 getData() {
   this.treeService.getData().subscribe((res) => {
    console.log("res ", res)
    if(res.data.ItemAttachments.length > 0){
      this.treeNode = res.data.ItemAttachments;   
      console.log("treeNode ", this.treeNode);   
      this.treeService.availableDownloads.next(this.treeNode);
    }
    // console.log("dataSource ", this.dataSource.data)
    // console.log("treeControl ", this.treeControl.dataNodes)
    //  this.availableDownloads = res;
   })
 }


 createNewFolder(event) {
   this.isNewFolder = true;
   if (this.currentSelectedNode) {
     if (!this.treeControl.isExpanded(this.currentSelectedNode)) {
       this.treeControl.expand(this.currentSelectedNode);
     }
     const selectedNode = this.flatNodeMap.get(this.currentSelectedNode);
     this.addFolder(selectedNode);
     this.currentSelectedNode.selected = true;
   } else {
     this.addFolder(null);
   }
   event.stopPropagation();
 }


 addFolder(parentFolder) {
   this.newFolder = { name: '' };
   if (parentFolder) {
     if (parentFolder.children) {
       parentFolder.children.unshift(this.newFolder);
       this.treeService.availableDownloads.next(this.availableDownloads);
     } else {
       parentFolder.children = [];
       parentFolder.children.unshift(this.newFolder);
       this.treeService.availableDownloads.next(this.availableDownloads);
     }
   }
   // else {
   //   this.availableDownloads.unshift(this.newFolder);
   //   this.treeService.availableDownloads.next(this.availableDownloads);
   // }


 }


 selectTreeNode(node) {


   if (node.level === 0) {
     this.isHeaderOpen = !this.isHeaderOpen;
   }

   const itemAttachmentId = node.data.itemAttachmentId;
   if(itemAttachmentId){
      this.treeService.getData(itemAttachmentId).subscribe((res)=>{
        if(res){
          console.log("res ", res)
          res.data.ItemAttachments.forEach((itemAttachment)=>{
            if(itemAttachment.parentId === itemAttachmentId){
              node.data['children'] = [];
              node.data['children'].push(itemAttachment);
              console.log("node ", node);   
              console.log("treenode ", this.treeNode);
              this.treeService.availableDownloads.next(this.treeNode);
            }else{
              console.log("no child")
            }
          })
        }
      })
    }

  //  if (this.newFolder) {
  //    this.cancelNewFolder();
  //  }


  //  this.clearSelection(this.availableDownloads);


  //  const extension = node.name.split('.').pop();
  //  const isExtension = this.extensions.includes(extension);
  //  if (isExtension) {
  //    this.fileSelected = true;
  //  } else {
  //    this.fileSelected = false;
  //  }


  //  node.selected = true;
  //  this.currentSelectedNode = node;


 }


 clearSelection(folders: FileNode[]) {
   folders.forEach((folder) => {
     const node = this.nestedNodeMap.get(folder);
     node.selected = false;
     if (folder.children) {
       this.clearSelection(folder.children);
     }
   })
 }


 cancelNewFolder() {
   if (this.removeNode(this.availableDownloads, this.newFolder)) {
     this.isNewFolder = false;
     this.newFolder = null;
     this.treeService.availableDownloads.next(this.availableDownloads);
     this.currentSelectedNode.selected = true;
     this.folderNameFC.reset();
   };
 }


 removeNode(availableDownloads, newFolder) {
   for (let i = 0; i < availableDownloads.length; i++) {
     if (availableDownloads[i] === newFolder) {
       availableDownloads.splice(i, 1);
       return true;
     } else if (availableDownloads[i].children) {
       if (this.removeNode(availableDownloads[i].children, newFolder)) {
         return true;
       }
     }
   }
   return false;
 }




 saveNewFolder() {
   this.newFolder.name = this.folderNameFC.value;
   this.treeService.insertFolder(this.availableDownloads).subscribe({
     next: (res) => {
       this.treeService.availableDownloads.next(res);
       const newFolderFlatNode = this.nestedNodeMap.get(this.newFolder);
       newFolderFlatNode.selected = true;
       this.currentSelectedNode = newFolderFlatNode;
       this.newFolder = null;
       this.isNewFolder = false;
       // this.currentSelectedNode = null;
       this.folderNameFC.reset();
     },
     error: (err) => {
       console.log(err);
     }
   });
 }


 deleteExistingFolder() {
   if (this.currentSelectedNode.level === 0) {
     return;
   }


   const selectedNode = this.flatNodeMap.get(this.currentSelectedNode);
   if (this.removeNode(this.availableDownloads, selectedNode)) {
     this.treeService.deleteFolder(this.availableDownloads).subscribe({
       next: (res) => {
         this.treeService.availableDownloads.next(res);
         if (this.availableDownloads.length > 0) {
           const defaultSelectedFlatNode = this.nestedNodeMap.get(this.availableDownloads[0]);
           defaultSelectedFlatNode.selected = true;
           this.currentSelectedNode = defaultSelectedFlatNode;
         }
       },
       error: (err) => {
         console.log("error ", err);
       }
     });
   };


 }


 downloadFile() {
   console.log("file downloaded ", this.currentSelectedNode);
 }


}