import dotenv from "dotenv"
dotenv.config({
    path: "./.env",
})

let myUsername = process.env.test;  
console.log(myUsername);

console.log("start of backend");
console.log("testing nodemon");

