#!/bin/bash

git pull && npm run build && cp -R dist/* /var/www/html/super-mario/
