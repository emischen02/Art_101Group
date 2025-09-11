document.addEventListener('DOMContentLoaded', () => {
    alert('Hello from script.js!');
    let userName = 'John Doe';
    const userAge = 30;
    var isActiveUser = true;
}); 

let emoji = "😊";
console.log("Hello " + emoji); 
// Output: Hello 😊
let dog = "🐶"
let cat = "😺"
let bee = "🐝"


function createBee() {
    // Create a span element for the bee
    const beeElement = document.createElement("span");
    beeElement.classList.add("bee");
    beeElement.textContent = bee;

    // Random horizontal position
    beeElement.style.left = Math.random() * window.innerWidth + "px";

    // Random animation duration
    beeElement.style.animationDuration = (Math.random() * 2 + 3) + "s";

    // Random size
    const size = Math.random() * 20 + 20; // Between 20px and 40px
    beeElement.style.fontSize = size + "px";

    // Add the bee to the body
    document.body.appendChild(beeElement);

    // Remove bee after it falls
    setTimeout(() => {
      beeElement.remove();
    }, 5000);
  }

  // Create a new bee every 200 milliseconds
  setInterval(createBee, 200);