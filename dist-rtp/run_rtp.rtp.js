"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rtpSimulator_rtp_1 = require("./rtpSimulator.rtp");
console.log('Running RTP Simulation via Node...');
const result = (0, rtpSimulator_rtp_1.simulateRTP)(100000); // 100k spins
console.log('--- FINAL RESULTS ---');
console.log(JSON.stringify(result, null, 2));
