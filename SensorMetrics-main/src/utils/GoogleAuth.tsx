import React, { useState } from "react";
import { auth, provider, signInWithPopup, signOut } from "../../firebaseConfig";
import { User } from "firebase/auth"; // Import the Firebase User type
import { IconButton, Tooltip } from "@mui/material";
import { UserRound } from "lucide-react";
import { CircleUserRound } from "lucide-react";
import Avatar from "@mui/material/Avatar";

const GoogleAuth: React.FC = () => {
  const [user, setUser] = useState<User | null>(null); // Use Firebase User type

  const handleLogin = async (): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // result.user is of type User
      console.log("User info:", result.user);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      console.log("User signed out");
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name: string) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
    };
  }

  return (
    <div>
      {user ? (
        <Tooltip
          title="Logout"
          arrow
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -14],
                  },
                },
              ],
            },
          }}
        >
          <IconButton sx={{ ml: "1vw" }} onClick={handleLogout}>
            <Avatar {...stringAvatar(user.displayName)} />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip
          title="Login"
          arrow
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -5],
                  },
                },
              ],
            },
          }}
        >
          <IconButton
            sx={{
              ml: "1vw",
              // , border: "0.00001rem solid white"
            }}
            onClick={handleLogin}
          >
            <CircleUserRound color="white" size={30} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default GoogleAuth;
