import Axios from "axios";
import { upcomingChallenges } from "./localData";

const logbookChallenges = "https://log.concept2.com";
//const apiKey = process.env.C2_API_KEY;

const USE_LOCAL_DATA = true;

export const getUpcomingChallengesData = async (days: number) => {
  return USE_LOCAL_DATA
    ? upcomingChallenges
    : await Axios.get(`${logbookChallenges}/api/challenges/upcoming/${days}`); // .data ?
};

export const getResults = async (days: number) => {
  return USE_LOCAL_DATA
    ? upcomingChallenges
    : await Axios.get(`${logbookChallenges}/api/challenges/upcoming/${days}`); // .data ?
};
