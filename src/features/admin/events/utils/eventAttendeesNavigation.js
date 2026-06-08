export const resolveAttendeesPath = (eventId, returnTo = "/events/detail") => {
  if (returnTo === "/district/events") {
    return `/district/events/${eventId}/attendees`;
  }
  if (returnTo === "/club/events") {
    return `/club/events/${eventId}/attendees`;
  }

  const orgEventsMatch = returnTo.match(/^(\/(?:clubs|districts)\/[^/]+\/events)$/);
  if (orgEventsMatch) {
    return `${orgEventsMatch[1]}/${eventId}/attendees`;
  }

  return `/events/${eventId}/attendees`;
};

export const resolveAttendeesPortalContext = (pathname, state = {}) => {
  if (state?.returnTo) {
    return {
      returnTo: String(state.returnTo),
      returnLabel: state.returnLabel ? String(state.returnLabel) : "Events",
      dashboardPath: state.dashboardPath ? String(state.dashboardPath) : "/dashboard",
      dashboardLabel: state.dashboardLabel ? String(state.dashboardLabel) : "Dashboard",
    };
  }

  if (pathname.startsWith("/district/events/")) {
    return {
      returnTo: "/district/events",
      returnLabel: "District events",
      dashboardPath: "/district/dashboard",
      dashboardLabel: "Dashboard",
    };
  }

  if (pathname.startsWith("/club/events/")) {
    return {
      returnTo: "/club/events",
      returnLabel: "Club events",
      dashboardPath: "/club/dashboard",
      dashboardLabel: "Dashboard",
    };
  }

  const orgMatch = pathname.match(/^\/(clubs|districts)\/([^/]+)\/events\/[^/]+\/attendees/);
  if (orgMatch) {
    const [, orgType, orgId] = orgMatch;
    return {
      returnTo: `/${orgType}/${orgId}/events`,
      returnLabel: orgType === "clubs" ? "Club events" : "District events",
      dashboardPath: "/dashboard",
      dashboardLabel: "Dashboard",
    };
  }

  return {
    returnTo: "/events/detail",
    returnLabel: "Events",
    dashboardPath: "/dashboard",
    dashboardLabel: "Dashboard",
  };
};

export const buildAttendeesNavigationState = ({
  event,
  returnTo = "/events/detail",
  returnLabel = "Events",
  dashboardPath,
  dashboardLabel = "Dashboard",
}) => {
  const resolvedDashboardPath =
    dashboardPath ||
    (returnTo.startsWith("/district/") ? "/district/dashboard" :
      returnTo.startsWith("/club/") ? "/club/dashboard" :
        "/dashboard");

  return {
    eventName: event?.header || "",
    returnTo,
    returnLabel,
    dashboardPath: resolvedDashboardPath,
    dashboardLabel,
  };
};
