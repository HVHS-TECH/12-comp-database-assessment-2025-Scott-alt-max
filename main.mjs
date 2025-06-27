console.log('%c main.mjs', 'color: blue; background-color: white;'); //DIAG

// Import all the constants & functions required from fb_io module
import { fb_initialise, fb_authenticate, submitform, fb_sortByGameHighScore } from './fb_io.mjs';
    window.fb_initialise = fb_initialise;
    window.fb_authenticate = fb_authenticate;
    window.submitform = submitform;
    window.fb_sortByGameHighScore = fb_sortByGameHighScore;
 
