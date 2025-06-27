

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

/**************************************************************/
export { fb_initialise, fb_authenticate, fb_detectAuthStateChanged, submitform, fb_sortByGameHighScore, fb_write, fb_read };
fb_initialise();
fb_detectAuthStateChanged();
fb_sortByGameHighScore("mazeGameHighScore", document.getElementById("defaultSort"));

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

        // Show the form to sign in and attempt to read the user's information from firebase and auto fill the form
        document.getElementById("logInButton").style.display = "none";
        document.getElementById("signUpForm").style.display = "block";
        
        fb_read(("userPublicInformation/" + googleAuth.user.uid + "/userName")).then((fb_userName) => {
            console.log(fb_userName);
            document.getElementById("userName").value = fb_userName;
        });
        fb_read(("userPrivateInformation/" + googleAuth.user.uid + "/userAge")).then((fb_userAge) => {
            console.log(fb_userAge);
            document.getElementById("userAge").value = fb_userAge;
        });
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

// Functions to write user data
function fb_write(FILEPATH, DATA) {
        const REF = ref(fb_gameDB, FILEPATH);
        return set(REF, DATA).then(() => {
            //console.log("Written the following information to the database:");
            //console.log(DATA);
        }).catch((error) => {
            console.log("Error with writing to the database");
            console.log(error);
        });
    }
function fb_writeUserInformation() {
    console.log('%c fb_writeTo: ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';'); //DIAG

    // Get user's public information from form
    var publicFilePath = "userPublicInformation/" + googleAuth.user.uid;
    var _userName = document.getElementById("userName").value;

    // Read the user's highscores then write the user's information
    fb_read(("userPublicInformation/" + googleAuth.user.uid + "/coinGameHighScore")).then((fb_coinGameHighScore) => {
        var _coinGameHighScore;
        (fb_coinGameHighScore != null) ? _coinGameHighScore = fb_coinGameHighScore : _coinGameHighScore = 0;

        fb_read(("userPublicInformation/" + googleAuth.user.uid + "/mazeGameHighScore")).then((fb_mazeGameHighScore) => {
            var _mazeGameHighScore;
            (fb_mazeGameHighScore != null) ? _mazeGameHighScore = fb_mazeGameHighScore : _mazeGameHighScore = 0;
            
            var userPublicInformation = {userName: _userName, mazeGameHighScore: _mazeGameHighScore, coinGameHighScore: _coinGameHighScore};
            fb_write(publicFilePath, userPublicInformation).then(() => {

                // Get the user's private information from the form and write it to the database
                var privateFilePath = "userPrivateInformation/" + googleAuth.user.uid;
                var _userAge = document.getElementById("userAge").value;
                var _userEmail = googleAuth.user.email;
                var _userPhotoUrl = googleAuth.user.photoURL;
                var userPrivateInformation = {userAge: _userAge, userEmail: _userEmail, userPhotoUrl: _userPhotoUrl}
                fb_write(privateFilePath, userPrivateInformation).then(() => {
                    // Then redirect them back to the index page once all of that is done
                    window.location.href = "index.html";
                })
            });
        });
	});

}
function submitform(event) {
    // Stop the page from reloading
    event.preventDefault();
    // Write the information to the database
    fb_writeUserInformation();
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

    const REF = query(ref(fb_gameDB, "userPublicInformation"), orderByChild(gameHighScore), limitToLast(3));

    get(REF).then((snapshot) => {
        var fb_data = snapshot.val();
        if (fb_data != null) {
            console.log("Successfully read database information:");
            console.log(fb_data);
            
            // Add the top scores to the highscore table
            const tbody = document.querySelector("#scoreTable tbody");
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