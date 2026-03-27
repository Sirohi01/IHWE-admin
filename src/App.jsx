import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import AppToast from "./components/AppToast";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <AppToast />
    </BrowserRouter>
  );
}
