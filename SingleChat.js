import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Flex, Box, Text } from "@chakra-ui/layout";
import { SlArrowLeft } from "react-icons/sl";
import { IoIosCall } from "react-icons/io";
import { HiMiniVideoCamera } from "react-icons/hi2";
import { Avatar } from "@chakra-ui/avatar";
import "./styles.css";
import { useHistory } from "react-router-dom";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useCallback,useEffect, useState } from "react";
import axios from "axios";

import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { IoSend } from "react-icons/io5";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "http://localhost:5000"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [videoCallDetails, setVideoCallDetails] = useState(null);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const history = useHistory();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();
    const handleJoinRoom = useCallback(() => {
      const propsToPass = {
        chatId: selectedChat._id,
        userId: user._id,
        username: user.name,
        chat:selectedChat
      };
      history.push({
        pathname: "/room",
        state: propsToPass,
      });
    }, [history, selectedChat, user]);
    const handleJoinRoomvoice = useCallback(() => {
      const propsToPass = {
        chat:selectedChat,
        chatId: selectedChat._id,
        userId: user._id,
        username: user.name,
        voice:true,
      };
      history.push({
        pathname: "/room",
        state: propsToPass,
      });
    }, [history, selectedChat, user]);
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  const handleSendMessage = async () => {
    if (newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        // Handle error
      }
    }
  };
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Flex
            fontSize={{ base: "28px", md: "30px" }}
            // pb={3}
            // px={2}
            w="100%"
            h="11%"
            fontFamily="Work sans"
            flexDir="row"
            justifyContent={{ base: "start" }}
            alignItems="center"
            gap="0.5rem"
            overflowY="auto"
            bg="purple.400"
            roundedTop="lg"
            fontWeight="bold"
            textTransform="uppercase"
            paddingTop={"10px"}
            paddingBottom={"10px"}
          >
            <Box
              marginRight="10px"
              cursor={"pointer"}
              onClick={() => setSelectedChat("")}
            >
              {" "}
              <SlArrowLeft />
            </Box>

            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                  {getSender(user, selectedChat.users)}
                </>
              ) : (
                <>
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                  {selectedChat.chatName.toUpperCase()}
                </>
              ))}
            <Box
              marginRight="10px"
              cursor={"pointer"}
              ml={10}
              onClick={handleJoinRoom} // Update the onClick handler
            >
              {" "}
              <HiMiniVideoCamera />
            </Box>
            <Box
              marginRight="10px"
              cursor={"pointer"}
              ml={10}
              onClick={handleJoinRoomvoice} // Update the onClick handler
            >
              {" "}
              <IoIosCall />
            </Box>
          </Flex>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            // bg="white"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
            rounded="lg"
          >
            {loading ? (
              <Flex alignItems="center" justifyContent="center" h="100%">
                <img src="/loader.gif" width={"20%"} alt="Loader GIF" />
              </Flex>
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Flex dir="row">
                <Input
                  variant="filled"
                  h={"44px"}
                  bg="purple.100"
                  fontSize={"17px"}
                  placeholder="Enter a message.."
                  value={newMessage}
                  borderRadius="lg"
                  borderColor="gray.300"
                  borderWidth="1px"
                  onChange={typingHandler}
                  _focus={{
                    borderColor: "purple.400",
                    boxShadow: "none",
                  }}
                  _hover={{
                    borderColor: "gray.400",
                  }}
                />
                <Box
                  bg="#9F7AEA"
                  display="inline-block"
                  padding="11px"
                  cursor="pointer"
                  borderRadius="md"
                  onClick={handleSendMessage}
                  ml={1}
                >
                  <IoSend />
                </Box>
              </Flex>
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box
          d="flex"
          alignItems="center"
          bg="#f2f2f2"
          justifyContent="center"
          h="100%"
        >
          <img src="/robot.gif" alt="No chat selected GIF" />
          <Text fontSize="lg" pb={3} fontFamily="Work Sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
