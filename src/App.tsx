import {useState, useEffect} from 'react'
import './App.css'
import {getUpcomingChallenges} from './services/api.ts';
import '@mantine/core/styles.css';
import {FileInput, MantineProvider, NativeSelect} from '@mantine/core';
import { Text, Paper, Grid, Pill, Chip, Button, Card, Flex } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {formatDistanceToNow, intervalToDuration, subDays} from 'date-fns';
import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { useForm } from 'react-hook-form';
import Papa from 'papaparse';
import {ColDef} from "ag-grid-community";
import { format } from "date-fns";

const csvFile = '/concept2-season-2024.csv';

type UpcomingChallenges = {
  data: object[];
}

const COLUMNS = [
  'Date',
  'Start Time',
  'Type',
  'Description',
  'Work Time',
  'Rest Time',
  'Distance',
  'Rest Distance',
  'Stroke Rate',
  'Stroke Count',
  'Pace',
  'Total cal',
  'Avg. Heart Rate',
  'Drag Factor',
  'Ranked',
];

function App() {
  const gradient =
    'linear-gradient(45deg, #003470 0%, #001122 100%)';
  const DATE_FORMAT = "MMM D, YYYY";
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const { register, handleSubmit } = useForm();
  const onSubmitFiltersForm = data => console.log(data);

  const [upcomingChallenges, setUpcomingChallenges] = useState<UpcomingChallenges>({data: []});

  const [file, setFile] = useState();

  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [minimumDuration, setMinimumDuration] = useState(5);
  const [includeRower, setIncludeRower] = useState(true);
  const [includeBike, setIncludeBike] = useState(true);
  const [includeSki, setIncludeSki] = useState(true);

  const [rowData, setRowData] = useState();

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState<ColDef[]>([]);

  const getFormattedDuration = (seconds: number) => {
    const duration = intervalToDuration({
      start: new Date(0, 0, 0, 0, 0, 0),
      end: new Date(0,0,0,0,0, seconds)
    })
    const hr = duration.hours && duration.hours < 10 ? `0${duration.hours}` : duration.hours;
    const min = duration.minutes && duration.minutes < 10 ? `0${duration.minutes}` : duration.minutes;
    const sec = duration.seconds && duration.seconds < 10 ? `0${duration.seconds}` : duration.seconds;

    return `${hr ?? '00'}:${min ?? '00'}:${sec ?? '00'}`
  }

  const getData = async () => {
    await parseCSVIntoChartData(await fetchLocalCSVFile())
    setUpcomingChallenges(await getUpcomingChallenges(30));
  }

  useEffect(() => {
    void getData();
  }, []);

  // useEffect(() => {
  //   setRowData(filterRows(includeRower, includeBike));
  // }, [includeBike, includeRower])

  const fetchLocalCSVFile = async () => {
    try {
      const response = await fetch(csvFile);
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csv = await decoder.decode(result.value);
      console.log('csv', csv);
      return csv;
    } catch(e) {
      console.log(e);
    }
  }

  const handleCSVInput = (event) => {
    setFile(event);
  }

  const parseCSVIntoChartData = (csvFile: unknown) => {
    Papa.parse(csvFile, {
      complete: function(results) {
        const columnData = COLUMNS.map((colName: string) => {
          return { field: colName}
        })
        setColDefs(columnData);

        results.data.shift();
        const allRowData = results.data.filter(row => row.length > 1).map((item) => {
          console.log(item[1]);
          console.log(new Date(item[1]));
          return {
            ['Date']: item[1] ? format(new Date(item[1]), "ccc MM/dd/yyyy") : 'not a date',
            ['Start Time']: item[1] ? format(new Date(item[1]), "hh:mm aaa") : 'not a date',
            ["Type"]: item[19],
            ['Description']: item[2],
            ["Work Time"]: getFormattedDuration(item[4]),
            ["Rest Time"]: getFormattedDuration(item[6]),
            ["Distance"]: `${item[7]}m` || "",
            ["Rest Distance"]: item[8] ? `${item[8]}m` : "",
            ["Stroke Rate"]: item[9],
            ["Stroke Count"]: item[10],
            ["Pace"]: item[19] === 'RowErg' ? `${item[11]} / 500m` : `${item[11]} / 1000m`,
            ["Total cal"]: `${item[14]} (${item[13]} cal/hr)`,
            ["Avg. Heart Rate"]: item[15],
            ["Drag Factor"]: item[16],
            ["Ranked"]: item[20],
          }
        })

        //allRowData.shift();
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
    <form onSubmit={parseCSVIntoChartData}>
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
          placeholder={file ? file['name'] : "Click to choose .csv file"}
          accept="csv"
          onChange={handleCSVInput}
          clearable
        />
        <Button type={"submit"} disabled={!file}>Upload</Button>
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
        <form onSubmit={handleSubmit(onSubmitFiltersForm)}>
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
