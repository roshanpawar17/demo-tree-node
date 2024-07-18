export interface FileNode {
    name: string;
    children?:FileNode[];
} 
export interface FileNode2 {
    active: boolean;
    attachmentTypeId: number;
    attachmentTypeName: string;  
    contentType: string;
    createdByUserEmail: string;
    createdByUserFullName: string;
    createdByuserId: number;
    createdOn: number;
    createdOnVal: string;
    docFullPath: string;
    docName: string;
    docStorageId: number;
    fileSize: number;
    folderName: string;
    itemAttachmentId: number;
    itemAttachmentTypeId: number;
    itemAttachmentTypeName: string;
    parentFolderName: string;
    parentId: number;
    uniqueFolderId: string;
} 
  
export class FlatNode {
    expandable: boolean;
    name: string;
    level: number;
    selected: boolean;
    data: object;
}