import { DeploymentEnvironment, GithubRepo, PagerdutyIntegrationProps } from '@meta-search/kaito-cdk-construct';

export const CDK_REPO: GithubRepo = {
  orgName: 'MetaSearch-IO',
  repoName: 'UniversalCrawlerInfraCDK',
  gitHubRepoString: 'MetaSearch-IO/UniversalCrawlerInfraCDK',
  branch: 'main',
};

export const DEPLOYMENT_ENVIRONMENTS: DeploymentEnvironment[] = [
  {
    stage: 'dev',
    account: '487449276418',
    region: 'us-west-2',
  },
  {
    stage: 'prod',
    account: '527399016197',
    region: 'us-west-2',
  },
];

export const PAGERDUTY_INTEGRATION_PROPS: Record<string, PagerdutyIntegrationProps[]> = {
  dev: [
    {
      name: 'UnifiedCrawler',
      integrationUrl: 'https://events.pagerduty.com/integration/4164999626994b0ed06f060a81b532fb/enqueue',
    },
    {
      name: 'Pipeline',
      integrationUrl: 'https://events.pagerduty.com/integration/ab6d9ed5a26f4e09d0a140c185e74b4f/enqueue',
    },
  ],
  prod: [
    {
      name: 'UnifiedCrawler',
      integrationUrl: 'https://events.pagerduty.com/integration/10a02ddf369e4804c0752de702c4d823/enqueue',
    },
  ],
};
