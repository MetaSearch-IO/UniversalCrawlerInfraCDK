import { Construct } from 'constructs';
import { DEPLOYMENT_ENVIRONMENTS } from './constants';
import { CodeArtifactStack } from './stack/code_artifact-stack';
import { SlackChannelConfigurationStack } from './stack/slack_channel_config-stack';
import { VpcStack } from './stack/vpc-stack';
import { GithubOIDCRolesAndBucketStack } from './stack/github_oidc_roles_and_bucket-stack';
import { PagerdutyServiceStack } from './stack/pagerduty_service-stack';

export interface DeploymentGroup {
  readonly codeArtifactStack: CodeArtifactStack;
  readonly vpcStack: VpcStack;
  readonly slackChannelConfigurationStack: SlackChannelConfigurationStack;
  readonly githubOIDCRolesAndBucketStack: GithubOIDCRolesAndBucketStack;
  readonly pagerdutyServiceStack: PagerdutyServiceStack;
}

export const stageToDeploymentGroup = (scope: Construct): Record<string, DeploymentGroup> =>
  Object.fromEntries(
    DEPLOYMENT_ENVIRONMENTS.map((env) => {
      const disambiguator = env.disambiguator ?? env.stage;
      const stackPrefix = `${disambiguator}-${env.region.replace(/-/g, '')}`;

      // Eventually, only when stage is dev, codeArtifactStack is created
      const codeArtifactStack = new CodeArtifactStack(scope, `${stackPrefix}-CodeArtifactStack`, {
        env,
        stackPrefix,
      });

      const vpcStack = new VpcStack(scope, `${stackPrefix}-VpcStack`, {
        env,
        stackPrefix,
      });

      const slackChannelConfigurationStack = new SlackChannelConfigurationStack(
        scope,
        `${stackPrefix}-SlackChannelConfigurationStack`,
        {
          env,
          stackPrefix,
        },
      );

      const githubOIDCRolesAndBucketStack = new GithubOIDCRolesAndBucketStack(
        scope,
        `${stackPrefix}-GithubOIDCRolesAndBucketStack`,
        {
          env,
          stackPrefix,
        },
      );

      const pagerdutyServiceStack = new PagerdutyServiceStack(scope, `${stackPrefix}-PagerdutyServiceStack`, {
        env,
        stackPrefix,
      });

      return [
        env.stage,
        {
          codeArtifactStack,
          vpcStack,
          slackChannelConfigurationStack,
          githubOIDCRolesAndBucketStack,
          pagerdutyServiceStack,
        },
      ];
    }),
  );
