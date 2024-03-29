import {useState, useEffect} from 'react'
import './App.css'
import {getUpcomingChallenges} from './services/api.ts';
import '@mantine/core/styles.css';
import {Checkbox, FileInput, MantineProvider, NativeSelect} from '@mantine/core';
import { Grid, Chip, Button, Card, Flex } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {subDays} from 'date-fns';
import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { useForm } from 'react-hook-form';
import Papa from 'papaparse';
import {ColDef} from "ag-grid-community";
import clonedeep from 'lodash.clonedeep';
import {getFormattedDate, getFormattedDuration, getFormattedTime} from "./services/formatting_utils";
import {UpcomingChallenges} from "./components/UpcomingChallenges";

const csvFile = '/concept2-season-2024.csv';

const ALL_COLUMNS = [
  {field: 'Date', flex: 3.2},
  {field: 'Start Time', flex: 2.5},
  {field: 'Type', flex: 2},
  {field: 'Description', flex: 3},
  {field: 'Pace', flex: 3},
  {
    headerName: "Workout Time",
    children: [
      {field: 'Work Time', flex: 2.5, headerName: 'Work'},
      {field: 'Rest Time', flex: 2.5, headerName: 'Rest'},
    ],
  },
  {
    headerName: 'Distance',
    children: [
      {field: 'Work Distance', flex: 2, headerName: 'Work'},
      {field: 'Rest Distance', flex: 2, headerName: 'Rest'},
    ]
  },
  {
    headerName: 'Stroke',
    children: [
      {field: 'Stroke Rate', flex: 1.5, headerName: 'Rate'},
      {field: 'Stroke Count', flex: 1.5, headerName: 'Count'},
    ]
  },

  {field: 'Total cal', flex: 1},
  {field: 'Avg. Heart Rate', flex: 1},
  {field: 'Drag Factor', flex: 1},
  {field: 'Ranked', flex: 1},
];

function App() {
  const DATE_FORMAT = "MMM D, YYYY";
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const getFilteredRows = () => {
    const copy = clonedeep(baseRowData);
    if (copy && copy.length) {
      return copy.filter((row) => {
        if (includeBike && row.Type === 'BikeErg') {
          return row;
        } else if (!includeBike && row.Type === 'BikeErg') {
          return;
        }

        if (includeRower && row.Type === 'RowErg') {
          return row;
        } else if (!includeRower && row.Type === 'RowErg') {
          return;
        }

        return row;
      })
    }
  }

  const getFilteredColumns = () => {
    return ALL_COLUMNS.filter((col: unknown ) => {
      if (col.field === 'Start Time' && includeStartTime) {
        return col;
      } else if (col.field === 'Start Time' && !includeStartTime) {
        return;
      }

      if (col.field === 'Total cal' && includeTotalCal) {
        return col;
      } else if (col.field === 'Total cal' && !includeTotalCal) {
        return;
      }

      if (col.field === 'Ranked' && includeRanked) {
        return col;
      } else if (col.field === 'Ranked' && !includeRanked) {
        return;
      }

      if (col.field === 'Drag Factor' && includeDragFactor) {
        return col;
      } else if (col.field === 'Drag Factor' && !includeDragFactor) {
        return;
      }

      return col;
    })
  }

  const { register, handleSubmit } = useForm();
  const onSubmitFiltersForm = data => console.log(data);

  const [file, setFile] = useState();

  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [minimumDuration, setMinimumDuration] = useState(5);
  const [includeRower, setIncludeRower] = useState(true);
  const [includeBike, setIncludeBike] = useState(true);
  const [includeSki, setIncludeSki] = useState(true);
  const [includeStartTime, setIncludeStartTime] = useState(false);
  const [includeTotalCal, setIncludeTotalCal] = useState(false);
  const [includeRanked, setIncludeRanked] = useState(false);
  const [includeDragFactor, setIncludeDragFactor] = useState(false);
  const [baseRowData, setBaseRowData] = useState();
  const [rowData, setRowData] = useState();

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState<ColDef[]>(getFilteredColumns());

  const getData = async () => {
    await parseCSVIntoChartData(await fetchLocalCSVFile())
  }

  useEffect(() => {
    void getData();
  }, []);

  useEffect(() => {
    setColDefs(getFilteredColumns());
  }, [includeStartTime, includeTotalCal, includeRanked, includeDragFactor])

  useEffect(() => {
    setRowData(getFilteredRows());
  }, [baseRowData, includeBike, includeRower])

  const fetchLocalCSVFile = async () => {
    try {
      const response = await fetch(csvFile);
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csv = await decoder.decode(result.value);
      //console.log('csv', csv);
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
        results.data.shift();
        const allRowData = results.data.filter(row => row.length > 1).map((item) => {
          return {
            ['Date']: getFormattedDate(item[1]),
            ['Start Time']: getFormattedTime(item[1]),
            ["Type"]: item[19],
            ['Description']: item[2],
            ["Pace"]: item[19] === 'RowErg' ? `${item[11]} / 500m` : `${item[11]} / 1000m`,
            ["Work Time"]: getFormattedDuration(item[4]),
            ["Rest Time"]: getFormattedDuration(item[6]),
            ["Work Distance"]: `${item[7]}m` || "",
            ["Rest Distance"]: item[8] ? `${item[8]}m` : "-",
            ["Stroke Rate"]: item[9],
            ["Stroke Count"]: item[10],
            ["Total cal"]: `${item[14]} (${item[13]} cal/hr)`,
            ["Avg. Heart Rate"]: item[15],
            ["Drag Factor"]: item[16],
            ["Ranked"]: item[20],
          }
        });

        setBaseRowData(allRowData);
      }
    });
  }

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
        direction="col"
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

      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        direction="col"
        wrap="wrap"
        className={"filter-data"}
      >
        <Checkbox checked={includeStartTime} label={"Include start time"} onChange={() => setIncludeStartTime(prev => !prev)}/>
        <Checkbox checked={includeTotalCal} label={"Include calories"} onChange={() => setIncludeTotalCal(prev => !prev)}/>
        <Checkbox checked={includeRanked} label={"Include ranked"} onChange={() => setIncludeRanked(prev => !prev)}/>
        <Checkbox checked={includeDragFactor} label={"Include drag factor"} onChange={() => setIncludeDragFactor(prev => !prev)}/>
      </Flex>
    </>
  );

  const gridOptions = {
    getRowStyle: getRowStyleErgType
  }

  function getRowStyleErgType(item) {
    if (item.data.Type === 'RowErg') {
      return {
        'backgroundColor': '#455A64',
        'color': '#F4F8F5'
      }
    } else if (item.data.Type === 'BikeErg') {
      return {
        'backgroundColor': '#4CAF50',
        'color': '#F4F8F5'
      };
    }
    return null;
  }

  const ResultsTable = () => (
    <div
      className="ag-theme-quartz" // applying the grid theme
      style={{ height: 600 }} // the grid will fill the size of the parent container
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        striped={true}
        gridOptions={gridOptions}
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
          <Grid.Col span={12}>
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
          <Grid.Col span={12} className={'grid-challenges'}><div>
            <UpcomingChallenges />
          </div>
          </Grid.Col>
        </Grid>
      </div>

    </MantineProvider>
  )
}

export default App
