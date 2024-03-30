import {Card, Divider, Flex} from "@mantine/core";
import {getFormattedDistanceString, isCurrentMonth} from "../services/formatting_utils";

interface MonthCardsIF {
  bests: object,
}

const ViewWorkoutLink = (id: string) => (
  <div>
    <a className={'view-workout-link'} href={id}>View workout</a>
  </div>
);

const BestData = ({label, value}) => (
  <div className={'best-data'}>
    <Flex justify="space-between">
      <strong>{label}</strong>
      <ViewWorkoutLink id={'abc'} className={'pull-right'}/>
    </Flex>
    <Divider />
    <div className={'best-data-value'}>{value}</div>
    <div className={'tiny-date'}>on 1/1/2024</div>
  </div>
);

const ErgData = ({label, data, distanceUnits = 500}) => (
  data.distance > 0 && <>
      <strong className={`erg-type-label ${label}-label`}>{label}</strong>
      <ul>
        <li><BestData label='Pace' value={`${data.pace} / ${distanceUnits}m`}/></li>
        <li><BestData label='Distance' value={getFormattedDistanceString(data.distance)}/></li>
        <li><BestData label='Stroke Rate' value={data.strokeRate}/></li>
      </ul>
    </>
)

const IndividualCard = ({month, data}) => (
  <Card className={`month-card ${isCurrentMonth(month) ? 'current-month' : ''}`}>
    <h2>{data.name}</h2>
    <h3 className={'pad-bottom'}>{data.year === 0 ? 'No data yet' : data.year}</h3>
    <ErgData label='RowErg' data={data.rowErg}/>
    <ErgData label='BikeErg' data={data.bikeErg} distanceUnits={1000}/>
    <ErgData label='SkiErg' data={data.skiErg}/>
  </Card>
);

export const MonthCards: React.FC<MonthCardsIF> = ({bests }) => {
  return <>
    {Object.entries(bests).map(([key, value]) => (
      <IndividualCard key={`month-${key}`} month={key} data={value} />
    ))}
  </>
};