import {
  KaitoStack,
  KaitoStackProps,
  PipelineDeploymentAccounts,
  UNIVERSAL_CRAWLER_PROD,
  SlackChannelConfigurationConstruct,
} from '@meta-search/kaito-cdk-construct';
import { Construct } from 'constructs';

export interface SlackChannelConfigurationStackProps extends KaitoStackProps {}

export class SlackChannelConfigurationStack extends KaitoStack {
  constructor(scope: Construct, id: string, props: SlackChannelConfigurationStackProps) {
    super(scope, id, props);

    if (props.env.stage === 'dev') {
      const slackChannelConfigurationConstruct = new SlackChannelConfigurationConstruct(this, id, {
        account: props.env.account as PipelineDeploymentAccounts,
        allowedAccounts: [UNIVERSAL_CRAWLER_PROD],
      });
    }
  }
}
