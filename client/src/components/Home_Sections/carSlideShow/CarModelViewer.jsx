import React, { useState, useContext, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  Button,
  Box,
  IconButton,
  Typography,
  Switch,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Tab,
  Tabs,
  useMediaQuery,
} from "@mui/material";
import {
  VolumeUp,
  PowerSettingsNew,
  Speed,
  ArrowRight,
  ArrowDownward,
  ArrowUpward,
} from "@mui/icons-material";
import { Vector3, Box3 } from "three";
import { ThemeContext } from "../../../context/ThemeProviderComponent";
import { isAuthenticated } from "../../../helpers/authHelper";

// Car Model Component
function Car({ model, setCameraPositions }) {
  const { scene } = useGLTF(model); // Assuming the model is a .glb file

  // Calculate camera positions based on model dimensions
  useMemo(() => {
    if (scene) {
      const positions = calculateCameraPositions(scene);
      setCameraPositions(positions);
    }
  }, [scene, setCameraPositions]);

  if (!scene) {
    return <Typography>Loading Model...</Typography>;
  }

  return <primitive object={scene} scale={1.5} />;
}

// Calculate dynamic camera positions based on model bounding box
const calculateCameraPositions = (scene) => {
  const boundingBox = new Box3().setFromObject(scene);
  const center = new Vector3();
  const size = new Vector3();

  boundingBox.getCenter(center);
  boundingBox.getSize(size);

  const offset = Math.max(size.x, size.y, size.z) * 1.5;

  return {
    exterior: [center.x + offset, center.y + offset / 2, center.z + offset],
    interior: [center.x, center.y + size.y * 0.2, center.z],
    above: [center.x, center.y + offset * 1.5, center.z],
    front: [center.x, center.y, center.z + offset * 0.8],
    back: [center.x, center.y, center.z - offset * 0.8],
    right: [center.x + offset * 0.8, center.y, center.z],
    left: [center.x - offset * 0.8, center.y, center.z],
  };
};

// Camera Buttons Component
const CameraButtons = React.memo(({ setTargetPosition, cameraPositions }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Box
      position="absolute"
      bottom={20}
      left="50%"
      sx={{
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 1,
        zIndex: 10,
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 3,
        "@media (max-width: 600px)": {
          flexDirection: "row", // Keeps the button aligned row-wise when hidden
        },
      }}
    >
      {/* Arrow Toggle Button */}
      <IconButton
        onClick={toggleMenu}
        sx={{
          backgroundColor: "#00008b",
          color: "#fff",
          marginRight: 1,
          "&:hover": {
            backgroundColor: "#0000a5",
          },
        }}
      >
        {isOpen ? <ArrowDownward /> : <ArrowUpward />}
      </IconButton>

      {/* Hidden Buttons */}
      <Box
        sx={{
          display: isOpen ? "flex" : "none", // Show only when isOpen is true
          gap: 2,
          marginTop: 1,
          "@media (max-width: 600px)": {
            flexDirection: "column",
            gap: 1,
            marginTop: 0,
          },
        }}
      >
        {Object.entries(cameraPositions).map(
          ([label, position]) =>
            position && (
              <Button
                key={label}
                variant="contained"
                sx={{
                  backgroundColor: "#00008b",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#0000a5",
                  },
                  fontSize: "0.8rem",
                  "@media (max-width: 600px)": {
                    fontSize: "0.7rem",
                  },
                }}
                onClick={() => setTargetPosition(position)}
              >
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </Button>
            )
        )}
      </Box>
    </Box>
  );
});

// Camera Controller
function CameraController({ targetPosition }) {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.lerp(new Vector3(...targetPosition), 0.1);
    camera.lookAt(0, 1, 0);
  });

  return null;
}

// 3D Canvas Component
function CarCanvas({
  targetPosition,
  model,
  setCameraPositions,
  manualControl,
}) {
  const { mode } = useContext(ThemeContext);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Canvas>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 2, 0]} intensity={10} />
        <directionalLight position={[-5, 2, 0]} intensity={10} />
        <directionalLight position={[-10, 10, -10]} intensity={1.2} />
        <pointLight position={[0, 2, -5]} intensity={10} />
        <pointLight position={[0, 2.3, -1]} intensity={5} />
        <spotLight position={[0, 10, 0]} intensity={1.5} angle={0.5} />

        {!manualControl && <CameraController targetPosition={targetPosition} />}

        <Car model={model} setCameraPositions={setCameraPositions} />

        {/* Show OrbitControls only when manual control is enabled */}
        {manualControl ? (
          <OrbitControls
            enableZoom={true}
            enableRotate={true}
            enablePan={true}
          />
        ) : null}
      </Canvas>
    </ThemeProvider>
  );
}

