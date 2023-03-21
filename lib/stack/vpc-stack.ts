import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { KaitoStack, KaitoStackProps, VpcConstruct } from '@meta-search/kaito-cdk-construct';

export class VpcStack extends KaitoStack {
  readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: KaitoStackProps) {
    super(scope, id, props);

    const vpcConstruct = new VpcConstruct(this, id, { stackPrefix: props.stackPrefix });

    this.vpc = vpcConstruct.vpc;
  }
}
