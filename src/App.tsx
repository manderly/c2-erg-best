import { useState, useEffect } from 'react'
import './App.css'
import { getUpcomingChallenges } from './services/api.ts';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Text, Paper, Grid, Pill } from '@mantine/core';
import {formatDistanceToNow} from 'date-fns'

type UpcomingChallenges = {
  data: object[];
}


function App() {
  const gradient =
    'linear-gradient(45deg, #003470 0%, #001122 100%)';

  const [upcomingChallenges, setUpcomingChallenges] = useState<UpcomingChallenges>({data: []});

  const getData = async () => {
    setUpcomingChallenges(await getUpcomingChallenges(30));
    // another call 1
    // another call 2
  }
  useEffect(() => {
    void getData();
  }, []);

  const displayUpcomingChallenges = () => (
    <>
    <h2>Upcoming Challenges</h2>
    <Paper shadow="xs" p="md">
      {upcomingChallenges.data.map((item) =>
        <div key={item.key}>
          <Text>{item.name}</Text>
          <label>{item.description}</label>
          <Pill styles={{root: { backgroundImage: gradient}}}>{formatDistanceToNow(new Date(item.end))} remaining</Pill>
        </div>)
      }
    </Paper>
    </>
  );

  return (
    <MantineProvider defaultColorScheme="dark">
      <div className={"app-container"}>
      <h1>C2 Erg Best</h1>
        <Grid>
          <Grid.Col span={9}></Grid.Col>

          <Grid.Col span={3} className={'grid-challenges'}><div>
            {displayUpcomingChallenges()}
          </div>
          </Grid.Col>
        </Grid>
      </div>

    </MantineProvider>
  )
}

export default App
