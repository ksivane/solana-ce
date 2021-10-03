#!/usr/bin/env bash

set -eux
set -o pipefail


cd example-hellomytoken && npm run build:program-rust && cd ..
