#!/usr/bin/env bash

set -euxo pipefail

build_dir="build"

npm run clean
npm run build

rm -rf "$build_dir" && mkdir -p "$build_dir"
cp -r dist/ host.json package* "$build_dir"

pushd "$build_dir"
npm install --omit=dev
zip -r deus.zip *

az functionapp deployment source config-zip -g deus -n disboarddeus --src ./deus.zip
popd
