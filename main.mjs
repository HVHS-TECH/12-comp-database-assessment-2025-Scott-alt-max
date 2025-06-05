console.log('%c main.mjs', 'color: blue; background-color: white;'); //DIAG

// Import all the constants & functions required from fb_io module
import { fb_initialise, fb_authenticate, fb_logOut, submitform, fb_listenForChanges } from './fb_io.mjs';
    window.fb_initialise = fb_initialise;
    window.fb_authenticate = fb_authenticate;
    window.fb_logOut = fb_logOut;
    window.submitform = submitform;
    window.fb_listenForChanges = fb_listenForChanges;
 
