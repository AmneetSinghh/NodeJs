const fs = require("fs");

console.log("started");
console.log('Outside', new Date());
setTimeout(() => {
  console.log('Inside setTimeout:', new Date());
  console.log("Time callback expected");
  // stored in 2st-phrase of event loop
  fs.readFile("../../Concurrency/Deadlock/SimulatingDeadlock.java", () => {
    console.log("Java File Read completed");
    console.log('Inside readFile:', new Date());

    // stored in 1st-phrase of event loop
  });

  // stored in 3rd-phrase of event loop
  setImmediate(() => {
    console.log("Time callback expected - setImmediate");
    console.log('Inside setImmediate:', new Date());
    // After every phrase of event loop
    process.nextTick(()=>{ console.log(" -----  process next tick --- ----=-")})
    process.exit()
  });

  console.log("end");

}, 5000);






 


