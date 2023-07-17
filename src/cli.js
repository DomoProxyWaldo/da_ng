import yargs from "yargs";
import { execManifest, applyManifestOverrides } from "./manifest";

export function cli(args) {
  yargs(args.splice(2))
    .command({
      command: "manifest [identifier] [description]",
      aliases: ["m"],
      desc: "Adds a new manifest override",
      handler: execManifest,
    })
    .command({
      command: "apply-manifest <step> [id] [buildDir]",
      aliases: ["am"],
      desc: "Applies manifest overrides",
      handler: applyManifestOverrides,
    })
    .demandCommand()
    .help()
    .wrap(100).argv;
}
