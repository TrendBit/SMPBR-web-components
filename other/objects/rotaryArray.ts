export class RotaryArray<T>{
    private arr: T[] = [];
    private head: number = 0;
    private count: number = 0;
    
    constructor(size: number) {
        this.arr.length = size;
    }
    
    push(value: T) {
        this.arr[this.head] = value;
        this.head = (this.head+1)%this.arr.length;
        if(this.count < this.arr.length){
            this.count++;
        }
    }
    
    get(index: number) {
        return this.arr[(this.head+index)%this.arr.length];
    }
    
    getArray() : T[] {
        let result: T[] = [];
        result.length = this.arr.length;
        for (let i = 0; i < this.arr.length; i++){
            result[i] = this.get(i);
        }
        return result;
    }
    
    getArrayTrimmed(): T[]{
        let result: T[] = [];
        result.length = this.count;
        const skippedCount = this.arr.length-this.count
        for (let i = skippedCount; i < this.arr.length; i++){
            result[i - skippedCount] = this.get(i);
        }
        return result;
    }
    
    size() {
        return this.arr.length;
    }
    
    clear() {
        this.head = 0;
        this.count = 0;
        const oldLength = this.arr.length;
        this.arr = [];
        this.arr.length = oldLength;
    }
}
