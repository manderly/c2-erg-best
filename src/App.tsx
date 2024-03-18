import {useState, useEffect, ReactNode} from 'react'
import './App.css'
import {getUpcomingChallenges} from './services/api.ts';
import '@mantine/core/styles.css';
import {FileInput, Group, MantineProvider, NativeSelect} from '@mantine/core';
import { Text, Paper, Grid, Pill, Chip, Button, Card, Flex } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {formatDistanceToNow, subDays} from 'date-fns';
import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { useForm } from 'react-hook-form';
import Papa from 'papaparse';
import {ColDef} from "ag-grid-community";

type UpcomingChallenges = {
  data: object[];
}

function App() {
  const gradient =
    'linear-gradient(45deg, #003470 0%, #001122 100%)';
  const DATE_FORMAT = "MMM D, YYYY";
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const { register, handleSubmit } = useForm();
  const onSubmit = data => console.log(data);

  const [upcomingChallenges, setUpcomingChallenges] = useState<UpcomingChallenges>({data: []});

  const [file, setFile] = useState();

  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [minimumDuration, setMinimumDuration] = useState(5);
  const [includeRower, setIncludeRower] = useState(true);
  const [includeBike, setIncludeBike] = useState(true);
  const [includeSki, setIncludeSki] = useState(true);

  // sample ag-grid data
  const [rowData, setRowData] = useState();

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState<ColDef[]>([]);

  const getData = async () => {
    setUpcomingChallenges(await getUpcomingChallenges(30));
    // another call 1
    // another call 2
  }
  useEffect(() => {
    void getData();
  }, []);

  // useEffect(() => {
  //   setRowData(filterRows(includeRower, includeBike));
  // }, [includeBike, includeRower])

  const handleCSVInput = (event) => {
    setFile(event);
  }

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    Papa.parse(file, {
      complete: function(results) {
        const columnData: ColDef[] = results.data[0].filter((item) => {
          return item !== 'weight' && item !== 'Date Entered' && item !== 'Comments';
        }).map((item) => {
          return {field: item}
        });
        setColDefs(columnData);

        const allRowData = results.data.map((item) => {
          // todo: maybe this could iterate through columndata instead
          return {
            ['Log ID']: item[0],
            ['Date']: item[1],
            ['Description']: item[2],
            ['Work Time (Formatted)']: item[3],
            ["Work Time (Seconds)"]: item[4],
            ["Rest Time (Formatted)"]: item[5],
            ["Rest Time (Seconds)"]: item[6],
            ["Work Distance"]: item[7] || "",
            ["Rest Distance"]: item[8],
            ["Stroke Rate/Cadence"]: item[9],
            ["Stroke Count"]: item[10],
            ["Pace"]: item[11],
            ["Avg Watts"]: item[12],
            ["Cal/Hour"]: item[13],
            ["Total Cal"]: item[14],
            ["Avg Heart Rate"]: item[15],
            ["Drag Factor"]: item[16],
            ["Age"]: item[17],
            ["Type"]: item[19],
            ["Ranked"]: item[20],
          }
        })

        allRowData.shift();
        setRowData(allRowData);
      }
    });
  }

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

  const UploadFile = () => (
    <form onSubmit={handleCSVUpload}>
      <Flex
        className={"upload-file"}
        mih={100}
        gap="md"
        justify="flex-start"
        align="flex-end"
        direction="row"
        wrap="wrap">
        <FileInput
          label="Upload Concept2 CSV data"
          description="Download from official site"
          placeholder="Click to choose .csv file"
          accept="csv"
          onChange={handleCSVInput}
          clearable
        />
        <Button type={"submit"}>Upload</Button>
      </Flex>
    </form>
  );

  const SearchFilters = () => (
    <>
    <h2>Filter data</h2>
      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="wrap"
      >
        <Chip checked={includeRower} onChange={() => setIncludeRower((v) => !v)}>
          RowErg
        </Chip>
        <Chip checked={includeBike} onChange={() => setIncludeBike(v => !v)}>
          BikeErg
        </Chip>
        <Chip checked={includeSki} onChange={() => setIncludeSki(v => !v)}>
          SkiErg
        </Chip>
      </Flex>


      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="wrap"
        className={"filter-data"}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DateInput value={startDate} onChange={setStartDate} label={"Start"} valueFormat={DATE_FORMAT}/>
          <DateInput value={endDate} onChange={setEndDate} label={"End"} valueFormat={DATE_FORMAT}/>

          <NativeSelect
            label={"Exclude workouts shorter than..."}
            value={minimumDuration}
            onChange={(event) => setMinimumDuration(event.currentTarget.value)}
            data={['30 seconds', '1 minute', '5 minutes', '10 minutes']}
          />
        </form>
      </Flex>
    </>
  );

  const ResultsTable = () => (
    <div
      className="ag-theme-quartz" // applying the grid theme
      style={{ height: 600 }} // the grid will fill the size of the parent container
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
      />
    </div>
  );

  const MonthCard = (month: string) => (
    <Card className={"previous-month"}>
      <h3>{JSON.stringify(month)}</h3>
      <ul>
        <li>Pace: 0</li>
        <li>Distance: 1500</li>
        <li>Calories: 100</li>
        <li>Strokes: 10 s/m</li>
        <li>Details</li>
      </ul>
    </Card>
  );

  return (
    <MantineProvider defaultColorScheme="dark">
      <div className={"app-container"}>
      <h1>C2 Erg Best</h1>
        <Grid className={"pad-left"}>
          <Grid.Col span={9}>
            <UploadFile />
            <SearchFilters />
            <ResultsTable/>

            <h2>Bests</h2>

            <Flex
              mih={50}
              gap="md"
              justify="flex-start"
              align="flex-start"
              direction="row"
              wrap="wrap"
            >
            {MONTHS.map((month) => <MonthCard month={month} key={month}/>)}
            </Flex>

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
