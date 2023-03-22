import { KaitoStack, KaitoStackProps, PagerdutyServiceConstruct } from '@meta-search/kaito-cdk-construct';
import { Construct } from 'constructs';
import { PAGERDUTY_INTEGRATION_PROPS } from '../constants';

export class PagerdutyServiceStack extends KaitoStack {
  constructor(scope: Construct, id: string, props: KaitoStackProps) {
    super(scope, id, props);

    const pagerdutyServiceConstruct = new PagerdutyServiceConstruct(this, id, {
      env: props.env,
      stackPrefix: props.stackPrefix,
      pagerdutyIntegrationPropsArray: PAGERDUTY_INTEGRATION_PROPS[props.env.stage],
    });

    pagerdutyServiceConstruct.pagerdutySubscriptions.forEach((pagerdutySubscription) => {
      this.cfnOutput(
        `${props.stackPrefix}-${pagerdutySubscription.name}-PagerdutySnsTopicArn`,
        pagerdutySubscription.snsTopic.topicArn,
      );
      this.cfnOutput(
        `${props.stackPrefix}-${pagerdutySubscription.name}-PagerdutySnsTopicName`,
        pagerdutySubscription.snsTopic.topicName,
      );
    });
  }
}
