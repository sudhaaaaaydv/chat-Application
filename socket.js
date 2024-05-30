import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000"; // Change this to your Socket.io server endpoint

const socket = io(ENDPOINT);

export default socket;
