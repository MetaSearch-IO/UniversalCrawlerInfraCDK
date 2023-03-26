import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  accountToGithubConnectionArn,
  CdkCodebuildAction,
  GithubSourceAction,
  KaitoCloudFormationCreateUpdateStackAction,
  KaitoPipeline,
  PipelineDeploymentAccounts,
  cdkCodeBuildImportedCfnOutputJson,
} from '@meta-search/kaito-cdk-construct';
import { DeploymentGroup, stageToDeploymentGroup } from './deployment_group';
import { DEPLOYMENT_ENVIRONMENTS, CDK_REPO } from './constants';
import { cfnOutputPropsGroups } from './cfn_output_props_group';

export class UniversalCrawlerInfraPipeline extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const developmentGroups: Record<string, DeploymentGroup> = stageToDeploymentGroup(scope);

    const pipelineDeploymentAccount = props.env!.account! as PipelineDeploymentAccounts;

    const pipeline = new KaitoPipeline(this, 'UniversalCrawlerInfraPipeline', {
      pipelineName: 'UniversalCrawlerInfraPipeline',
      account: pipelineDeploymentAccount,
      crossAccountKeys: true,
    });

    // Add the target accounts to the pipeline policy
    pipeline.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: DEPLOYMENT_ENVIRONMENTS.map((env) => `arn:aws:sts::${env.account}:role/*`),
      }),
    );

    const githubSourceAction = new GithubSourceAction({
      githubRepo: CDK_REPO,
      connectionArn: accountToGithubConnectionArn[pipelineDeploymentAccount],
    });
    pipeline.addStage({
      stageName: 'Source',
      actions: [githubSourceAction],
    });

    const cdkBuildAction = new CdkCodebuildAction(this, {
      environmentsWithPublishAssetsPermission: DEPLOYMENT_ENVIRONMENTS,
      input: githubSourceAction.output,
      environmentToCfnOutputProps: Object.fromEntries(
        DEPLOYMENT_ENVIRONMENTS.map((env) => [
          env.stage,
          Object.values(cfnOutputPropsGroups).map((cfnOutputPropsGroup) => cfnOutputPropsGroup[env.stage]),
        ]),
      ),
    });
    pipeline.addStage({
      stageName: 'CDK-CodeBuild',
      actions: [cdkBuildAction],
    });

    // Make pipeline self-mutating
    const selfMutatingAction = new KaitoCloudFormationCreateUpdateStackAction({
      account: pipelineDeploymentAccount,
      actionName: 'Pipeline-Update',
      stackName: id,
      input: cdkBuildAction.output,
    });
    pipeline.addStage({
      stageName: 'UpdatePipeline',
      actions: [selfMutatingAction],
    });

    /**
     * Construct a Record Mapping DeploymentStage To CloudFormationCreateUpdateStackAction Array
     * Each CloudFormationCreateUpdateStackAction Array contains the actions of all stacks
     */
    const deploymentStageToCloudFormationCreateUpdateStackAction: Record<
      string,
      KaitoCloudFormationCreateUpdateStackAction[]
    > = Object.fromEntries(
      DEPLOYMENT_ENVIRONMENTS.map((deploymentEnvironment) => {
        const importedResourceStackAction = new KaitoCloudFormationCreateUpdateStackAction({
          account: deploymentEnvironment.account,
          stackName: developmentGroups[deploymentEnvironment.stage].importedResourceStack.stackName,
          actionName: 'ImportedResourceStackAction',
          input: cdkBuildAction.output,
          templateConfiguration: cdkBuildAction.output.atPath(
            `${deploymentEnvironment.stage}_${cdkCodeBuildImportedCfnOutputJson}`,
          ),
        });

        const codeArtifactCfnAction = new KaitoCloudFormationCreateUpdateStackAction({
          account: deploymentEnvironment.account,
          stackName: developmentGroups[deploymentEnvironment.stage].codeArtifactStack!.stackName,
          actionName: 'CodeArtifactCfnAction',
          input: cdkBuildAction.output,
        });

        const vpcCfnAction = new KaitoCloudFormationCreateUpdateStackAction({
          account: deploymentEnvironment.account,
          stackName: developmentGroups[deploymentEnvironment.stage].vpcStack.stackName,
          actionName: 'VpcCfnAction',
          input: cdkBuildAction.output,
        });

        const slackChannelConfigurationCfnAction = new KaitoCloudFormationCreateUpdateStackAction({
          account: deploymentEnvironment.account,
          stackName: developmentGroups[deploymentEnvironment.stage].slackChannelConfigurationStack.stackName,
          actionName: 'SlackChannelConfigurationCfnAction',
          input: cdkBuildAction.output,
        });

        const githubOIDCRolesAndBucketStackAction = new KaitoCloudFormationCreateUpdateStackAction({
          account: deploymentEnvironment.account,
          stackName: developmentGroups[deploymentEnvironment.stage].githubOIDCRolesAndBucketStack.stackName,
          actionName: 'GithubOIDCRolesAndBucketStackAction',
          input: cdkBuildAction.output,
        });

        const pagerdutyServiceStackAction = new KaitoCloudFormationCreateUpdateStackAction({
          account: deploymentEnvironment.account,
          stackName: developmentGroups[deploymentEnvironment.stage].pagerdutyServiceStack.stackName,
          actionName: 'PagerdutyServiceStackAction',
          input: cdkBuildAction.output,
        });

        const githubSamlS3RoleStackAction = new KaitoCloudFormationCreateUpdateStackAction({
          account: deploymentEnvironment.account,
          stackName: developmentGroups[deploymentEnvironment.stage].githubSamlS3RoleStack.stackName,
          actionName: 'GithubSamlS3RoleStackAction',
          input: cdkBuildAction.output,
          runOrder: 2,
        });

        return [
          deploymentEnvironment.stage,
          [
            importedResourceStackAction,
            codeArtifactCfnAction,
            vpcCfnAction,
            slackChannelConfigurationCfnAction,
            githubOIDCRolesAndBucketStackAction,
            pagerdutyServiceStackAction,
            githubSamlS3RoleStackAction,
          ],
        ];
      }),
    );

    pipeline.addStage({
      stageName: 'UniversalCrawlerDev-Deployment',
      actions: deploymentStageToCloudFormationCreateUpdateStackAction.dev,
    });

    pipeline.addStage({
      stageName: 'UniversalCrawlerProd-Deployment',
      actions: deploymentStageToCloudFormationCreateUpdateStackAction.prod,
    });
  }
}
