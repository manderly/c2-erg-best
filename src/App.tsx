import { useState, useEffect } from 'react'
import './App.css'
import { getUpcomingChallenges } from './services/api.ts';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Text, Paper, Grid, Pill, Chip } from '@mantine/core';
import {formatDistanceToNow} from 'date-fns';

import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import {rawColData, rawRowData} from "./services/localData";
import {filterRows} from "./services/utils";

type UpcomingChallenges = {
  data: object[];
}

function App() {
  const gradient =
    'linear-gradient(45deg, #003470 0%, #001122 100%)';

  const [upcomingChallenges, setUpcomingChallenges] = useState<UpcomingChallenges>({data: []});
  const [includeRower, setIncludeRower] = useState(true);
  const [includeBike, setIncludeBike] = useState(true);

  // sample ag-grid data
  const [rowData, setRowData] = useState(rawRowData);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState(rawColData);

  const getData = async () => {
    setUpcomingChallenges(await getUpcomingChallenges(30));
    // another call 1
    // another call 2
  }
  useEffect(() => {
    void getData();
  }, []);

  useEffect(() => {
    setRowData(filterRows(includeRower, includeBike));
  }, [includeBike, includeRower])

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
          <Grid.Col span={9}>

            <div className={'filters-for-table'}>
              <Chip checked={includeRower} onChange={() => setIncludeRower((v) => !v)}>
                Rower
              </Chip>
              <Chip checked={includeBike} onChange={() => setIncludeBike(v => !v)}>
                Bike
              </Chip>
            </div>

            <div
              className="ag-theme-quartz" // applying the grid theme
              style={{ height: 500 }} // the grid will fill the size of the parent container
            >
            <AgGridReact
              rowData={rowData}
              columnDefs={colDefs}
            />
            </div>
          </Grid.Col>

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
