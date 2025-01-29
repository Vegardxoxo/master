// placeholder data

import { Home, Settings } from "lucide-react";
import { Payment, repositoryOverview } from "@/app/lib/definitions";

// export const studentRepos = [
//   { owner: "Vegardxoxo", repo: "bachelor_project" },
//   { owner: "Vegardxoxo", repo: "tail" },
//   { owner: "Vegardxoxo", repo: "nextjs-blog" },
//   { owner: "Vegardxoxo", repo: "master" },
// ];

export const getRepos = () => {
  const repos: { owner: string; repo: string }[] = [];
  for (let i = 1; i < 15; i++) {
    const owner = "IT2810-H24";
    const repo = `T${i < 10 ? `0${i}` : i}-Project-2`;
    repos.push({ owner, repo });
  }
  return repos;
};
const a = getRepos();
console.log(a)

export const studentRepos = [
  { owner: "IT2810-H24", repo: "T01-Project-2" },
  { owner: "IT2810-H24", repo: "T02-Project-2" },
  { owner: "IT2810-H24", repo: "T03-Project-2" },
  { owner: "IT2810-H24", repo: "T04-Project-2" },
];

export const courses = [
  {
    name: "WebDev",
    slug: "webdev",
  },
  {
    name: "ITGK",
    slug: "itgk",
  },
  {
    name: "Maskinlæring",
    slug: "Maskinlaering",
  },
];

export const links = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "About",
    href: "/about",
    icon: Settings,
  },
];

export async function getData(): Promise<Payment[]> {
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "A@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "AA@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "c@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "b@example.com",
    },
  ];
}

export async function getDummyRepoData(): Promise<repositoryOverview[]> {
  return [
    {
      name: "Repo1",
      contributors: ["Vegardxoxo", "JohnDoe", "JohnDoe", "JohnDoe"],
      openIssues: 5,
      url: "https://github.com/Vegardxoxo/Repo1",
    },
    {
      name: "Repo2",
      contributors: ["JaneDoe", "Alice"],
      openIssues: 3,
      url: "https://github.com/Vegardxoxo/Repo2",
    },
    {
      name: "Repo3",
      contributors: ["Bob", "Charlie"],
      openIssues: 8,
      url: "https://github.com/Vegardxoxo/Repo3",
    },
    {
      name: "Repo4",
      contributors: ["Dave", "Eve"],
      openIssues: 2,
      url: "https://github.com/Vegardxoxo/Repo4",
    },
    {
      name: "Repo5",
      contributors: ["Frank", "Grace"],
      openIssues: 7,
      url: "https://github.com/Vegardxoxo/Repo5",
    },
    {
      name: "Repo6",
      contributors: ["Heidi", "Ivan"],
      openIssues: 1,
      url: "https://github.com/Vegardxoxo/Repo6",
    },
    {
      name: "Repo7",
      contributors: ["Judy", "Mallory"],
      openIssues: 4,
      url: "https://github.com/Vegardxoxo/Repo7",
    },
    {
      name: "Repo8",
      contributors: ["Niaj", "Olivia"],
      openIssues: 6,
      url: "https://github.com/Vegardxoxo/Repo8",
    },
    {
      name: "Repo9",
      contributors: ["Peggy", "Sybil"],
      openIssues: 9,
      url: "https://github.com/Vegardxoxo/Repo9",
    },
    {
      name: "Repo10",
      contributors: ["Trent", "Victor"],
      openIssues: 0,
      url: "https://github.com/Vegardxoxo/Repo10",
    },
    {
      name: "Repo11",
      contributors: ["Walter", "Xena"],
      openIssues: 5,
      url: "https://github.com/Vegardxoxo/Repo11",
    },
    {
      name: "Repo12",
      contributors: ["Yvonne", "Zara"],
      openIssues: 3,
      url: "https://github.com/Vegardxoxo/Repo12",
    },
    {
      name: "Repo13",
      contributors: ["Adam", "Brian"],
      openIssues: 8,
      url: "https://github.com/Vegardxoxo/Repo13",
    },
    {
      name: "Repo14",
      contributors: ["Cathy", "Derek"],
      openIssues: 2,
      url: "https://github.com/Vegardxoxo/Repo14",
    },
    {
      name: "Repo15",
      contributors: ["Ethan", "Fiona"],
      openIssues: 7,
      url: "https://github.com/Vegardxoxo/Repo15",
    },
    {
      name: "Repo16",
      contributors: ["George", "Hannah"],
      openIssues: 1,
      url: "https://github.com/Vegardxoxo/Repo16",
    },
    {
      name: "Repo17",
      contributors: ["Isaac", "Jack"],
      openIssues: 4,
      url: "https://github.com/Vegardxoxo/Repo17",
    },
    {
      name: "Repo18",
      contributors: ["Karen", "Liam"],
      openIssues: 6,
      url: "https://github.com/Vegardxoxo/Repo18",
    },
    {
      name: "Repo19",
      contributors: ["Mona", "Nate"],
      openIssues: 9,
      url: "https://github.com/Vegardxoxo/Repo19",
    },
    {
      name: "Repo20",
      contributors: ["Oscar", "Paul"],
      openIssues: 0,
      url: "https://github.com/Vegardxoxo/Repo20",
    },
  ];
}
