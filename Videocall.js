import * as React from "react";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ChatState } from "../Context/ChatProvider";
import { getSender } from "../config/ChatLogics";
export default function VApp() {
  const location = useLocation();
  const { chatId, userId, username,chat ,voice} = location.state;
  const roomID = chatId || "12345";
  const userID = userId || "hellp";
  const userName = username || "hellp";
  const appID = 1733230220;
  const serverSecret = "4183a0b873da38547b5da242b0786dbe";
  console.log();
  let myMeeting = async (element) => {
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );
    // create instance object from token
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    // start the call
    zp.joinRoom({
      container: element,
      scenario: {
        mode:ZegoUIKitPrebuilt.GroupCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
      },
      showScreenSharingButton:false,
      turnOnCameraWhenJoining: voice ? false : true,
      showMyCameraToggleButton: voice ? false : true,
      showAudioVideoSettingsButton: voice ? false : true,
    });
  };

  return (
    <div
      className="myCallContainer"
      ref={myMeeting}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
}
