# examples/modules-utils

Copyable slice of `packages/modules/utils`. Shared type helpers and small object/HTTP utilities used by domain code (Cally's `src/modules/utils`: `types`, `http`, `object`). Object helpers include `removeKeysForUndefinedValues` for stripping undefined keys before `repository.update`.

In an app started from this factory, copy this folder to `packages/modules/utils` and import the public barrel as `@modules/utils`. Intra-package files use `@modules/utils/<file>`.

`examples/domain-base` depends on this package for `AnyRecord`, `Complement`, `KeyOf`, and `isFieldInProps`. Copy both examples together: domain-base → `packages/domain/base`, modules-utils → `packages/modules/utils`.

This recorte does not include logger, environment helpers, locale-specific dates, or product-specific text helpers.
