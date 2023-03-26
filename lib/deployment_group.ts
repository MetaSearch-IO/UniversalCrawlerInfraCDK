import { Construct } from 'constructs';
import { DEPLOYMENT_ENVIRONMENTS } from './constants';
import { CodeArtifactStack } from './stack/code_artifact-stack';
import { SlackChannelConfigurationStack } from './stack/slack_channel_config-stack';
import { VpcStack } from './stack/vpc-stack';
import { GithubOIDCRolesAndBucketStack } from './stack/github_oidc_roles_and_bucket-stack';
import { PagerdutyServiceStack } from './stack/pagerduty_service-stack';
import { ImportedResourceStack } from './stack/imported_resource-stack';
import { GithubSamlS3RoleStack } from './stack/github_saml_s3_roles-stack';

export interface DeploymentGroup {
  readonly importedResourceStack: ImportedResourceStack;
  readonly codeArtifactStack: CodeArtifactStack;
  readonly vpcStack: VpcStack;
  readonly slackChannelConfigurationStack: SlackChannelConfigurationStack;
  readonly githubOIDCRolesAndBucketStack: GithubOIDCRolesAndBucketStack;
  readonly pagerdutyServiceStack: PagerdutyServiceStack;
  readonly githubSamlS3RoleStack: GithubSamlS3RoleStack;
}

export const stageToDeploymentGroup = (scope: Construct): Record<string, DeploymentGroup> =>
  Object.fromEntries(
    DEPLOYMENT_ENVIRONMENTS.map((env) => {
      const disambiguator = env.disambiguator ?? env.stage;
      const stackPrefix = `${disambiguator}-${env.region.replace(/-/g, '')}`;

      const importedResourceStack = new ImportedResourceStack(
        scope,
        `${stackPrefix}-UniversalCrawlerInfra-ImportedResourceStack`,
        {
          env,
          stackPrefix,
        },
      );

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

      const githubSamlS3RoleStack = new GithubSamlS3RoleStack(scope, `${stackPrefix}-SamlS3RoleStack`, {
        env,
        stackPrefix,
        s3BucketArns: [importedResourceStack.kaitoDataKnowledgeAssetBucketArn],
      });

      return [
        env.stage,
        {
          importedResourceStack,
          codeArtifactStack,
          vpcStack,
          slackChannelConfigurationStack,
          githubOIDCRolesAndBucketStack,
          pagerdutyServiceStack,
          githubSamlS3RoleStack,
        },
      ];
    }),
  );
