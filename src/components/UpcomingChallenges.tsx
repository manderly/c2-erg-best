import {Paper, Pill, Text} from "@mantine/core";
import {formatDistanceToNow} from "date-fns";
import {useEffect, useState} from "react";
import {getUpcomingChallengesData} from "../services/api";

export const UpcomingChallenges: React.FC = () => {
  const gradient =
    'linear-gradient(45deg, #003470 0%, #001122 100%)';
  type UpcomingChallengesType = {
    data: object[];
  }

  const [upcomingChallengesData, setUpcomingChallengesData] = useState<UpcomingChallengesType>({data: []});

  const getUpcomingChallengesDataFromAPI = async () => {
    setUpcomingChallengesData(await getUpcomingChallengesData(30));
  }

  useEffect(() => {
    void getUpcomingChallengesDataFromAPI();
  }, []);

  return (<>
    <h2>Upcoming Challenges</h2>
    <Paper shadow="xs" p="md">
      {upcomingChallengesData.data.map((item) =>
        <div key={item.key}>
          <Text>{item.name}</Text>
          <label>{item.description}</label>
          <Pill styles={{root: {backgroundImage: gradient}}}>{formatDistanceToNow(new Date(item.end))} remaining</Pill>
        </div>)
      }
    </Paper>
  </>)
};