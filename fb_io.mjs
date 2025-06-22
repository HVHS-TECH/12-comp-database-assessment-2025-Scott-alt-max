

const COL_C = 'white';	    // These two const are part of the coloured 	
const COL_B = '#CD7F32';	//  console.log for functions scheme
console.log('%c fb_io.mjs', 'color: blue; background-color: white;'); //DIAG
var fb_gameDB;
var googleAuth;
var fb_favoriteFruits = [];

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get, update, query, orderByChild, limitToFirst, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

/**************************************************************/
export { fb_initialise, fb_authenticate, fb_detectAuthStateChanged, fb_logOut, submitform, fb_sortByGameHighScore, fb_write, fb_read };
fb_initialise();
fb_detectAuthStateChanged();

// Functions to initialise and authenticate
function fb_initialise() {
    console.log('%c fb_initialise(): ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG
    
    const FB_GAMECONFIG = {
        apiKey: "AIzaSyBA9LF4VKTGLBynVTOiG3iJqm-odKKE74g",
        authDomain: "comp-2025-scott-barlow.firebaseapp.com",
        databaseURL: "https://comp-2025-scott-barlow-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "comp-2025-scott-barlow",
        storageBucket: "comp-2025-scott-barlow.firebasestorage.app",
        messagingSenderId: "604831891804",
        appId: "1:604831891804:web:e1d0c36b49a9ad732b4199",
        measurementId: "G-5JBDKMXH4C"
    };
    
    const FB_GAMEAPP = initializeApp(FB_GAMECONFIG);
    fb_gameDB = getDatabase(FB_GAMEAPP);
    console.info(fb_gameDB); //DIAG
}
function fb_authenticate() {
    console.log('%c fb_authenticate: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG

    const AUTH = getAuth();
    const PROVIDER = new GoogleAuthProvider();

    // The following makes Google ask the user to select the account
    PROVIDER.setCustomParameters({
        prompt: 'select_account'
    });
    signInWithPopup(AUTH, PROVIDER).then((result) => {
        googleAuth = result;

        console.log("Authentication successful"); //DIAG
        console.log("User Email: " + googleAuth._tokenResponse.email); //DIAG
        console.log("User Local ID: " + googleAuth.user.uid); //DIAG

        document.getElementById("statusMessage").innerHTML = ("");
        //console.log(result); //DIAG
    })
    .catch((error) => {
        console.log("Authentication unsuccessful"); //DIAG
        console.log(error); //DIAG
    });
}
function fb_detectAuthStateChanged() {
    console.log('%c fb_detectAuthStateChanged: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG
    const AUTH = getAuth();

    onAuthStateChanged(AUTH, (user) => {
        if (user) {
            console.log("User doesn't need to sign in");
        } else {
            console.log("User needs to sign in");
        }
    }, (error) => {
        console.log("Authorisation state detection error");
        console.log(error);
    });
}
function fb_logOut() {
    console.log('%c fb_logOut: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG
    const AUTH = getAuth();

    signOut(AUTH).then(() => {
        googleAuth = null;
        console.log("Successfully logged out");
    })
    .catch((error) => {
        console.log("Logout error");
        console.log(error);
    });
}

// Functions to write user data
function fb_write(FILEPATH, DATA) {
        const REF = ref(fb_gameDB, FILEPATH);
        set(REF, DATA).then(() => {
            //console.log("Written the following information to the database:");
            //console.log(DATA);
        }).catch((error) => {
            console.log("Error with writing to the database");
            console.log(error);
        });
    }
function fb_writeUserInformation() {
    console.log('%c fb_writeTo: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG

    // Write user's information
    var filePath = "users/" + googleAuth.user.uid;
    var _userName = document.getElementById("userName").value;
    var _userAge = document.getElementById("userAge").value;
    var _mazeGameHighScore = 5;
    var _coinGameHighScore = 5;
    var UserInformation = {userName: _userName, userAge: _userAge, mazeGameHighScore: _mazeGameHighScore, coinGameHighScore: _coinGameHighScore};
    fb_write(filePath, UserInformation);
}
function submitform() {
    // Check the user is logged in
    if(googleAuth != null) {
        document.getElementById("statusMessage").innerHTML = ("");
        fb_writeUserInformation();
    } else {
        document.getElementById("statusMessage").innerHTML = ("User must be logged in");
    }
}

// Functions to read stuff from the database
function fb_read(FILEPATH) {
    console.log('%c fb_read: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG

    const REF = ref(fb_gameDB, FILEPATH);

    return get(REF).then((snapshot) => {
        var fb_data = snapshot.val();

        if (fb_data != null) {
            //console.log("Successfully read database information:");
            //console.log(fb_data);
            return fb_data;
        } else {
            console.log("Attempting to read a value that doesn't exist");
            console.log(fb_data);
            return null
        }
    }).catch((error) => {
        console.log("Error with reading the database");
        console.log(error);
        return null
    });
}
function fb_sortByGameHighScore(gameHighScore, element) {
    console.log('%c fb_sortByGameHighScore: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG

    const REF = query(ref(fb_gameDB, "users"), orderByChild(gameHighScore), limitToLast(3));

    get(REF).then((snapshot) => {
        var fb_data = snapshot.val();
        if (fb_data != null) {
            console.log("Successfully read database information:");
            console.log(fb_data);
            
            // Add the top scores to the highscore table
            const tbody = document.querySelector("#fruitTable tbody");
            tbody.innerHTML = "";

            snapshot.forEach((userInformation) => {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${userInformation.val().userName}</td><td>${userInformation.val().mazeGameHighScore}</td><td>${userInformation.val().coinGameHighScore}</td>`;
                tbody.prepend(row);
            });

            // Remove arrows from all other elements and add it to this one
            document.querySelectorAll(".arrows").forEach((span) => span.innerHTML = "");
            element.querySelector("span").innerHTML = "▼";
        } else {
            console.log("Attempting to read a value that doesn't exist");
            console.log(fb_data);
        }
    }).catch((error) => {
        console.log("Error with reading the database");
        console.log(error);
    });
}
/*function fb_listenForChanges() {
    console.log('%c fb_listenForChanges: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG

    var filePath = "Users";
    const REF = ref(fb_gameDB, filePath);

    onValue(REF, (snapshot) => {
        var fb_data = snapshot.val();

        if (fb_data != null) {
            console.log("Database information for file path " + filePath + " has changed to:");
            console.log(fb_data);
        } else {
            console.log("Attempting to read a value that doesn't exist");
            console.log(fb_data);
        }
    });
}*/
/*function fb_readPlayerStuff() {
    console.log('%c fb_readPlayerStuff: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG
    
    var highScores = [];

    // Read the information for one player
    var playerInformationArray = [];

    fb_read(fb_gameDB, ("userInformation/" + googleAuth.user.uid)).then((userInformation) => {
        playerInformationArray.push(userInformation);

        fb_read(fb_gameDB, ("games/mazeGame/" + googleAuth.user.uid)).then((mazeGameHighScore) => {
            playerInformationArray.push(mazeGameHighScore);

            fb_read(fb_gameDB, ("games/coinGame/" + googleAuth.user.uid)).then((coinGameHighScore) => {
                playerInformationArray.push(coinGameHighScore);

                console.log(playerInformationArray);
            }).catch((error) => {
                console.log("Error with reading the database");
                console.log(error);
            });
        }).catch((error) => {
            console.log("Error with reading the database");
            console.log(error);
        });
    }).catch((error) => {
        console.log("Error with reading the database");
        console.log(error);
    });
}*/
/*function fb_dislay(fb_data) {
    console.log('%c fb_dislay: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG

    document.getElementById("response").innerHTML = `
        <div style="background: rgb(248, 186, 104);; border: 1px solid #8b0000; padding: 1rem; border-radius: 8px;">
            <p>Kia ora ${fb_data.name},</p>
            <p>Thank you for joining us at Scott’s Strawberry Saloon (and other fruit products)! We're thrilled to have you as a customer!</p>
            <p>Based on your preferences, we’ll be sending you personalized recommendations for tasty and healthy treats made with the freshest fruit — especially those ${fb_data.favoriteFruit} we heard you love!</p>
            <p>At the moment, we want to offer you a deal to get fresh ${fb_data.favoriteFruit} ${fb_data.fruitQuantity}x a week!!</p>
            <p>Ngā mihi nui,</p>
            <p><em>The Scott’s Strawberry Saloon Team</em></p>
        </div>
    `;
}*/
/*function simplyfyString(str) {
    // Remove spaces and convert to lowercase for consistency
    return str.toLowerCase().replace(/\s+/g, '');
}*/
/*function fb_readAll() {
    console.log('%c fb_readAll: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG

    const REF = ref(fb_gameDB, "userInformation");

    get(REF).then((snapshot) => {
        var fb_data = snapshot.val();

        if (fb_data != null) {
            console.log("Successfully read database information:");
            const fruitCounts = {};

            Object.values(fb_data).forEach(user => {
                const fruit = user.favoriteFruit;
                if (fruit) {
                    fruitCounts[fruit] = (fruitCounts[fruit] || 0) + 1;
                }
            });
            const fruitArray = Object.entries(fruitCounts);
            fruitArray.sort((a, b) => b[1] - a[1]);

            const tbody = document.querySelector("#fruitTable tbody");
            tbody.innerHTML = "";

            fruitArray.forEach(([fruit, count]) => {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${fruit}</td><td>${count}</td>`;
                tbody.appendChild(row);
            });
        } else {
            console.log("Attempting to read a value that doesn't exist");
            console.log(fb_data);
        }
    }).catch((error) => {
        console.log("Error with reading the database");
        console.log(error);
    });
}*/
/*function fb_update() {
    console.log('%c fb_update: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG

    const REF = ref(fb_gameDB, "Users/UserID");
    var UserInformation = {HighScore: 30, Name: "Scocc"};
    
    update(REF, UserInformation).then(() => {
        console.log("Written the following information to the database:");
        console.log(UserInformation);
    }).catch((error) => {
        console.log("Error with updating the database");
        console.log(error);
    });
}*/
/*function fb_readSorted() {
    console.log('%c readSorted: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG

    const REF= query(ref(fb_gameDB, "Users"), orderByChild("HighScore"), limitToLast(5));

    get(REF).then((snapshot) => {
        var fb_data = snapshot.val();
        if (fb_data != null) {
            console.log("Successfully read database information:");
            // Logging database data
            snapshot.forEach(function (userScoreSnapshot) {
                console.log(userScoreSnapshot.val()); //DIAG
            });
        } else {
            console.log("Attempting to read a value that doesn't exist");
            console.log(fb_data);
        }
    }).catch((error) => {
        console.log("Error with reading the database");
        console.log(error);
    });
}*/
/*function fb_writeJunk() {
    console.log('%c fb_writeTo: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG

    for (var i = 0; i < 100; i++) {
        var randomNumber = Math.floor(Math.random() * 100) + 1;
        var filePath = "/Users/UserID" + i;
        const REF = ref(fb_gameDB, filePath);
        var UserInformation = {HighScore: randomNumber, Name: "Scobb"};
        
        set(REF, UserInformation).then(() => {
            //console.log("Written the following information to the database:");
            //console.log(UserInformation);
        }).catch((error) => {
            console.log("Error with writing to the database");
            console.log(error);
        });
    }
    
    console.log("Written the information to the database:");
}*/