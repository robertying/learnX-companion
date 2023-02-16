#!/bin/sh
set -e

find . \! -user learnx -exec chown learnx '{}' +
su-exec learnx "$@"
