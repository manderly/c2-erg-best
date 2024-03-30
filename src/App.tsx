import {useState, useEffect} from 'react'
import './App.css'
import '@mantine/core/styles.css';
import {Checkbox, FileInput, MantineProvider, NativeSelect} from '@mantine/core';
import { Grid, Chip, Button, Flex } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {subDays} from 'date-fns';
import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { useForm } from 'react-hook-form';
import Papa from 'papaparse';
import {ColDef, ICellRendererParams} from "ag-grid-community";
import clonedeep from 'lodash.clonedeep';
import {
  getFormattedDate,
  getFormattedDistance,
  getFormattedDuration,
  getFormattedTime,
  getMonthNumber
} from "./services/formatting_utils";
import {UpcomingChallenges} from "./components/UpcomingChallenges";
import {MonthCards} from "./components/MonthCards";

const csvFile = '/concept2-season-2024.csv';

// interface IRow {
//   data: {
//     'Date': string;
//     'Start Time': string;
//     'Type': string;
//     'Description': string;
//     'Pace': string;
//     'Work Time': string;
//     'Rest Time': string;
//     'Work Distance': string;
//     'Rest Distance': string;
//     'Stroke Rate': number;
//     'Stroke Count': number;
//     'Total Cal': string;
//     'Avg. Heart Rate': string;
//     'Drag Factor': number;
//     'Ranked': string;
//     'id': string;
//     }[];
// }

interface IRow {
  valueFormatted: string,
}

const distanceCellRenderer = (params: ICellRendererParams<IRow>) => {
  if (params['valueFormatted']) {
    const formatted = Number(params['valueFormatted']).toLocaleString();
    return <>{`${formatted}m`}</>
  } else {
    return <>--</>
  }
}

const numberCellRenderer = (params: ICellRendererParams<IRow>) => {
  console.log(params);
  if (params['value']) {
    const formatted = Number(params['value']).toLocaleString();
    return <>{formatted}</>
  } else {
    return <>--</>
  }
}

const ALL_COLUMNS = [
  {field: 'Date', flex: 3.2},
  {field: 'Start Time', flex: 2.5},
  {field: 'Type', flex: 2},
  {field: 'Description', flex: 3},
  {field: 'Pace', flex: 3},
  {
    headerName: "Workout Time",
    children: [
      {
        field: 'Work Time',
        flex: 2.5,
        headerName: 'Work',
        type: 'rightAligned'
      },
      {
        field: 'Rest Time',
        flex: 2.5,
        headerName: 'Rest',
        type: 'rightAligned',
      },
    ],
  },
  {
    headerName: 'Distance',
    children: [
      {
        field: 'Work Distance',
        flex: 2.5,
        headerName: 'Work',
        type: 'rightAligned',
        cellRenderer: distanceCellRenderer
      },
      {
        field: 'Rest Distance',
        flex: 2.5,
        headerName: 'Rest',
        type: 'rightAligned',
        cellRenderer: distanceCellRenderer
      },
    ]
  },
  {
    headerName: 'Stroke',
    children: [
      {
        field: 'Stroke Rate',
        flex: 1.5,
        headerName: 'Rate',
        type: 'rightAligned',
      },
      {
        field: 'Stroke Count',
        flex: 1.5,
        headerName: 'Count',
        type: 'rightAligned',
        cellRenderer: numberCellRenderer
      },
    ]
  },

  {field: 'Total cal', flex: 1},
  {field: 'Avg. Heart Rate', flex: 1},
  {field: 'Drag Factor', flex: 1},
  {field: 'Ranked', flex: 1},
];

function App() {
  const DATE_FORMAT = "MMM D, YYYY";
  const bestsOfTheLastYear = {
    1: {name: 'January', year: 2024, distance: 0},
    2: {name: 'February', year: 2024, distance: 0},
    3: {name: 'March', year: 2024, distance: 0},
    4: {name: 'April', year: 2023, distance: 0},
    5: {name: 'May', year: 2023, distance: 0},
    6: {name: 'June', year: 2023, distance: 0},
    7: {name: 'July', year: 2023, distance: 0},
    8: {name: 'August', year: 2023, distance: 0},
    9: {name: 'September', year: 2023, distance: 0},
    10: {name: 'October', year: 2023, distance: 0},
    11: {name: 'November', year: 2023, distance: 0},
    12: {name: 'December', year: 2023, distance: 0},
  };

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

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState<ColDef[]>(getFilteredColumns());
  // Base Row Data: The unfiltered rows
  const [baseRowData, setBaseRowData] = useState();
  // Row Data: Filtered rows
  const [rowData, setRowData] = useState();

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

  const updateBests = (row: unknown) => {
    const month = getMonthNumber(row['Date']);
    console.log(row['Work Distance']);
    if (row['Work Distance'] > bestsOfTheLastYear[month].distance) {
      bestsOfTheLastYear[month].distance = row['Work Distance'];
    }
    console.log(bestsOfTheLastYear)
  }

  const parseCSVIntoChartData = (csvFile: unknown) => {
    Papa.parse(csvFile, {
      complete: function(results) {
        results.data.shift();
        const allRowData = results.data.filter(row => row.length > 1).map((item) => {
          const rowData = {
            ['Date']: getFormattedDate(item[1]),
            ['Start Time']: getFormattedTime(item[1]),
            ["Type"]: item[19],
            ['Description']: item[2],
            ["Pace"]: item[19] === 'RowErg' ? `${item[11]} / 500m` : `${item[11]} / 1000m`,
            ["Work Time"]: getFormattedDuration(item[4]),
            ["Rest Time"]: getFormattedDuration(item[6]),
            ["Work Distance"]: getFormattedDistance(item[7]) ?? '-',
            ["Rest Distance"]: getFormattedDistance(item[8]) ?? '-',
            ["Stroke Rate"]: item[9],
            ["Stroke Count"]: item[10],
            ["Total cal"]: `${item[14]} (${item[13]} cal/hr)`,
            ["Avg. Heart Rate"]: item[15],
            ["Drag Factor"]: item[16],
            ["Ranked"]: item[20],
            ['id']: item[0],
          }
          updateBests(rowData);
          return rowData;
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
            <MonthCards bests={bestsOfTheLastYear}/>
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
