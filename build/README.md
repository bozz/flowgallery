
# FlowGallery Build Documentation #

The build script combines the seperate source files found under the
"src" directory into a single file. Two different versions are created
in this process - one that just contains the combined sources and the
other is a compressed version aimed for production use.

### Requirements and Setup for Build Script ###

Node.js is used for the build scripts - tested with node 0.6.6
(http://nodejs.org/).

The actual build script was created using 'Jake'
(https://github.com/mde/jake). It is recommended to install this
globally (i.e. the "-g" option).

npm install -g jake

For compressing the code, the uglify-js module is used, install as
follows:

npm install uglify-js


### Running the build script ###

To run the build script simply call the "jake" command within the
"build" directory. This will create the release version of the plugin
files within the "release" directory.
