# Deus

Deus is the runtime control plane api for disboard games.
Notably deus does not control the provisioning or deprovisioning of new game instances (instead this should be handled through tofu),
instead it allows control over
* Runtime status (start, stop)
* Delegated console / administrative configuration

## Apis

```
GET /api/v1/game
GET /api/v1/game/<game>
GEt /api/v1/game/<game>/<instance>
GET,PUT /api/v1/game/<game>/<name>/status
```

## Architecture

Deus is intended to be deployed as a set of FaaS instances.
