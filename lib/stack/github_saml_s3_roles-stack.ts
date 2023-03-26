import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { KaitoStack, KaitoStackProps } from '@meta-search/kaito-cdk-construct';
import path = require('path');

export interface GithubSamlS3RoleStackProps extends KaitoStackProps {
  readonly s3BucketArns: string[];
}

export class GithubSamlS3RoleStack extends KaitoStack {
  readonly samlS3Role: iam.IRole;

  constructor(scope: Construct, id: string, props: GithubSamlS3RoleStackProps) {
    super(scope, id, props);

    // Downloaded from: https://saml.to/metadata
    const metadataPath = path.join(__dirname, '..', '..', 'saml.to-MetaSearch-IO-metadata.xml');

    // Follow https://github.com/marketplace/actions/saml-to-assume-aws-role to create provider and role
    const provider = new iam.SamlProvider(this, 'SamlProvider', {
      metadataDocument: iam.SamlMetadataDocument.fromFile(metadataPath),
    });

    this.samlS3Role = new iam.Role(this, 'SamlS3Role', {
      // See: https://github.com/saml-to/assume-aws-role-action/blob/main/README.md#configuration
      assumedBy: new iam.SamlConsolePrincipal(provider, {
        StringEquals: {
          'SAML:aud': 'https://signin.aws.amazon.com/saml',
        },
      }),
      inlinePolicies: {
        // Allow push to codeartifact domain
        CodeArtifactDomainAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['s3:*'],
              resources: [
                ...props.s3BucketArns.map((arn) => arn),
                ...props.s3BucketArns.map((arn) => `${arn}/*`),
              ],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
    });
  }
}
