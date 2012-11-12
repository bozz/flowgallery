#!/bin/sh

if which uglifyjs &> /dev/null
then
  uglifyjs -o jquery.flowgallery.min.js jquery.flowgallery.js
  echo "generated jquery.flowgallery.min.js"
else
  echo "Error: uglify-js not found, please make sure it's installed and in path."
fi

exit $?
