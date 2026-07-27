import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import AppToast from "./components/AppToast";
import { EventProvider } from "./context/EventContext";

export default function App() {
  return (
    <BrowserRouter>
      <EventProvider>
        <AppRoutes />
        <AppToast />
      </EventProvider>
    </BrowserRouter>
  );
}
