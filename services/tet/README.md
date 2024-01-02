# Tet

Tet is a frontend for disboard applications. It consists of

* A HTML webpage
* A Discord integration

It is intended to allow simple control over games.

## Usage

### Discord

* `/game get`
* `/game get minecraft`
* `/game get minecraft default`
* `/game start minecraft default [inactivity-timeout=4h]`
* `/game restart minecraft default`
* `/game stop minecraft default [after=4h]`

## Folder Structure

```
tet/
  |_ discord  # discord helper scripts e.g. command creation
  |_ src      # main source set - contains deployable azure functions
```

## Architecture

Tet is intended to be deployed as a set of FaaS instances.
