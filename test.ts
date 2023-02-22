
console.log("Hello world");

class Dog {
    name:string;
    age:number;
    constructor(name:string, age:number) {
        this.name = name;
        this.age = age;
    }
}

dog1: Dog;
let dog1 = new Dog('Gatsby', 5);

Dog.prototype.toString = function dogToString() {
    return `${this.name}`;
}

console.log(dog1);
console.log(dog1.toString());

// TODO : install Node.js