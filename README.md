# dungeonseekserver

* nvm version 16.17.0
* using wsl to run commands (Linux)
    * NODE_ENV=local in package.json will not work on windows.


## To run the app:
* repo/
    * npm run start
* repo/vue-app/dungeonseek
    * npm run serve

## Things to note:
* There is a ustom deploy/copy file step in the github action file.
 If the deploy doesn't work, check to see if all .js files are being copied.