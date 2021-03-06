'use strict';

/* *
 * To get external IP
 * http://ipv4bot.whatismyipaddress.com/
 * 
 */

const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

let IP = ""
let keys = Object.keys(results)
let found = false
keys.forEach(key => {
    let arr = results[key][0].split(".")
    let firstHalf = arr[0] + arr[1]
    if (firstHalf === "192168") {
        found = true
        IP = results[key][0]
    }
})
if(!found) {
    keys.forEach(key => {
        let firstTwo = key.slice(0, 2)
        let possible = ["wl", "en", "et"]
        if(possible.includes(firstTwo)) {
            console.log("IP from keyname");
            found = true
            IP = results[key][0]
        }
    });
}
if (!found) {
    console.log("Couldn't find internal IP");
    IP = "localhost"
}
module.exports = IP
