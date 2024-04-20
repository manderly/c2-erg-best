import {Card, Divider, Flex} from "@mantine/core";
import {isCurrentMonth} from "../services/formatting_utils";
import {BestDataIF, BestIF, BestMonthIF} from "../App.tsx";
import _ from 'lodash';

interface MonthCardsIF {
  bests: object,
  hasRowErg: boolean,
  hasBikeErg: boolean,
  hasSkiErg: boolean,
}

const ViewWorkoutLink = (id: string) => (
  <div className='pull-right'>
    <a className={'view-workout-link'} href={id}>View workout</a>
  </div>
);

interface DisplayBestDataIF {
  label: string,
  data: BestIF,
}

const DisplayBestPace = ({data, distanceUnits}) => (
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

const DisplayBestDistance = ({data}) => (
  <div className={'best-data'}>
    <Flex justify="space-between">
      <strong>Distance</strong>
      <ViewWorkoutLink id={data.workoutId}/>
    </Flex>
    <Divider/>
    <div className={'best-data-value'}>{`${data.value} m`}</div>
    <div className={'tiny-date'}>on {data.date}</div>
  </div>
)

const DisplayBestStroke = ({data, strokeUnits}) => (
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
    <h3 className={'pad-bottom'}>{data.year === 0 ? 'No data yet' : data.year}</h3>
    {hasRowErg && <ErgData label='RowErg' data={data.rowErg} distanceUnits="500" strokeUnits='per min'/>}
    {hasBikeErg && <ErgData label='BikeErg' data={data.bikeErg} distanceUnits='1000' strokeUnits='rpm'/>}
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