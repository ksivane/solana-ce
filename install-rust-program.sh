#!/usr/bin/env bash

set -eux
set -o pipefail


cd example-hellomytoken && solana program deploy dist/program/hellomytoken.so && cd ..
