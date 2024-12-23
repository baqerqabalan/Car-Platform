import React, { useState, useContext, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  Button,
  Box,
  IconButton,
  Typography,
  Switch,
  FormControlLabel,
  ThemeProvider,
  CssBaseline,
  createTheme,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { Vector3, Box3 } from "three";
import { ThemeContext } from "../../../context/ThemeProviderComponent";

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
    return <Typography><CircularProgress /></Typography>;
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
const CameraButtons = React.memo(({ setTargetPosition, cameraPositions }) => (
  <Box
    position="absolute"
    bottom={20}
    left="50%"
    sx={{
      transform: "translateX(-50%)",
      display: "flex",
      gap: 2,
      zIndex: 10,
      backgroundColor: "#fff",
      padding: 2,
      borderRadius: 2,
      boxShadow: 3,
    }}
  >
    {Object.entries(cameraPositions).map(
      ([label, position]) =>
        position && (
          <Button
            key={label}
            variant="contained"
            color="primary"
            onClick={() => setTargetPosition(position)}
          >
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </Button>
        )
    )}
  </Box>
));

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


// Main Component
export default function Model({ open, onClose, model }) {
  const [targetPosition, setTargetPosition] = useState([4, 2, 4]);
  const [cameraPositions, setCameraPositions] = useState({});
  const [manualControl, setManualControl] = useState(true); // State for toggling control mode

  const { mode } = useContext(ThemeContext);
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);


  const handleManualControlChange = (event) => {
    setManualControl(event.target.checked);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        display="flex"
        justifyContent="space-between"
        sx={{
          backgroundColor: "#009680",
          color: "#fff",
          fontSize: "1.5rem",
          fontWeight: 600,
          padding: "16px 24px",
          position: "relative",
        }}
      >
        3D Model Viewer{" "}
        <IconButton
          onClick={() => onClose()}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "#fff",
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent style={{ height: "500px", position: "relative" }}>       <CarCanvas
          targetPosition={targetPosition}
          model={model}
          setCameraPositions={setCameraPositions}
          manualControl={manualControl}
        />


        {!manualControl && (
          <CameraButtons
            setTargetPosition={setTargetPosition}
            cameraPositions={cameraPositions}
          />
        )}

        <Box
          position="absolute"
          top={20}
          left={20}
          sx={{
            zIndex: 10,
            display: "flex",
            gap: 1,
            backgroundColor: theme.palette.background.paper,
            padding: 1,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={manualControl}
                onChange={handleManualControlChange}
                color="primary"
              />
            }
            label={
              manualControl ? "Manual Control Mode" : "Position Control Mode"
            }
            sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#000" }}
          />
        </Box>
        </DialogContent>
        </Dialog>
    </ThemeProvider>
  );
}