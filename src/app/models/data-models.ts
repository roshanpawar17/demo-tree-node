export interface DownloadFolder {
    name: string;
    children?: DownloadFolder[];
} 
  
export class FlatNode {
    expandable: boolean;
    name: string;
    level: number;
    selected: boolean;
}