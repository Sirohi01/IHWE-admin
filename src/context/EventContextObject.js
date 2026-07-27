import { createContext } from "react";

// Split into its own file (rather than living in EventContext.jsx) so that
// file can export only the EventProvider component — required for Fast
// Refresh — while this raw context object stays importable for cases like
// CrmEventScopedRoute that need to render a scoped Provider directly.
const EventContext = createContext(null);

export default EventContext;
