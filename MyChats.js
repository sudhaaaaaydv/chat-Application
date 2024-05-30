import { AddIcon } from "@chakra-ui/icons";
import { Avatar, Center } from "@chakra-ui/react";
import { Flex, Box, Button, Stack, Text } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender, getSenderpic } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import socket from "./socket";
const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [userStatuses, setUserStatuses] = useState({});
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    socket.connect();
    socket.on("user_status_change", ({ userId, status }) => {
      // Update user status in userStatuses state
      setUserStatuses((prevUserStatuses) => ({
        ...prevUserStatuses,
        [userId]: status,
      }));
    });
    return () => {
      // Clean up when the component unmounts
      socket.disconnect();
    };
  }, [fetchAgain]);

  return (
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="stretch"
      p={0}
      bg="#f2f2f2"
      w={{ base: "100%", md: "31%" }}
      borderRightWidth="1px"
      rounded="lg" // Rounded corners
    >
      <Box
        pb={2}
        px={2}
        py={1}
        mb={1}
        fontSize="20px"
        fontFamily="Work Sans" // Modern font
        d="flex"
        w="100%"
        h={"11%"}
        justifyContent="space-between"
        alignItems="center"
        borderBottomWidth="1px"
        bg="#7E57C2" // Purple as secondary color
        color="white"
        roundedTop="lg" // Rounded top corners
      >
        My Chats
        <GroupChatModal>
          <Button
            fontSize="14px"
            rightIcon={<AddIcon />}
            variant="link"
            color="white"
            _hover={{ textDecor: "none" }}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={0}
        bg="white" // White or cream shade as primary color
        w="100%"
        h="100%"
        overflowY="scroll"
      >
        {chats ? (
          <Stack>
            {chats.map((chat) => (
              <Flex
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#e6e6ff" : "white"}
                px={"1rem"}
                py={"0.3rem"}
                padding={"12px"}
                borderBottomWidth="2px"
                _hover={{ bg: "#e6e6ff" }}
                key={chat._id}
                rounded="lg" // Rounded corners for chat boxes
              >
                {!chat.isGroupChat ? (
                  <Avatar
                    mr={"1%"}
                    size="lg"
                    cursor="pointer"
                    name={user.name}
                    src={getSenderpic(loggedUser, chat.users)}
                  />
                ) : (
                  <Avatar
                    mr={"1%"}
                    size="lg"
                    cursor="pointer"
                    name={chat?.chatName}
                  />
                )}

                {chat.latestMessage && (
                  <Flex flexDir="row" justifyContent="center" noOfLines={1}>
                    <Text
                      fontSize="22px"
                      fontWeight="bold"
                      textTransform="uppercase"
                    >
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                    </Text>
                    {/* Display user status based on userStatuses */}
                    {chat.users.length === 2 && !chat.isGroupChat && (
                      <Box
                        w={4}
                        h={4}
                        borderRadius="full"
                        bg={
                          userStatuses[chat.users[0]._id] === "online"
                            ? "green.400" // Online status
                            : "gray.400" // Offline status
                        }
                        ml={2}
                        mr={1}
                      ></Box>
                    )}
                    <Text fontSize="19px" color="#7E57C2" noOfLines={1}>
                      <b>{chat.latestMessage.sender.name}:</b>{" "}
                      {chat.latestMessage.content.length > 50
                        ? chat.latestMessage.content.substring(0, 51) + "..."
                        : chat.latestMessage.content}
                    </Text>
                  </Flex>
                )}
              </Flex>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
