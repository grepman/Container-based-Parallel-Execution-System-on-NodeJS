#!/bin/bash

npm link
./node_modules/.bin/forever start --minUptime 1000 --spinSleepTime 1000  server.js 
