import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { Provider } from "react-redux";
import store from "./app/store..js";
import { restoreSessionFromOtherTab } from "./utils/tabSessionSync";

// A tab opened via Ctrl+click has an empty sessionStorage — borrow the login from an open tab first.
restoreSessionFromOtherTab().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
});
