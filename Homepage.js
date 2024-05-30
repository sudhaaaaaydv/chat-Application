import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useHistory } from "react-router";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const history = useHistory();
  const { colorMode } = useColorMode(); // Get the current color mode

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) history.push("/chats");
  }, [history]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bgGradient={
          colorMode === "light"
            ? "linear(to-r, #4e0eff, #997af0)"
            : "linear(to-r, #1A202C, #2D3748)"
        }
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
        boxShadow="lg"
      >
        <Text fontSize="4xl" fontFamily="Work Sans" color="white">
          Talky
        </Text>
      </Box>
      <Box
        bg={colorMode === "light" ? "white" : "gray.800"} // Adjust background color for dark mode
        w="100%"
        p={4}
        borderRadius="lg"
        borderWidth="1px"
        boxShadow="md"
      >
        <Tabs isFitted variant="soft-rounded">
          <TabList
            mb="1em"
            justifyContent="center"
            bg="white"// Adjust tab background color for dark mode
            borderRadius="lg"
            borderWidth="1px"
            boxShadow="md"
          >
            <Tab
              _selected={{
                color: "white",
                bg:
                  colorMode === "light"
                    ? "rgba(126, 87, 194, 0.7)"
                    : "rgba(74, 144, 226, 0.7)", // Adjust selected tab color for dark mode
              }}
            >
              Login
            </Tab>
            <Tab
              _selected={{
                color: "white",
                bg:
                  colorMode === "light"
                    ? "rgba(126, 87, 194, 0.7)"
                    : "rgba(74, 144, 226, 0.7)", // Adjust selected tab color for dark mode
              }}
            >
              Sign Up
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;
