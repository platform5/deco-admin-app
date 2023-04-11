#!/bin/sh

set -e

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

ME=$(basename $0)

NEWHOST='"host":"'$APIHOST'"'
LOCALHOST='"host":"http://localhost:3040"'
LOCALHOST1='"host":"https://api.swissdata.io"'

NEWTMAPIKEY='"translationMemoryApiKey":"'$TMAPIKEY'"'
LOCALAPIKEY='"translationMemoryApiKey":"ca5e3b78367c"'

NEWTMHOST='"translationMemoryHost":"'$TMHOST'"'
LOCALTMHOST='"translationMemoryHost":"http://localhost:3040"'
LOCALTMHOST1='"translationMemoryHost":"https://api.swissdata.io"'


for jsfile in /usr/share/nginx/html/app*.chunk.js
do
   sed -i 's,'$LOCALHOST','$NEWHOST',g' $jsfile
   sed -i 's,'$LOCALHOST1','$NEWHOST',g' $jsfile

   sed -i 's,'$LOCALAPIKEY','$NEWTMAPIKEY',g' $jsfile

   sed -i 's,'$LOCALTMHOST','$NEWTMHOST',g' $jsfile
   sed -i 's,'$LOCALTMHOST1','$NEWTMHOST',g' $jsfile
done


entrypoint_log "$ME: info: Replace API Host url /$NEWHOST"

exit 0
