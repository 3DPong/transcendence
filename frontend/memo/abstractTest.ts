class Animal
{
    public speak() {
        console.log("animal");
    }
}

class Dog extends Animal
{
    public override speak() {
        console.log("Bark!");
    }
}

function doSpeak(animal: Animal){
    animal.speak();
}

const animal = new Animal();
const dog = new Dog();
doSpeak(dog); // Bark!
doSpeak(animal); // animal.