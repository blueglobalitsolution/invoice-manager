import * as React from "react";
import { Loader } from "./loader";

export function FadingRing(props: React.ComponentProps<typeof Loader>) {
  return <Loader {...props} variant="fading-ring" />;
}
