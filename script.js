// Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key", // Replace with your API key from Firebase Console
    authDomain: "your-app-id.firebaseapp.com", // Replace with your Auth domain
    projectId: "your-project-id", // Replace with your Project ID
    storageBucket: "your-app-id.appspot.com", // Replace with your Storage Bucket
    messagingSenderId: "your-sender-id", // Replace with your Sender ID
    appId: "your-app-id" // Replace with your App ID
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();  // Initialize Firestore
const drawButton = document.getElementById('drawButton');
const returnButton = document.getElementById('returnButton');
const nameList = document.getElementById('nameList');
const winnerDisplay = document.getElementById('winner');

let names = [];
let lastWinner = null; // Store the last winner's name

// Function to update the displayed list of names (hidden initially)
function updateNameList() {
    nameList.innerHTML = ""; // Clear the list

    names.forEach((name) => {
        const li = document.createElement('li');
        li.textContent = name;
        li.classList.add('hidden'); // Add 'hidden' class initially to hide names
        nameList.appendChild(li);
    });
}

// Function to get names from Firestore and update the list
async function getNamesFromFirestore() {
    const querySnapshot = await db.collection("names").where("drawn", "==", false).get();
    names = []; // Reset the array
    querySnapshot.forEach((doc) => {
        names.push(doc.data().name); // Add name from Firestore
    });
    updateNameList(); // Update list UI
}

// Function to draw a random winner
drawButton.addEventListener('click', async () => {
    if (names.length > 0) {
        // Pick a random name from the array
        const randomIndex = Math.floor(Math.random() * names.length);
        const winner = names[randomIndex];
        
        // Display the winner with the new text
        winnerDisplay.textContent = `nabunot mo si: ${winner}`;

        // Store the winner and remove them from the list
        lastWinner = winner;
        names.splice(randomIndex, 1); // Remove the winner from the list

        // Update the list after removing the winner
        updateNameList();

        // Reveal the winner by adding the 'revealed' class
        const liItems = nameList.getElementsByTagName('li');
        for (let i = 0; i < liItems.length; i++) {
            if (liItems[i].textContent === winner) {
                liItems[i].classList.add('revealed'); // Reveal the winner's name with a design
                break;
            }
        }

        // Disable the "Draw a Winner" button if no names are left
        drawButton.disabled = names.length === 0;

        // Enable the "Return" button after a winner is drawn
        returnButton.disabled = false;

        // Update Firestore to mark the winner as drawn
        await markWinnerAsDrawn(winner);
    }
});

// Function to mark a winner as drawn in Firestore
async function markWinnerAsDrawn(winnerName) {
    const querySnapshot = await db.collection("names").where("name", "==", winnerName).get();
    querySnapshot.forEach(async (doc) => {
        await db.collection("names").doc(doc.id).update({
            drawn: true
        });
    });
}

// Function to return the winner back to the list
returnButton.addEventListener('click', async () => {
    if (lastWinner) {
        // Add the winner back to the names list in Firestore
        await db.collection("names").add({
            name: lastWinner,
            drawn: false
        });

        // Add the winner back to the local names array and update the list
        names.push(lastWinner);
        updateNameList();

        // Disable the "Return" button after returning the winner
        returnButton.disabled = true;

        // Enable the "Draw a Winner" button if names are available
        drawButton.disabled = names.length === 0;
    }
});

// Disable right-click on the entire document
document.addEventListener('contextmenu', (event) => {
    event.preventDefault(); // Prevent the right-click menu from showing
});

// Initialize the app and fetch names from Firestore when the page loads
window.onload = function() {
    getNamesFromFirestore(); // Fetch names from Firestore
    drawButton.disabled = names.length === 0 ? true : false; // Disable the draw button if no names
};
