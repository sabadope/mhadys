import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mhadys")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
