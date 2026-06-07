#!/bin/bash

git pull && npm install && npm run build && cp -R dist/* /var/www/html/super-mario/
