import { Construct } from 'constructs';
import { KaitoStack, KaitoStackProps, GithubOIDCRolesAndBucketConstruct } from '@meta-search/kaito-cdk-construct';

export class GithubOIDCRolesAndBucketStack extends KaitoStack {
  constructor(scope: Construct, id: string, props: KaitoStackProps) {
    super(scope, id, props);

    const githubOIDCRolesAndBucketConstruct = new GithubOIDCRolesAndBucketConstruct(this, id, {
        env: props.env,
        stackPrefix: props.stackPrefix
    });
  }
}
