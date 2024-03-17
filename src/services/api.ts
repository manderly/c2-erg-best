import Axios from 'axios';

const logbookChallenges = 'https://log.concept2.com';
//const apiKey = process.env.C2_API_KEY;

export const getUpcomingChallenges = async (days: number) => {
  //const result = await Axios.get(`${logbookChallenges}/api/challenges/upcoming/${days}`);
  //return result.data;
  return {
    "data": [
      {
        "key": "april-fools",
        "name": "April Fools'",
        "season": 2024,
        "start": "2024-04-01",
        "end": "2024-04-15",
        "activity": "Row/Ski/Ride",
        "category": "Individual",
        "description": "Complete an increasing distance every day from April 1 to April 15.",
        "short_description": null,
        "link": "https://log.concept2.com/challenges/april-fools",
        "image": "https://media.concept2.com/assets/challenges/april-fools/2024/images/large/aprilfools-web-2024.png"
      }
    ]
  };
}