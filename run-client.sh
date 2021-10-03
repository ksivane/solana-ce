#!/usr/bin/env bash

set -eux
set -o pipefail


cd example-hellomytoken && npm run start && cd ..
