import { openMiniApp } from "zmp-sdk";
import { Box, Button, Icon, Page, Text } from "zmp-ui";
import { useNavigate } from "react-router-dom";

import Clock from "@/components/clock";
import Logo from "@/components/logo";
import bg from "@/static/bg.svg";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen flex flex-col items-center justify-center space-y-6 bg-cover bg-center bg-no-repeat bg-white dark:bg-black"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <Box></Box>
      <Box textAlign="center" className="space-y-1">
        <Text.Title size="xLarge">Hello world!</Text.Title>
        <Clock />
      </Box>

      {/* Login Demo Button */}
      <Button
        variant="primary"
        suffixIcon={<Icon icon="zi-user" />}
        onClick={() => navigate("/login")}
        className="mb-4"
      >
        Login Demo
      </Button>

      <Button
        variant="primary"
        suffixIcon={<Icon icon="zi-more-grid" />}
        onClick={() => {
          openMiniApp({
            appId: "1070750904448149704", // ZaUI Components
          });
        }}
      >
        ZaUI Component Library
      </Button>
      <Logo className="fixed bottom-8" />
    </div>
  );
}

export default HomePage;
