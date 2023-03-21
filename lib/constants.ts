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
      name: 'MetaSearch',
      integrationUrl: 'https://events.pagerduty.com/integration/3c76b0d641d34e0ac0cb7f463c7f111c/enqueue',
    },
    {
      name: 'Pipeline',
      integrationUrl: 'https://events.pagerduty.com/integration/ab6d9ed5a26f4e09d0a140c185e74b4f/enqueue',
    },
    {
      name: 'Opensearch',
      integrationUrl: 'https://events.pagerduty.com/integration/814e663cd7774d01c03c4db1adef7edc/enqueue',
    },
  ],
  prod: [
    {
      name: 'MetaSearch',
      integrationUrl: 'https://events.pagerduty.com/integration/f9003982c91a4108c05ef5b50ddebe72/enqueue',
    },
    {
      name: 'Opensearch',
      integrationUrl: 'https://events.pagerduty.com/integration/9815641832cd480dd0f8e99393848358/enqueue',
    },
  ],
};
