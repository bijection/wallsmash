#! /bin/bash
rm -rf dist
yarn build
sed -e 's/_manifest/manifest/g' index.html > dist/index.html

echo "CACHE MANIFEST" > dist/main.appcache
echo '#' `date +%Y-%m-%d:%H:%M:%S` >> dist/main.appcache
echo index.html >> dist/main.appcache
echo bundle.js >> dist/main.appcache
echo NETWORK: >> dist/main.appcache
echo '*' >> dist/main.appcache

echo wallsmash.com > dist/CNAME

yarn upload 