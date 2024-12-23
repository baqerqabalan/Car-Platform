import { Button,  Grid, Typography } from "@mui/material";
import { ArrowBack, List } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
      <Grid container justifyContent="space-between" alignItems="center" sx={{backgroundColor:"#009680", mt:2, padding:3, borderRadius:"10px", boxShadow:"0 8px 8px rgb(0,0,0,0.1)"}}>
        <Button
          variant="contained"
          sx={{backgroundColor:"white", color:"#009680"}}
          onClick={() => navigate(-1)}
        >
          <ArrowBack /> Back
        </Button>
        <Typography variant="h4" fontWeight="bold" color="white">
          Badges Management
        </Typography>
        <Button
          variant="contained"
          sx={{backgroundColor:"white", color:"#009680"}}
          onClick={() => navigate('/badges/manage-badges')}
        >
          <List />
          View Badges
        </Button>
      </Grid>
  );
};

export default Header;