// Info Panel
const InfoPanel = React.memo(({ tabValue, handleTabChange, features }) => {
  const { mode } = useContext(ThemeContext);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        position="absolute"
        right={20}
        top="25%"
        sx={{
          width: 300,
          transform: "translateY(-50%)",
          backgroundColor: "#fff",
          padding: 2,
          borderRadius: 2,
          boxShadow: 3,
          zIndex: 10,
        }}
      >
        <Typography variant="h6" sx={{ color: "#000" }}>
          Car Features
        </Typography>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="car-feature-tabs"
        >
          <Tab label="Engine" sx={{ color: "#000" }} />
          <Tab label="Interior" sx={{ color: "#000" }} />
          <Tab label="Safety" sx={{ color: "#000" }} />
        </Tabs>
        <Box mt={2}>
          {tabValue === 0 && (
            <Typography variant="body2" sx={{ color: "#000" }}>
              Engine: {features.engine}
            </Typography>
          )}
          {tabValue === 1 && (
            <Typography variant="body2" sx={{ color: "#000" }}>
              Interior: {features.interior}
            </Typography>
          )}
          {tabValue === 2 && (
            <Typography variant="body2" sx={{ color: "#000" }}>
              Safety: {features.safety}
            </Typography>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
});

// Main Component
export default function CarModelViewer({ model, audios, features, productId }) {
  const [targetPosition, setTargetPosition] = useState([4, 2, 4]);
  const [cameraPositions, setCameraPositions] = useState({});
  const [manualControl, setManualControl] = useState(true); // State for toggling control mode
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const { mode } = useContext(ThemeContext);
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleInfoPanel = () => {
    setShowInfoPanel((prev) => !prev);
  };
  const handleHorn = () => new Audio(audios.horn).play();
  const handleIgnition = () => new Audio(audios.engine).play();
  const handleBoost = () => new Audio(audios.boost).play();

  const handleManualControlChange = (event) => {
    setManualControl(event.target.checked);
  };

  const isMobile = useMediaQuery("(max-width: 600px)");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          position: "relative",
          height: "100vh",
          width: "100%",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(90deg, #00008b, #fff)",
            color: "#fff",
            padding: isMobile ? "8px 10px" : "10px 20px",
            zIndex: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Car Explorer
          </Typography>
          <Button
            variant="contained"
            sx={{
              background: "#00008b",
              "&:hover": { background: "#0000a5" },
              color: "#fff",
            }}
            onClick={() =>
              isAuthenticated()
                ? (window.location.href = `/Market Place/Product/${productId}`)
                : (window.location.href = `/login?redirect=/Market Place/Product/${productId}`)
            }
          >
            View Product Details <ArrowRight />
          </Button>
        </Box>

        <CarCanvas
          targetPosition={targetPosition}
          model={model}
          setCameraPositions={setCameraPositions}
          manualControl={manualControl}
        />

        <Button
          variant="contained"
          color="info"
          onClick={toggleInfoPanel}
          sx={{
            position: "absolute",
            right: 20,
            top: 75,
            zIndex: 10,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.mode === "dark" ? "#fff" : "#000",
          }}
        >
          {showInfoPanel ? "Hide Info" : "Show Info"}
        </Button>

        {showInfoPanel && (
          <InfoPanel
            tabValue={tabValue}
            handleTabChange={handleTabChange}
            features={features}
          />
        )}

        <Box
          position="absolute"
          left={20}
          bottom={20}
          sx={{
            display: "flex",
            gap: 1,
            backgroundColor: theme.palette.background.paper,
            padding: 1,
            borderRadius: 2,
            boxShadow: 3,
            zIndex: 10,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <IconButton color="secondary" onClick={handleHorn}>
            <VolumeUp />
          </IconButton>
          <IconButton color="secondary" onClick={handleIgnition}>
            <PowerSettingsNew />
          </IconButton>
          <IconButton color="secondary" onClick={handleBoost}>
            <Speed />
          </IconButton>
        </Box>

        {!manualControl && (
          <CameraButtons
            setTargetPosition={setTargetPosition}
            cameraPositions={cameraPositions}
          />
        )}

        <Box
          position="absolute"
          top={75}
          left={20}
          sx={{
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.palette.background.paper,
            padding: 1.5,
            borderRadius: 3,
            boxShadow: 3,
            width: isMobile ? "120px" : "180px",
            height: "50px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "0 10px",
            }}
          >
                        <Switch
              checked={manualControl}
              onChange={handleManualControlChange}
              color="primary"
              sx={{
                "& .MuiSwitch-thumb": {
                  width: "20px",
                  height: "20px",
                },
                "& .MuiSwitch-track": {
                  borderRadius: "20px",
                },
              }}
            />

            <Typography
              sx={{
                fontSize: isMobile ? "0.75rem" : "1rem",
                fontWeight: "bold",
                color: theme.palette.text.primary,
              }}
            >
              {manualControl ? "Manual" : "Position"}
            </Typography>
          </Box>
        </Box>
      </div>
    </ThemeProvider>
  );
}
