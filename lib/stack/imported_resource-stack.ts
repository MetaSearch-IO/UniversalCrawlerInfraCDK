import { KaitoStack, KaitoStackProps } from '@meta-search/kaito-cdk-construct';
import { Construct } from 'constructs';
import { CfnParameter } from 'aws-cdk-lib';
import { cfnOutputPropsGroups } from '../cfn_output_props_group';

export class ImportedResourceStack extends KaitoStack {
  readonly kaitoDataKnowledgeAssetBucketArn: string;

  constructor(scope: Construct, id: string, props: KaitoStackProps) {
    super(scope, id, props);

    const parameters = Object.fromEntries(
      Object.entries(cfnOutputPropsGroups).map(([name, cfnOutputPropsGroup]) => [
        name,
        new CfnParameter(this, cfnOutputPropsGroup[props.env.stage].parameterName),
      ]),
    );

    this.kaitoDataKnowledgeAssetBucketArn = parameters.kaitoDataKnowledgeAssetBucketArn.valueAsString;
  }
}
