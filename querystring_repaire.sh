#!/bin/bash
sed -i 's/var escape = escape;//g' node_modules/vux/src/tools/querystring/index.js
sed -i 's/var unescape = unescape;//g' node_modules/vux/src/tools/querystring/index.js
