import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { KaitoStack, KaitoStackProps, CodeArtifactConstruct } from '@meta-search/kaito-cdk-construct';
import { Domain } from 'cdk-codeartifact';
import * as path from 'path';

/**
 * Currently AWS has no L2 constructs for codeartifact service, we will utilized
 * a community contributed one from Construct Hub:
 * https://constructs.dev/packages/cdk-codeartifact/v/1.0.1?lang=typescript
 */
export class CodeArtifactStack extends KaitoStack {
  readonly samlProviderRole: iam.Role;

  readonly codeArtifactDomain: Domain;

  constructor(scope: Construct, id: string, props: KaitoStackProps) {
    super(scope, id, props);

    if (props.env.stage === 'dev') {
      // Downloaded from: https://saml.to/metadata
      const metadataPath = path.join(__dirname, '..', '..', 'saml.to-MetaSearch-IO-metadata.xml');

      const codeArtifactConstruct = new CodeArtifactConstruct(
        this,
        id,
        iam.SamlMetadataDocument.fromFile(metadataPath),
      );

      this.samlProviderRole = codeArtifactConstruct.samlProviderRole;
      this.codeArtifactDomain = codeArtifactConstruct.codeArtifactDomain;
    }
  }
}
