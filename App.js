import "./App.css";
import Homepage from "./Pages/Homepage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";

import VApp from "./components/Videocall";
function App() {
  return (
    <div className="App">
      
      <Route path="/" component={Homepage} exact />
      <Route path="/chats" component={Chatpage} />
      <Route path="/Room" component={VApp} />
      
    </div>
  );
}

export default App;
