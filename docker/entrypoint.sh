#!/bin/sh
set -eu
export LC_ALL=C
umask 077
fail() { echo 'Pika-PPT : AUTH_USERNAME/AUTH_PASSWORD absents ou invalides.' >&2; exit 1; }
[ -n "${AUTH_USERNAME:-}" ] && [ -n "${AUTH_PASSWORD:-}" ] || fail
case "$AUTH_USERNAME" in *[!a-zA-Z0-9_.@-]*|'') fail ;; esac
[ "${#AUTH_USERNAME}" -le 128 ] || fail
if printf '%s' "$AUTH_PASSWORD" | LC_ALL=C grep -q '[[:cntrl:]]'; then fail; fi
case "$AUTH_PASSWORD" in *'
'*) fail ;; esac
[ "${#AUTH_PASSWORD}" -le 512 ] || fail
mkdir -p /tmp/pika/auth
chmod 700 /tmp/pika /tmp/pika/auth
# Shell builtin printf -> stdin. No plaintext password in process arguments.
hash=$(printf '%s\n' "$AUTH_PASSWORD" | openssl passwd -6 -stdin)
printf '%s:%s\n' "$AUTH_USERNAME" "$hash" > /tmp/pika/auth/htpasswd
chmod 600 /tmp/pika/auth/htpasswd
unset AUTH_USERNAME AUTH_PASSWORD hash
nginx -t
exec nginx -g 'daemon off;'
