// import { useState } from "react";
import VisitorRegistration from "./VisitorRegistration";
// import VisitorList from "./VisitorList";

const AddNewVisitors = () => {
  //   const [currentView, setCurrentView] = useState("registration");

  return (
    <div className="min-h-screen bg-gray-100" style={{ marginTop: "30px" }}>
      {/* {currentView === "registration" ? (
        <VisitorRegistration onNavigateToList={() => setCurrentView("list")} />
      ) : (
        // <VisitorList onBack={() => setCurrentView("registration")} />
        <h2>Hello</h2>
      )} */}
      <VisitorRegistration />
    </div>
  );
};

export default AddNewVisitors;
