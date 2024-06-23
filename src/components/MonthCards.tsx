import {Card, Divider, Flex} from "@mantine/core";
import {getFormattedDistanceString, isCurrentMonth} from "../services/formatting_utils";
import _ from 'lodash';
import {BestDataIF, BestIF, BestMonthIF} from "../types/types.ts";

interface MonthCardsIF {
  bests: object,
  hasRowErg: boolean,
  hasBikeErg: boolean,
  hasSkiErg: boolean,
}

interface ViewWorkoutLinkIF {
  id: string;
}

const ViewWorkoutLink = ({ id }: ViewWorkoutLinkIF) => (
  <div className='pull-right'>
    <a className={'view-workout-link'} href={id}>View workout</a>
  </div>
);

interface DisplayBestPaceIF {
  data: BestIF;
  distanceUnits: string;
}

const DisplayBestPace = ({data, distanceUnits}: DisplayBestPaceIF) => (
  <div className={'best-data'}>
  <Flex justify="space-between">
    <strong>Pace</strong>
    <ViewWorkoutLink id={data.workoutId}/>
  </Flex>
  <Divider/>
  <div className={'best-data-value'}>{`${data.value} / ${distanceUnits}m`}</div>
  <div className={'tiny-date'}>on {data.date}</div>
  </div>
)

interface DisplayBestDistanceIF {
  data: BestIF;
}

const DisplayBestDistance = ({data}: DisplayBestDistanceIF) => (
  <div className={'best-data'}>
    <Flex justify="space-between">
      <strong>Distance</strong>
      <ViewWorkoutLink id={data.workoutId}/>
    </Flex>
    <Divider/>
    <div className={'best-data-value'}>{`${getFormattedDistanceString(data.value)}`}</div>
    <div className={'tiny-date'}>on {data.date}</div>
  </div>
)

interface DisplayBestStrokeIF {
  data: BestIF;
  strokeUnits: string;
}

const DisplayBestStroke = ({data, strokeUnits}: DisplayBestStrokeIF) => (
  <div className={'best-data'}>
    <Flex justify="space-between">
      <strong>Stroke</strong>
      <ViewWorkoutLink id={data.workoutId}/>
    </Flex>
    <Divider/>
    <div className={'best-data-value'}>{`${data.value} ${strokeUnits}`}</div>
    <div className={'tiny-date'}>on {data.date}</div>
  </div>
)


interface ErgDataIF {
  label: string,
  data: BestDataIF,
  distanceUnits?: string,
  strokeUnits?: string,
}
const ErgData = ({label, data, distanceUnits = '500', strokeUnits = 'per min.'}: ErgDataIF) => (
  data && <>
      <strong className={`erg-type-label ${label}-label`}>{label}</strong>
      <ul>
        <li><DisplayBestPace data={data.bestPace} distanceUnits={distanceUnits}/></li>
        <li><DisplayBestDistance data={data.bestDistance}/></li>
        <li><DisplayBestStroke data={data.bestStroke} strokeUnits={strokeUnits}/></li>
      </ul>
    </>
)

interface IndividualCardIF {
  month: string,
  data: BestMonthIF,
  hasRowErg: boolean,
  hasBikeErg: boolean,
  hasSkiErg: boolean,
}

const IndividualCard = ({month, data, hasRowErg, hasBikeErg, hasSkiErg}: IndividualCardIF) => (
  <Card className={`month-card ${isCurrentMonth(month) ? 'current-month' : ''}`}>
    <h2>{data.name}</h2>
    <h4 className={'pad-bottom'}>{data.year === 0 ? 'No data yet' : data.year}</h4>
    {hasRowErg && <ErgData label='RowErg' data={data.rowErg} distanceUnits="500" strokeUnits='per min'/>}
    {hasBikeErg && <ErgData label='BikeErg' data={data.bikeErg} distanceUnits='1,000' strokeUnits='rpm'/>}
    {hasSkiErg && <ErgData label='SkiErg' data={data.skiErg}/>}
  </Card>
);

export const MonthCards: React.FC<MonthCardsIF> = ({bests, hasRowErg, hasBikeErg, hasSkiErg }) => {
  const sorted = _.orderBy((bests), 'date');
  return <>
    {Object.entries(sorted).map(([key, value]) => (
      <IndividualCard key={`month-${key}`} month={key} data={value} hasRowErg={hasRowErg} hasBikeErg={hasBikeErg} hasSkiErg={hasSkiErg} />
    ))}
  </>
};