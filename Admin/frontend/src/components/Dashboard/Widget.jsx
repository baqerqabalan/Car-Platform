import { 
  Grid, 
  Box, 
} from '@mui/material';
import Cards from './Widgets/Cards';
import UserView from './Widgets/UserView/UserView';
import TopUsers from './Widgets/TopUsers';
import UserActivityChart from './Widgets/Chart';

function DashboardContent() {
  return (
    <Box p={3}>
      <Grid container spacing={3}>
      <Cards />
        <UserActivityChart />
        <TopUsers />
        <UserView />
      </Grid>
    </Box>
  );
}

export default DashboardContent;