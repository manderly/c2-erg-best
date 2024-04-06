import {useState, useEffect, useRef} from 'react'
import './App.css'
import '@mantine/core/styles.css';
import {Checkbox, Divider, FileInput, MantineProvider, NativeSelect} from '@mantine/core';
import { Grid, Chip, Button, Flex } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {isAfter, isBefore, subDays} from 'date-fns';
import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { useForm } from 'react-hook-form';
import Papa from 'papaparse';
import {ColDef, GridOptions, ICellRendererParams} from "ag-grid-community";
import clonedeep from 'lodash.clonedeep';
import {
  getFormattedDate,
  getFormattedDistance, getFormattedDistanceString,
  getFormattedDuration,
  getFormattedTime,
  getMonthNumber, getRowYear, parseTimeToMilliseconds
} from "./services/formatting_utils";
import {UpcomingChallenges} from "./components/UpcomingChallenges";
import {MonthCards} from "./components/MonthCards";

const csvFile = '/concept2-season-2024.csv';

interface IRow {
  valueFormatted: string,
}

const ergTypeCellRenderer = (params: ICellRendererParams) => {
  return <>{params.data.type.charAt(0).toUpperCase() + params.data.type.slice(1)}</>;
}

const distanceCellRenderer = (params: ICellRendererParams<IRow>) => {
  return getFormattedDistanceString(params['valueFormatted']);
}

const numberCellRenderer = (params: ICellRendererParams<IRow>) => {
  const value = Number(params['value']);
  if (value > 0) {
    return <>{value.toLocaleString()}</>
  } else {
    return <>--</>
  }
}

type WorkoutDataType = {
  data: WorkoutRowType,
}

type WorkoutRowType = {
  date: string,
  startTime: string,
  type: string,
  description: string,
  pace: string,
  workTime: string,
  restTime: string,
  workDistance: number,
  restDistance: number,
  strokeRate: number,
  strokeCount: number,
  totalCal: string,
  avgHeartRate: number,
  dragFactor: number,
  ranked: boolean,
  id: string,
}

const ALL_COLUMNS = [
  {field: 'date', flex: 3.2},
  {field: 'startTime', flex: 2.5},
  {field: 'type', flex: 2, cellRenderer: ergTypeCellRenderer},
  {field: 'description', flex: 3},
  {field: 'pace', flex: 3},
  {
    headerName: "Workout Time",
    children: [
      {
        field: 'workTime',
        flex: 2.5,
        headerName: 'Work',
        type: 'rightAligned'
      },
      {
        field: 'restTime',
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
        field: 'workDistance',
        flex: 2.5,
        headerName: 'Work',
        type: 'rightAligned',
        cellRenderer: distanceCellRenderer
      },
      {
        field: 'restDistance',
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
        field: 'strokeRate',
        flex: 1.5,
        headerName: 'Rate',
        type: 'rightAligned',
      },
      {
        field: 'strokeCount',
        flex: 1.5,
        headerName: 'Count',
        type: 'rightAligned',
        cellRenderer: numberCellRenderer
      },
    ]
  },
  {field: 'totalCal', flex: 1},
  {headerName: '♥', field: 'avgHeartRate', flex: 1},
  {field: 'dragFactor', flex: 1},
  {field: 'ranked', flex: 1},
];

export interface RowData {
  distance: number;
  pace: string;
  strokeRate: number;
}

export interface BestMonthIF {
  name: string;
  year: number;
  rowErg: RowData;
  bikeErg: RowData;
  skiErg: RowData;
}

