#!/bin/bash

function main() {
  local testDir="./src"
  local testFiles="$(grep -rl '\.only(' $testDir | grep '\.spec\.ts$' | xargs)"
  echo "$testFiles"
  if [ -z "$testFiles" ]; then
    runJest ""
  else
    runJest "$testFiles"
  fi
}

function runJest() {
  local testFiles="$1"
  local cmd="jest --logHeapUsage -c jest.config.js $testFiles --coverage --detectOpenHandles"

  echo "Running cmd: $cmd"
  $cmd
}

main "$@"