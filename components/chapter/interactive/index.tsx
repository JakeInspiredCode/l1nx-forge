"use client";

import type { ComponentType } from "react";
import SystemdUnitGraph from "./systemd-unit-graph";
import LvmStack from "./lvm-stack";
import PacketStack from "./packet-stack";
import CascadingTimeline from "./cascading-timeline";

// Interactive diagrams for advanced-linux chapters.
// Register a new component here and reference it from a chapter via
// `{ kind: "custom-component", id: "<id>", props: { ... } }`.

export interface InteractiveComponentProps {
  [key: string]: unknown;
}

type InteractiveRegistry = Record<
  string,
  ComponentType<InteractiveComponentProps>
>;

export const INTERACTIVE_COMPONENTS: InteractiveRegistry = {
  "systemd-unit-graph": SystemdUnitGraph as ComponentType<InteractiveComponentProps>,
  "lvm-stack": LvmStack as ComponentType<InteractiveComponentProps>,
  "packet-stack": PacketStack as ComponentType<InteractiveComponentProps>,
  "cascading-timeline": CascadingTimeline as ComponentType<InteractiveComponentProps>,
};

export function getInteractiveComponent(
  id: string
): ComponentType<InteractiveComponentProps> | null {
  return INTERACTIVE_COMPONENTS[id] ?? null;
}
