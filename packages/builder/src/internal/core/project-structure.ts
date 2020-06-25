import findUp from "find-up";
import fsExtra from "fs-extra";
import path from "path";

import { getPackageRoot } from "../util/package-info";

import { BuilderError } from "./errors";
import { ERRORS } from "./errors-list";
import { isTypescriptSupported } from "./typescript-support";
const JS_CONFIG_FILENAME = "builder.config.js";
const TS_CONFIG_FILENAME = "builder.config.ts";

export function isCwdInsideProject() {
  return (
    Boolean(findUp.sync(JS_CONFIG_FILENAME)) ||
      isTypescriptSupported() && Boolean(findUp.sync(TS_CONFIG_FILENAME))
  );
}

export function getUserConfigPath(): string | undefined {
  if (isTypescriptSupported()) {
    const tsConfigPath = findUp.sync(TS_CONFIG_FILENAME);
    if (tsConfigPath !== null) {
      return tsConfigPath;
    }
  }

  const pathToConfigFile = findUp.sync(JS_CONFIG_FILENAME);
  if (pathToConfigFile === null) {
    throw new BuilderError(ERRORS.GENERAL.NOT_INSIDE_PROJECT);
  }

  return pathToConfigFile;
}