export interface BestByMonthsIF {
  [key: number]: BestMonthIF
}
function App() {
  const DATE_FORMAT = "MMM D, YYYY";
  const bestsOfTheLastYear = useRef<BestByMonthsIF>({
    1: {
      name: 'January',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
    2: {
      name: 'February',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
    3: {
      name: 'March',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
    4: {
      name: 'April',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
    5: {
      name: 'May',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
    6: {
      name: 'June',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
    7: {
      name: 'July',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
    8: {
      name: 'August',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
    9: {
      name: 'September',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
    10: {
      name: 'October',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
    11: {
      name: 'November',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
    12: {
      name: 'December',
      year: 0,
      rowErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      bikeErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
      skiErg: {distance: 0, pace: '00:00.0', strokeRate: 0},
    },
  });

  const getFilteredRows = () => {
    const copy = clonedeep(unfilteredRowData);
    if (copy && copy.length) {
      return copy.filter((row: WorkoutRowType) => {
        // ignore any row that isn't a selected type
        if (!includeBike && row.type === 'BikeErg') {
          return;
        }
        if (!includeRower && row.type === 'RowErg') {
          return;
        }
        if (!includeSki && row.type === 'SkiErg') {
          return;
        }

        // ignore any row that is outside the date range
        if (isBefore(new Date(row.date), new Date(startDate)) || isAfter(new Date(row.date), new Date(endDate))) {
          return;
        }

        return row;
      })
    }
  }

  const getFilteredColumns = () => {
    return ALL_COLUMNS.filter((col: ColDef ) => {
      if (col.field === 'startTime' && includeStartTime) {
        return col;
      } else if (col.field === 'startTime' && !includeStartTime) {
        return;
      }

      if (col.field === 'totalCal' && includeTotalCal) {
        return col;
      } else if (col.field === 'totalCal' && !includeTotalCal) {
        return;
      }

      if (col.field === 'ranked' && includeRanked) {
        return col;
      } else if (col.field === 'ranked' && !includeRanked) {
        return;
      }

      if (col.field === 'dragFactor' && includeDragFactor) {
        return col;
      } else if (col.field === 'dragFactor' && !includeDragFactor) {
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
  const [minimumDuration, setMinimumDuration] = useState('60');

  const [hasRowErg, setHasRowErg] = useState(false);
  const [hasBikeErg, setHasBikeErg] = useState(false);
  const [hasSkiErg, setHasSkiErg] = useState(false);

  const [includeRower, setIncludeRower] = useState(true);
  const [includeBike, setIncludeBike] = useState(true);
  const [includeSki, setIncludeSki] = useState(true);
  const [includeStartTime, setIncludeStartTime] = useState(false);
  const [includeTotalCal, setIncludeTotalCal] = useState(false);
  const [includeRanked, setIncludeRanked] = useState(false);
  const [includeDragFactor, setIncludeDragFactor] = useState(false);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState<ColDef[]>(getFilteredColumns());
  const [unfilteredRowData, setUnfilteredRowData] = useState([]);
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [bests, setBests] = useState(bestsOfTheLastYear);

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
    setFilteredRowData(getFilteredRows());
  }, [unfilteredRowData, includeBike, includeRower, startDate, endDate])

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

  const handleCSVInput = (event: never) => {
    setFile(event);
  }

  type Months = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  type ErgType = 'rowErg' | 'skiErg' | 'bikeErg';
  const updateBests = (row: WorkoutRowType) => {
    const month = getMonthNumber(row.date) as Months;
    if (bestsOfTheLastYear.current[month]) {
      bestsOfTheLastYear.current[month].year = getRowYear(row.date);

      const ergType = row.type as ErgType;
      if (ergType) {
        if (row.workDistance > bestsOfTheLastYear.current[month][ergType].distance) {
          bestsOfTheLastYear.current[month][ergType].distance = row.workDistance;
        }

        if (row.workDistance > bestsOfTheLastYear.current[month][ergType].distance) {
          bestsOfTheLastYear.current[month][ergType].distance = row.workDistance;
        }

        // if milliseconds > 0 or pace as parsed to ms       2:34.7 user sees a string
        if (parseTimeToMilliseconds(row.pace) > parseTimeToMilliseconds(bestsOfTheLastYear.current[month][ergType].pace)) {
          bestsOfTheLastYear.current[month][ergType].pace = row.pace;
        }

        if (row.strokeRate > bestsOfTheLastYear.current[month][ergType].strokeRate) {
          bestsOfTheLastYear.current[month][ergType].strokeRate = row.strokeRate;
        }
      }

    }
  }

  const updateErgTypes = (ergType: string) => {
    if (!hasRowErg && ergType === 'rowErg') {
      setHasRowErg(true);
    }

    if (!hasBikeErg && ergType === 'bikeErg') {
      setHasBikeErg(true);
    }

    if (!hasSkiErg && ergType === 'skiErg') {
      setHasSkiErg(true);
    }
  }

  const parseCSVIntoChartData = (csvFile: unknown) => {
    Papa.parse(csvFile, {
      complete: function(results: unknown) {
        results.data.shift();
        const allRowData = results.data.filter((row: (string|number)[]) => {
          return row.length > 1;
        }).map((row: (string|number)[]) => {
          const ergType = String(row[19]).charAt(0).toLowerCase() + String(row[19]).slice(1);
          updateErgTypes(ergType);

          const rowData = {
            date: getFormattedDate(String(row[1])),
            startTime: getFormattedTime(String(row[1])),
            type: ergType,
            description: String(row[2]),
            pace: String(row[11]), // example: 2:37.4
            workTime: getFormattedDuration(Number(row[4])),
            restTime: getFormattedDuration(Number(row[6])),
            workDistance: getFormattedDistance(row[7]),
            restDistance: getFormattedDistance(row[8]),
            strokeRate: Number(row[9]),
            strokeCount: Number(row[10]),
            totalCal: `${row[14]} (${row[13]} cal/hr)`,
            avgHeartRate: Number(row[15]),
            dragFactor: Number(row[16]),
            ranked: Boolean(row[20]),
            id: String(row[0]),
          }
          updateBests(rowData);
          //rowData.type = row[19];
          return rowData;
        });

        setBests(bestsOfTheLastYear);
        setUnfilteredRowData(allRowData);
      }
    });
  }

  const UploadFile = () => (
    <form onSubmit={parseCSVIntoChartData}>
      <Flex
        className={"upload-file pad-bottom"}
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
    <h2 className={'main-page-title'}>Filter data</h2>
      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="wrap"
      >
        <Chip
          checked={includeRower && hasRowErg}
          disabled={!hasRowErg}
          onChange={() => setIncludeRower((v) => !v)}>
          RowErg
        </Chip>

        <Chip checked={includeBike && hasBikeErg} disabled={!hasBikeErg} onChange={() => setIncludeBike(v => !v)}>
            BikeErg
        </Chip>

        <Chip checked={includeSki && hasSkiErg} disabled={!hasSkiErg} onChange={() => setIncludeSki(v => !v)}>
            SkiErg
        </Chip>
      </Flex>

      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        wrap="wrap"
        className={"filter-data"}
      >
        <form onSubmit={handleSubmit(onSubmitFiltersForm)}>
          <DateInput value={startDate} onChange={() => setStartDate} label={"Start"} valueFormat={DATE_FORMAT}/>
          <DateInput value={endDate} onChange={() => setEndDate} label={"End"} valueFormat={DATE_FORMAT}/>

          <NativeSelect
            label={"Exclude workouts shorter than..."}
            value={minimumDuration}
            onChange={(event) => setMinimumDuration(event.currentTarget.value)}
            data={[
              { label: '30 seconds', value: '30' },
              { label: '1 minute', value: '60' },
              { label: '5 minutes', value: '300' },
              { label: '10 minutes', value: '600' },
            ]}
          />
        </form>
      </Flex>

      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
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

  const gridOptions: GridOptions = {
    getRowStyle: getRowStyleErgType
  }

  function getRowStyleErgType(item: WorkoutDataType) {
    if (item.data.type === 'rowErg') {
      return {
        'backgroundColor': '#afbd22', //'#455A64',
        'color': '#F4F8F5'
      }
    } else if (item.data.type === 'bikeErg') {
      return {
        'backgroundColor': '#003A70', //'#4CAF50',
        'color': '#F4F8F5'
      };
    }
    return null;
  }

  const ResultsTable = () => (
    <>
      <div
        className="ag-theme-quartz" // applying the grid theme
        style={{ height: 600 }} // expand grid to fit parent container
      >
        <AgGridReact
          rowData={filteredRowData}
          columnDefs={colDefs}
          gridOptions={gridOptions}
        />
      </div>
    </>
  );

  return (
    <MantineProvider defaultColorScheme="dark">
      <div className={"app-container"}>
      <h2>C2 Erg Best</h2>
        <Grid className={"pad-left"}>
          <Grid.Col span={12}>
            <UploadFile />
            <Divider/>
            <SearchFilters />
            {filteredRowData &&
                <>
                    Showing {filteredRowData.length} of {unfilteredRowData.length} workouts
                </>
            }
            <ResultsTable/>

            <h2 className={'main-page-title'}>Bests</h2>

            <Flex
              mih={50}
              gap="md"
              justify="flex-start"
              align="flex-start"
              direction="row"
              wrap="wrap"
            >
            <MonthCards bests={bests.current}/>
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
