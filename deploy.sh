#! /bin/bash
rm -rf dist
yarn build
cp wallsmash.png dist
BUNDLE=bundle.`shasum -a256 ./dist/bundle.js | head -c8`.js
sed -e 's/_manifest/manifest/g' index.html | sed -e "s/bundle.js/$BUNDLE/g" index.html > dist/index.html

mv ./dist/bundle.js ./dist/$BUNDLE

echo "CACHE MANIFEST" > dist/main.appcache
echo '#' `date +%Y-%m-%d:%H:%M:%S` >> dist/main.appcache
echo index.html >> dist/main.appcache
echo $BUNDLE >> dist/main.appcache
echo NETWORK: >> dist/main.appcache
echo '*' >> dist/main.appcache

echo wallsmash.com > dist/CNAME

yarn gh-pages -d dist