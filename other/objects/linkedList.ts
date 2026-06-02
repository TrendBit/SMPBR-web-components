
type ListNode<T> = {
    value: T,
    next: ListNode<T> | undefined,
    previous: ListNode<T> | undefined
}
export class LinkedList<T>{
    private first: ListNode<T> | undefined = undefined;
    private last: ListNode<T> | undefined = undefined;
    private count: number = 0;
    
    constructor() {
    }
    
    pushBack(value: T) {
        const newNode: ListNode<T> = {
            value : value,
            next: undefined,
            previous: this.last
        }
        
        if (this.first === undefined) {
            this.first = newNode;
        }
        
        if (this.last !== undefined) {
            this.last.next = newNode;
        }
        
        this.last = newNode;
        
        this.count++;
    }
    
    pushFront(value: T) {
        const newNode: ListNode<T> = {
            value : value,
            next: this.first,
            previous: undefined
        }
        
        if (this.last === undefined) {
            this.last = newNode;
        }
        
        if (this.first !== undefined) {
            this.first.previous = newNode;
        }
        
        this.first = newNode;
        
        this.count++;
    }
    
    popBack(): ListNode<T> | undefined {
        const lastNode = this.last;
        this.last = this.last?.previous;
        
        if (this.last) {
            this.last.next = undefined;
        }
        
        this.count--;
        return lastNode;
    }
    
    popFront(): ListNode<T> | undefined {
        const firstNode = this.first;
        this.first = this.first?.next;
        
        if (this.first) {
            this.first.previous = undefined;
        }
        
        this.count--;
        return firstNode;
    }
    
    back(): ListNode<T> | undefined {
        return this.last;
    }
    
    front(): ListNode<T> | undefined {
        return this.first;
    }
    
    size() : number {
        return this.count;
    }
}


export class QueueFIFO<T>{
    private storage: LinkedList<T> = new LinkedList<T>();
    
    constructor() {
    }
    
    push(value: T) {
        this.storage.pushFront(value);
    }
    
    pop() {
        return this.storage.popFront();
    }
    
    peek() {
        return this.storage.front();
    }
    
    size() {
        return this.storage.size(); 
    }
}

export class QueueLIFO<T>{
    private storage: LinkedList<T> = new LinkedList<T>();
    
    constructor() {
    }
    
    push(value: T) {
        this.storage.pushBack(value);
    }
    
    pop() {
        return this.storage.popFront();
    }
    
    peek() {
        return this.storage.front();
    }
    
    size() {
        return this.storage.size(); 
    }
}
