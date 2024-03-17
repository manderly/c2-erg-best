import { useState, useEffect } from 'react'
import './App.css'
import { getUpcomingChallenges } from './services/api.ts';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Text, Paper, Grid, Pill, Chip } from '@mantine/core';
import {formatDistanceToNow} from 'date-fns';
import cloneDeep from 'lodash.clonedeep'

import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

type UpcomingChallenges = {
  data: object[];
}


function App() {
  const gradient =
    'linear-gradient(45deg, #003470 0%, #001122 100%)';

  const rawColData = [
    { field: "ergType", flex: 1 },
    { field: "date", flex: 2 },
    { field: "time", flex: 2 },
    { field: "pace", flex: 2 },
    { field: "calories", flex: 2 },
    { field: "stroke", flex: 2 },
    { field: "best", flex: 2 },
  ];

  const rawRowData = [
    { date: "01-01-2024", ergType: "Row", time: '5:50', pace: '2:51/500m', calories: '45', stroke: '25 s/m', best: false },
    { date: "01-02-2024", ergType: "Bike", time: '25:00', pace: '2:25/1000m', calories: '110', stroke: '30 s/m', best: true},
    { date: "01-03-2024", ergType: "Row", time: '8:30', pace: '2:45/500m', calories: '65', stroke: '26 s/m', best: true },
  ];

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

  const updateRows = () => {
    const copiedRowData = cloneDeep(rawRowData);
    const filteredRows = copiedRowData.filter((row) => {
      if (row.ergType === 'Row' && includeRower) {
        return true;
      }
      if (row.ergType === 'Bike' && includeBike) {
        return true;
      }
      return false;
    });

    setRowData(filteredRows);
  }

  useEffect(() => {
    updateRows();
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
