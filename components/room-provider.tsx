"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, type ReactNode } from "react";

type RoomName = "star-map" | "missions" | "arsenal" | "comms" | "profile";

const ROUTE_TO_ROOM: Record<string, RoomName> = {
  "/": "star-map",
  "/missions": "missions",
  "/arsenal": "arsenal",
  "/comms": "comms",
  "/profile": "profile",
};

const HUB_PREFIXES: { prefix: string; room: RoomName }[] = [
  { prefix: "/missions", room: "missions" },
  { prefix: "/study", room: "missions" },
  { prefix: "/arsenal", room: "arsenal" },
  { prefix: "/train", room: "arsenal" },
  { prefix: "/explore", room: "arsenal" },
  { prefix: "/foundations", room: "arsenal" },
  { prefix: "/terminal", room: "arsenal" },
  { prefix: "/cards", room: "arsenal" },
  { prefix: "/drill", room: "arsenal" },
  { prefix: "/filesystem", room: "arsenal" },
  { prefix: "/command-dissector", room: "arsenal" },
  { prefix: "/boot-learn", room: "arsenal" },
  { prefix: "/boot-triage", room: "arsenal" },
  { prefix: "/comms", room: "comms" },
  { prefix: "/interview", room: "comms" },
  { prefix: "/stories", room: "comms" },
  { prefix: "/agent", room: "comms" },
  { prefix: "/profile", room: "profile" },
  { prefix: "/progress", room: "profile" },
];

function resolveRoom(pathname: string): RoomName {
  if (ROUTE_TO_ROOM[pathname]) return ROUTE_TO_ROOM[pathname];
  for (const { prefix, room } of HUB_PREFIXES) {
    if (pathname.startsWith(prefix)) return room;
  }
  return "star-map";
}

interface RoomContextValue {
  room: RoomName;
}

const RoomContext = createContext<RoomContextValue>({ room: "star-map" });

export function useRoom() {
  return useContext(RoomContext);
}

export default function RoomProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const room = useMemo(() => resolveRoom(pathname), [pathname]);

  return (
    <RoomContext.Provider value={{ room }}>
      <div data-room={room} className="h-screen w-screen overflow-hidden">
        {children}
      </div>
    </RoomContext.Provider>
  );
}
