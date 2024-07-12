export interface FoodNode {
    name: string;
    children?: FoodNode[];
} 
  
export class FlatNode {
    expandable: boolean;
    name: string;
    level: number;
    expanded: boolean;
    color: string;
}