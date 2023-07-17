CLI for Angular manifest overrides.

# Commands:
```
  da_ng manifest [identifier] [description]    Adds a new manifest override                  [aliases: m]
  da_ng apply-manifest <step> [id] [buildDir]  Applies manifest overrides                    [aliases: am]
```

#### `da_ng manifest [identifier] [description]`
  Creates a new manifest override with the given identifier and description

  - **identifier**: Key used in the manifestOverrides.json file. `instance.prod` | `instance.dev` etc.
  - **description**: Description of the overrides. It's helpful to include the url of the instance. `Production asset for instance.domo.com`

#### `da_ng apply-manifest <step> [id] [buildDir]`
  Applies the selected manifest overrides to the manifest at start/build time. This should be called by the post build proccess.

  - **step**: `start` | `build`
  - **id**: Identifier (or key) of the manifest overrides to apply
  - **buildDir**: Build directory relative to the current working directory of the Node.js process, default `build`. Exa. `dist/mydistfolder`

  - Post build example `"postbuild": "da_ng apply-manifest build dev dist/mydistfolder"`

---
In order to use the `da_ng` command globally, the package must be installed globally.

`npm install -g git@git.empdev.domo.com:EPS/da_ng.git`
